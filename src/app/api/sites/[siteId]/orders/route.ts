import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getStoreContext, success, error, validationError, generateOrderNumber, logAudit, serverError } from "@/lib/api-helpers";
import { createOrderSchema } from "@/lib/validators";
import { unauthorized } from "@/lib/auth";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getBestActiveFlashSales, applyDiscount } from "@/lib/flash-sales";
import { runAutomationsForTrigger } from "@/lib/automations";
import { validateRedemption, joinLoyaltyProgram } from "@/lib/loyalty";
import { createSiteNotification } from "@/lib/notifications";
import { markAbandonedCartsRecovered } from "@/lib/abandoned-cart";


type Params = { params: Promise<{ siteId: string }> };

// GET /api/sites/:siteId/orders
export async function GET(req: NextRequest, { params }: Params) {
  const { siteId } = await params;
  const ctx = await getStoreContext(req, siteId);
  if (ctx.error) return ctx.user ? error(ctx.error, 403) : unauthorized();

  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const paymentStatus = url.searchParams.get("paymentStatus");
  const search = url.searchParams.get("search");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { siteId };
  if (status) where.status = status;
  if (paymentStatus) where.paymentStatus = paymentStatus;
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customer: { firstName: { contains: search, mode: "insensitive" } } },
      { customer: { lastName: { contains: search, mode: "insensitive" } } },
      { customer: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: where as any,
      include: {
        items: true,
        customer: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where: where as any }),
  ]);

  return success({
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

// POST /api/sites/:siteId/orders — create order (storefront checkout)
export async function POST(req: NextRequest, { params }: Params) {
  const { siteId } = await params;

  // Orders can be created by anyone (guest checkout)
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: { settings: true, deliveryZones: true },
  });
  if (!site) return error("Store not found", 404);

  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error.flatten().fieldErrors);

    const { items, deliveryAddress, deliveryZoneId, paymentMethod, couponCode, email, phone, firstName, lastName, note, redeemPoints, joinLoyalty } = parsed.data;

    // Resolve products and calculate prices
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, siteId, status: "ACTIVE" },
      include: { variants: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    let subtotal = 0;
    let taxableSubtotal = 0;

    // Look up active flash sales for these products once, up front — discount
    // math itself is reapplied per line item below so it respects variant
    // pricing, but which sale (and its rate) applies is decided here.
    const activeFlashSales = await getBestActiveFlashSales(
      siteId,
      products.map((p) => ({ id: p.id, price: Number(p.price) }))
    );
    const appliedFlashSaleIds = new Set<string>();

    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      let price = Number(product.price);
      let variantName: string | undefined;
      let variant: (typeof product.variants)[number] | undefined;

      if (item.variantId) {
        variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) throw new Error(`Variant ${item.variantId} not found`);
        if (variant.price) price = Number(variant.price);
        variantName = variant.name;
      }

      // Check stock — a variant product tracks stock per variant, not on
      // the parent product, so the check (and the decrement below) must
      // look at variant.stock when an item has a variantId. Previously this
      // always checked product.stock even for variant orders, meaning
      // variant-level stock was never actually enforced or decremented at
      // all — a merchant could set one variant to 0 in stock and customers
      // could still buy it indefinitely as long as some other variant kept
      // the parent product's own stock count above zero.
      if (product.trackInventory) {
        const availableStock = variant ? variant.stock : product.stock;
        if (availableStock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}${variantName ? ` (${variantName})` : ""}`);
        }
      }

      let originalPrice: number | undefined;
      let flashSaleId: string | undefined;
      const sale = activeFlashSales.get(item.productId);
      if (sale) {
        originalPrice = price;
        price = applyDiscount(price, sale.discountType, sale.discountValue);
        flashSaleId = sale.saleId;
        appliedFlashSaleIds.add(sale.saleId);
      }

      const lineTotal = price * item.quantity;
      subtotal += lineTotal;
      if (product.isTaxable) taxableSubtotal += lineTotal;

      return {
        productId: product.id,
        variantId: item.variantId || null,
        name: product.name,
        variantName,
        price,
        originalPrice,
        flashSaleId,
        quantity: item.quantity,
        total: lineTotal,
        image: undefined as string | undefined,
      };
    });

    // Delivery fee
    let deliveryFee = 0;
    if (deliveryZoneId) {
      const zone = site.deliveryZones.find((z) => z.id === deliveryZoneId);
      if (zone) {
        const zoneFreeAbove = zone.freeAbove ? Number(zone.freeAbove) : null;
        deliveryFee = zoneFreeAbove && subtotal >= zoneFreeAbove ? 0 : Number(zone.fee);
      }
    }

    // Coupon
    let discount = 0;
    let couponId: string | undefined;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { siteId_code: { siteId, code: couponCode.toUpperCase() } },
      });
      if (coupon && coupon.isActive) {
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return error("Coupon usage limit reached", 400);
        }
        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
          return error("Coupon has expired", 400);
        }
        const minAmount = coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null;
        if (minAmount && subtotal < minAmount) {
          return error(`Minimum order amount is ₦${minAmount}`, 400);
        }

        const couponValue = Number(coupon.value);
        if (coupon.type === "PERCENTAGE") {
          discount = subtotal * couponValue / 100;
        } else if (coupon.type === "FIXED") {
          discount = Math.min(couponValue, subtotal);
        } else if (coupon.type === "FREE_SHIPPING") {
          deliveryFee = 0;
        }
        couponId = coupon.id;
      }
    }

    // Tax — apply the site's default active tax rule, but only to the
    // portion of the subtotal that came from taxable products (a product's
    // "Taxable" toggle lets a merchant exempt specific items, e.g. digital
    // goods or already-tax-inclusive lines). Any coupon discount is spread
    // proportionally across taxable vs non-taxable lines so a store-wide
    // discount doesn't over- or under-tax either side.
    const defaultTax = await prisma.taxRule.findFirst({ where: { siteId, isDefault: true, isActive: true } });
    const taxRate = defaultTax ? Number(defaultTax.rate) : 0;
    const taxableDiscountShare = subtotal > 0 ? discount * (taxableSubtotal / subtotal) : 0;
    const taxableAmount = Math.max(taxableSubtotal - taxableDiscountShare, 0);
    const tax = taxRate > 0 ? Math.round(taxableAmount * (taxRate / 100) * 100) / 100 : 0;

    const total = subtotal + deliveryFee - discount + tax;

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { siteId_email: { siteId, email } },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { siteId, email, firstName, lastName, phone },
      });
    }

    // Explicit opt-in only — never silently enrolled by placing an order.
    if (joinLoyalty) {
      try { await joinLoyaltyProgram(siteId, customer.id); } catch (err) { console.error("Loyalty join error:", err); }
    }

    // Loyalty points redemption — priced into the order now, balance is only
    // actually deducted once payment succeeds (see finalizeOrderRedemption).
    let loyaltyDiscount = 0;
    let loyaltyPointsRedeemed = 0;
    if (redeemPoints && redeemPoints > 0) {
      const check = await validateRedemption(siteId, customer.id, redeemPoints);
      if (!check.ok) return error(check.message, 400);
      // Never let points discount an order below zero.
      loyaltyDiscount = Math.min(check.discount, subtotal + deliveryFee - discount);
      loyaltyPointsRedeemed = redeemPoints;
    }

    const finalTotal = Math.max(0, total - loyaltyDiscount);

    // Create order (with retry on unlikely order number collision)
    let attempts = 0;
    const lowStockHits: Array<{ id: string; name: string; stock: number; lowStockAlert: number }> = [];
    const createOrder = async (): Promise<any> => {
      attempts++;
      lowStockHits.length = 0; // reset in case of retry, so we don't double-report
      try {
        return await prisma.$transaction(async (tx) => {
      const ord = await tx.order.create({
        data: {
          siteId,
          customerId: customer!.id,
          orderNumber: generateOrderNumber(),
          email,
          phone,
          paymentMethod,
          subtotal,
          deliveryFee,
          discount,
          loyaltyDiscount,
          loyaltyPointsRedeemed,
          tax,
          total: finalTotal,
          currency: site.currency,
          couponId,
          note,
          deliveryAddress: deliveryAddress as any,
          deliveryZoneId,
          items: {
            create: orderItems,
          },
          timeline: {
            create: { status: "PENDING", note: "Order placed" },
          },
        },
        include: { items: true, customer: true },
      });

      // Update stock — atomically, guarded by the current stock still being
      // enough. The earlier pre-transaction check (above) is only a
      // fast-fail for the common case; it reads a snapshot taken before this
      // transaction started, so on its own it doesn't prevent two concurrent
      // checkouts for the last unit of something both succeeding. This
      // updateMany is the real guard: it only decrements if stock is still
      // sufficient at the moment of commit, and if not, the whole order
      // transaction throws and rolls back rather than allowing stock to go
      // negative. Decrements variant stock for variant items, product stock
      // otherwise — matching the check above.
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        if (!product.trackInventory) continue;

        if (item.variantId) {
          const guarded = await tx.productVariant.updateMany({
            where: { id: item.variantId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (guarded.count === 0) {
            const variant = product.variants.find((v) => v.id === item.variantId);
            throw new Error(`Insufficient stock for ${product.name}${variant ? ` (${variant.name})` : ""}`);
          }
        } else {
          const guarded = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (guarded.count === 0) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }
        }

        const updated = await tx.product.findUniqueOrThrow({
          where: { id: item.productId },
          select: { id: true, name: true, stock: true, lowStockAlert: true },
        });
        // Only flag when this order tipped stock at/under the threshold —
        // avoids re-notifying on every subsequent order once already low.
        // (Uses the parent product's own stock/threshold either way — low
        // stock alerts aren't currently tracked per-variant.)
        const stockBefore = updated.stock + (item.variantId ? 0 : item.quantity);
        if (updated.stock <= updated.lowStockAlert && stockBefore > updated.lowStockAlert) {
          lowStockHits.push(updated);
        }
      }

      // Order count reflects real activity (operational volume) — a
      // pending-payment order still counts as "an order". Lifetime spend
      // is different: it must only reflect money actually received, so
      // that's incremented separately at payment confirmation time
      // (processPaymentConfirmation / COD-delivered), not here.
      await tx.customer.update({
        where: { id: customer!.id },
        data: { totalOrders: { increment: 1 } },
      });

      // Update coupon usage
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Update flash sale usage
      for (const saleId of appliedFlashSaleIds) {
        await tx.flashSale.update({
          where: { id: saleId },
          data: { usedCount: { increment: 1 } },
        });
      }

      return ord;
        });
      } catch (err: any) {
        // Retry on unique constraint violation (order number collision)
        if (attempts < 3 && err.code === "P2002" && err.meta?.target?.includes("orderNumber")) {
          return createOrder();
        }
        throw err;
      }
    };

    const order = await createOrder();

    await logAudit({
      siteId, action: "CREATE", entity: "order",
      entityId: order.id, after: order,
    });

    // Send order confirmation email (fire-and-forget — don't block the response)
    sendOrderConfirmationEmail({
      to: email,
      customerName: `${firstName} ${lastName}`,
      storeName: site.name,
      orderNumber: order.orderNumber,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount: discount + loyaltyDiscount,
      tax,
      total: finalTotal,
      currency: site.currency,
      paymentMethod,
      deliveryAddress: deliveryAddress as { address?: string; city?: string; state?: string },
    }).catch((err) => console.error("Order confirmation email error:", err));

    // Notify the merchant dashboard of the new order (fire-and-forget)
    createSiteNotification({
      siteId,
      type: "ORDER",
      title: `New order ${order.orderNumber}`,
      message: `${firstName} ${lastName} placed an order for ${site.currency} ${finalTotal.toFixed(2)}.`,
      data: { orderId: order.id, orderNumber: order.orderNumber, total: finalTotal, currency: site.currency },
    });

    // Notify on any product that just crossed its low-stock threshold
    for (const p of lowStockHits) {
      createSiteNotification({
        siteId,
        type: "LOW_STOCK",
        title: `Low stock: ${p.name}`,
        message: `Only ${p.stock} left in stock (threshold: ${p.lowStockAlert}).`,
        data: { productId: p.id, stock: p.stock, lowStockAlert: p.lowStockAlert },
      });
    }

    // Mark any matching abandoned cart as recovered (fire-and-forget - never block checkout)
    markAbandonedCartsRecovered(siteId, { email, phone }, order.id).catch((err) =>
      console.error("markAbandonedCartsRecovered error:", err)
    );

    // Fire "new_order" automations (fire-and-forget — never block checkout)
    runAutomationsForTrigger(siteId, "new_order", {
      recipientEmail: email,
      recipientPhone: phone,
      recipientName: `${firstName} ${lastName}`,
      subject: `New order ${order.orderNumber}`,
      message: `Order ${order.orderNumber} was placed for ${site.currency} ${finalTotal}.`,
      data: { orderId: order.id, orderNumber: order.orderNumber, email, phone, total: finalTotal, currency: site.currency },
    }).catch((err) => console.error("Automation trigger (new_order) error:", err));

    return success(order, 201);
  } catch (err: any) {
    console.error("Create order error:", err);
    if (err.message?.includes("not found") || err.message?.includes("Insufficient")) {
      return error(err.message, 400);
    }
    return serverError(err, "Create order error");
  }
}
