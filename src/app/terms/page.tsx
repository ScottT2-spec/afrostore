import Link from "next/link";

export const metadata = { title: "Terms of Service — Prokip" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-8 inline-block">← Back to home</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Prokip (&quot;the Platform&quot;), operated by Prokip, you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. Account Registration</h2>
            <p>To use Prokip, you must create an account with accurate and complete information. You are responsible for maintaining the security of your account credentials. You must be at least 18 years old or the age of majority in your jurisdiction to use the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Use of the Platform</h2>
            <p>Prokip provides tools to create and manage online stores, websites, and landing pages. You may use the Platform for lawful commercial purposes only. You agree not to use the Platform to sell prohibited items, engage in fraud, or violate any applicable laws.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Store Content</h2>
            <p>You retain ownership of all content you upload to your store (products, images, descriptions). You grant Prokip a license to host, display, and distribute this content as necessary to operate the Platform. You are solely responsible for ensuring your content does not infringe on third-party rights.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Payments & Fees</h2>
            <p>Prokip may offer free and paid plans. Pricing is displayed on our pricing page. Payment processing fees charged by gateway providers (Paystack, Flutterwave, Monnify) are separate from Prokip fees. You are responsible for all applicable taxes on your transactions.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Prohibited Activities</h2>
            <p>You may not: (a) use the Platform for illegal activities; (b) sell counterfeit, stolen, or prohibited goods; (c) attempt to hack, disrupt, or overload the Platform; (d) scrape or collect data from other stores; (e) impersonate other businesses or individuals; (f) use the Platform to send spam or unsolicited communications.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Intellectual Property</h2>
            <p>Prokip&apos;s name, logo, templates, and platform code are proprietary. You may not copy, modify, or redistribute any part of the Platform without written permission. Templates provided are licensed for use on Prokip only.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Termination</h2>
            <p>We may suspend or terminate your account if you violate these terms. You may delete your account at any time. Upon termination, your store data will be retained for 30 days before permanent deletion, allowing you to export your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">9. Limitation of Liability</h2>
            <p>Prokip is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the fees you paid in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">10. Changes to Terms</h2>
            <p>We may update these terms at any time. We will notify you of material changes via email or platform notification. Continued use after changes constitutes acceptance. If you disagree with any changes, you should stop using the Platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">11. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:support@prokip.com" className="text-blue-600 hover:underline">support@prokip.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
