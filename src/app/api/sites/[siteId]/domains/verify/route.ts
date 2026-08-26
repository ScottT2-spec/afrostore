import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";
import dns from "dns";
import fs from "fs/promises";
import path from "path";
import { promisify } from "util";
import { CNAME_TARGET, SERVER_IP } from "@/lib/domain/domain-manager";
import { generateNginxHttpOnlyBlock, getNginxConfigFilename } from "@/lib/domain/nginx-generator";

const resolveCname = promisify(dns.resolveCname);
const resolve4 = promisify(dns.resolve4);
const resolveTxt = promisify(dns.resolveTxt);

function error(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ siteId: string }> }) {
  const user = await getAuthUser(req);
  if (!user) return error("Unauthorized", 401);
  const { siteId } = await params;

  const site = await prisma.site.findFirst({ where: { id: siteId, workspace: { OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }] } } });
  if (!site) return error("Site not found", 404);

  const body = await req.json();
  const domainId = body.domainId;
  if (!domainId) return error("domainId is required");

  const domainRecord = await prisma.domain.findFirst({ where: { id: domainId, siteId } });
  if (!domainRecord) return error("Domain not found", 404);

  const domain = domainRecord.domain;
  const results: { method: string; verified: boolean; resolvedTo?: string; expected?: string; error?: string }[] = [];

  // Check A record
  if (SERVER_IP) {
    try {
      const addresses = await resolve4(domain);
      const match = addresses.includes(SERVER_IP);
      results.push({ method: "A", verified: match, resolvedTo: addresses.join(", "), expected: SERVER_IP });
    } catch (e: any) {
      results.push({ method: "A", verified: false, error: e.code === "ENODATA" ? "No A record found" : e.message });
    }
  }

  // Check CNAME
  try {
    const cnames = await resolveCname(domain);
    const match = cnames.some((c: string) => c.toLowerCase() === CNAME_TARGET.toLowerCase() || c.toLowerCase().endsWith("." + CNAME_TARGET.toLowerCase()));
    results.push({ method: "CNAME", verified: match, resolvedTo: cnames.join(", "), expected: CNAME_TARGET });
  } catch (e: any) {
    results.push({ method: "CNAME", verified: false, error: e.code === "ENODATA" ? "No CNAME record found" : e.message });
  }

  // Check TXT verification (optional extra verification)
  let txtVerified = false;
  if (domainRecord.verificationToken) {
    try {
      const txtRecords = await resolveTxt(`_prokip.${domain}`);
      const flat = txtRecords.flat();
      txtVerified = flat.includes(domainRecord.verificationToken);
    } catch {
      // TXT verification is optional
    }
  }

  const dnsVerified = results.some((r) => r.verified);

  if (dnsVerified) {
    await prisma.domain.update({
      where: { id: domainId },
      data: {
        status: "ACTIVE",
        dnsVerified: true,
      },
    });

    // Previously nothing past this point ever happened: DNS could verify
    // successfully and the DB would say ACTIVE, but no nginx routing or
    // SSL certificate ever got created for the domain — it would 404 or
    // show a cert mismatch no matter how "verified" it looked here.
    //
    // Write the HTTP-only config now (enables the ACME HTTP-01 challenge
    // to succeed over plain :80). docker/certbot-provision.sh picks up
    // any domain config here that doesn't have a cert yet, issues one via
    // certbot, and upgrades this file to the full SSL block — see that
    // script for the rest of the flow. NGINX_DOMAINS_DIR must be a volume
    // shared with the nginx and certbot containers (see docker-compose.yml).
    const domainsDir = process.env.NGINX_DOMAINS_DIR;
    if (domainsDir) {
      try {
        const filename = getNginxConfigFilename(domain);
        const config = generateNginxHttpOnlyBlock({ domain, upstreamPort: 3000, includeWww: true });
        await fs.writeFile(path.join(domainsDir, filename), config, "utf8");
      } catch (err) {
        // Don't fail the verification response over this — DNS is
        // genuinely verified either way, and the provisioning script will
        // still pick the domain up on its next pass once the file issue
        // (permissions, missing dir, etc.) is fixed. Just log it.
        console.error(`Failed to write nginx config for ${domain}:`, err);
      }
    } else {
      console.warn(`NGINX_DOMAINS_DIR not set — skipped writing nginx config for verified domain ${domain}. It will not actually be reachable until this is configured.`);
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      domainId,
      domain,
      dnsVerified,
      txtVerified,
      overallStatus: dnsVerified ? "ACTIVE" : "PENDING",
      checks: results,
      message: dnsVerified
        ? "DNS is configured correctly! Your domain is now active."
        : "DNS is not yet configured. Please add the DNS records and try again. DNS changes can take up to 48 hours to propagate.",
    },
  });
}
