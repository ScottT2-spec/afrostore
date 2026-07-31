"use client";
import { ShoppingBag } from "@/components/icons/FilledIcons";

import Link from "next/link";

const footerLinks = {
  Product: [
    { name: "Ecommerce Store", href: "#ecommerce" },
    { name: "Landing Pages", href: "#landing-pages" },
    { name: "Website Builder", href: "#website-builder" },
    { name: "AI Assistant", href: "#ai-assistant" },
    { name: "Templates", href: "#templates" },
    { name: "Pricing", href: "#pricing" },
  ],
  Payments: [
    { name: "Monnify", href: "https://monnify.com", external: true },
    { name: "Paystack", href: "https://paystack.com", external: true },
    { name: "Flutterwave", href: "https://flutterwave.com", external: true },
    { name: "Bank Transfer", href: "#pricing" },
    { name: "Mobile Money", href: "#pricing" },
    { name: "USSD", href: "#pricing" },
  ],
  Company: [
    { name: "About Us", href: "#how-it-works" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Testimonials", href: "#testimonials" },
    { name: "Contact Us", href: "mailto:support@prokip.com" },
  ],
  Support: [
    { name: "Help Center", href: "mailto:support@prokip.com" },
    { name: "Get Started", href: "/auth/signup" },
    { name: "Login", href: "/auth/login" },
    { name: "Showcase", href: "#showcase" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-surface-950 text-surface-400">
      <div className="container-max section-padding pb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Afro<span className="text-brand-400">Store</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              The simplest, fastest, most conversion-focused ecommerce platform for African businesses. From idea to selling in 5 minutes.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 mt-4">
              {[
                { name: "Twitter", href: "https://twitter.com/prokiptech", icon: "𝕏" },
                { name: "Instagram", href: "https://instagram.com/prokiptech", icon: "📸" },
                { name: "LinkedIn", href: "https://linkedin.com/company/prokip", icon: "in" },
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 rounded-lg bg-surface-800 hover:bg-surface-700 flex items-center justify-center text-xs text-surface-400 hover:text-white transition-colors"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-surface-500 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-surface-500 hover:text-white transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-600">
            &copy; {new Date().getFullYear()} AfroStore by Prokip. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-surface-600 hover:text-surface-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-surface-600 hover:text-surface-400 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
