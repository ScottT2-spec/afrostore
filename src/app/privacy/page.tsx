import Link from "next/link";

export const metadata = { title: "Privacy Policy — Prokip" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 mb-8 inline-block">← Back to home</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed text-gray-600">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Information We Collect</h2>
            <p>When you use Prokip, we collect information you provide directly: your name, email address, business details, and payment information. We also collect usage data such as pages visited, features used, and device information to improve our service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve Prokip&apos;s services, process transactions, send important updates about your account, and provide customer support. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard encryption. We use trusted cloud infrastructure providers and implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, or destruction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Payment Processing</h2>
            <p>Payment processing is handled by our partners (Paystack, Flutterwave, Monnify). We do not store your full credit card details on our servers. All payment data is processed in compliance with PCI DSS standards.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Cookies</h2>
            <p>We use essential cookies to keep you logged in and remember your preferences. We also use analytics cookies to understand how you use Prokip so we can improve it. You can manage cookie preferences in your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data at any time. You can export your store data or request account deletion by contacting our support team. We will respond to your request within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Third-Party Services</h2>
            <p>Prokip integrates with third-party services (payment gateways, analytics, email). These services have their own privacy policies. We only share the minimum data necessary for these integrations to function.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify you of significant changes via email or through a notice on our platform. Continued use of Prokip after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">9. Contact Us</h2>
            <p>If you have questions about this privacy policy or your data, contact us at <a href="mailto:support@prokip.com" className="text-blue-600 hover:underline">support@prokip.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
