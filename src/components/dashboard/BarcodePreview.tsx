"use client";

import { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";

/**
 * Renders a real, scannable barcode (not a decorative stripe pattern) from
 * a product's barcode value. Used in the product form so a merchant can
 * see exactly what a printed label would look like, and can screenshot/
 * print it directly.
 *
 * Uses Code128 — it accepts any ASCII text/digits (unlike EAN-13/UPC-A,
 * which require a specific digit count plus a valid checksum), so it
 * works whether the merchant typed a real manufacturer barcode or an
 * internal custom code.
 */
export function BarcodePreview({ value, className }: { value: string; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        width: 2,
        height: 50,
        fontSize: 13,
        margin: 8,
        displayValue: true,
      });
      setInvalid(false);
    } catch {
      setInvalid(true);
    }
  }, [value]);

  if (!value) return null;

  return (
    <div className={className}>
      {invalid ? (
        <p className="text-xs text-accent-600">Couldn't render a barcode for this value.</p>
      ) : (
        <svg ref={svgRef} className="max-w-full" />
      )}
    </div>
  );
}
