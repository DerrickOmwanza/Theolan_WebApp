export default function TermsOfServicePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-charcoal-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">
            Terms of Service
          </p>
          <h1 className="text-3xl font-heading font-bold text-warmwhite mb-4">
            Terms of Service
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
            1. Quotes
          </h2>
          <p className="text-silver-300 leading-relaxed">
            All quotes provided are estimates only and subject to confirmation
            during a site visit. Final pricing may vary based on actual measurements,
            material availability, and technical requirements.
          </p>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            2. Bookings
          </h2>
          <p className="text-silver-300 leading-relaxed">
            All bookings are subject to technician availability and confirmation.
          </p>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            3. Deposits
          </h2>
          <p className="text-silver-300 leading-relaxed">
            Deposits paid are non-refundable once fabrication begins.
          </p>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            4. Business Hours
          </h2>
          <p className="text-silver-300 leading-relaxed">
            Monday – Friday: 8:00 AM – 5:00 PM
            <br />
            Saturday: 8:30 AM – 1:00 PM
            <br />
            Closed on Sundays and public holidays
          </p>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            5. Service Area
          </h2>
          <p className="text-silver-300 leading-relaxed">
            Our services are primarily provided in Nairobi and surrounding areas.
            For locations outside our standard service area, please contact us
            for a customized quote.
          </p>

          <h2 className="text-2xl font-heading font-bold text-warmwhite mb-4 mt-8">
            Contact
          </h2>
          <p className="text-silver-300 leading-relaxed">
            For questions regarding these Terms of Service, please contact us at:
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