export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-charcoal-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">
            Privacy Policy
          </p>
          <h1 className="text-3xl font-heading font-bold text-warmwhite mb-4">
            Privacy Policy
          </h1>
          <p className="text-silver-300 text-sm">
            Last updated: July 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4">
            Company Information
          </h2>
          <p className="text-silver-300 leading-relaxed">
            The Olan Alum-int Ltd, Umoja 2, Embakasi West, Nairobi
          </p>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            Data We Collect
          </h2>
          <ul className="list-disc list-inside text-silver-300 leading-relaxed space-y-2">
            <li>
              <strong>Phone number</strong> (required) – Used for account verification,
              OTP codes, booking confirmations, and order status updates
            </li>
            <li>
              <strong>Name</strong> (required) – Used for account identification and
              communication
            </li>
            <li>
              <strong>Email</strong> (optional) – Used for additional communication
              channels
            </li>
          </ul>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            Purpose of Collection
          </h2>
          <p className="text-silver-300 leading-relaxed">
            We collect your information solely to provide our services:
          </p>
          <ul className="list-disc list-inside text-silver-300 leading-relaxed space-y-2 mt-4">
            <li>Account management and verification</li>
            <li>SMS notifications for bookings and orders</li>
            <li>OTP codes for secure authentication</li>
          </ul>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            SMS Consent
          </h2>
          <p className="text-silver-300 leading-relaxed">
            By creating an account, you consent to receive transactional SMS,
            including:
          </p>
          <ul className="list-disc list-inside text-silver-300 leading-relaxed space-y-2 mt-4">
            <li>One-time passwords (OTP) for account verification</li>
            <li>Booking confirmations and status updates</li>
            <li>Order status notifications</li>
          </ul>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            Data Storage and Sharing
          </h2>
          <p className="text-silver-300 leading-relaxed">
            Your data is stored on secure servers and is protected with industry-standard
            security measures. We do not share your personal information with third parties
            except for:
          </p>
          <ul className="list-disc list-inside text-silver-300 leading-relaxed space-y-2 mt-4">
            <li>
              <strong>Safaricom</strong> – For M-Pesa payment processing only
            </li>
            <li>
              <strong>Africa's Talking</strong> – For SMS notification delivery only
            </li>
          </ul>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            Your Rights
          </h2>
          <p className="text-silver-300 leading-relaxed">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-silver-300 leading-relaxed space-y-2 mt-4">
            <li>Access your personal data</li>
            <li>Correct any inaccuracies</li>
            <li>Request deletion of your data</li>
          </ul>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            Contact Us
          </h2>
          <p className="text-silver-300 leading-relaxed">
            For any data-related requests or questions, contact us at:
          </p>
          <p className="text-cobalt-300 mt-2">
            <a
              href="mailto:theolanalumint25@gmail.com"
              className="hover:text-cobalt-500"
            >
              theolanalumint25@gmail.com
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}