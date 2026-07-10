import { useState } from 'react';
import { Link } from 'react-router-dom';

const CONTACT_INFO = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Address',
    value: 'Industrial Area, Nairobi, Kenya',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: 'Phone',
    value: '+254 700 000 000',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Email',
    value: 'info@olanallumint.co.ke',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'Working Hours',
    value: 'Mon–Fri: 8am–5pm, Sat: 9am–1pm',
  },
];

const FAQS = [
  {
    q: 'How long does a typical installation take?',
    a: 'Most residential installations (windows/doors) take 1–3 days. Commercial curtain wall projects typically take 2–6 weeks depending on scale.',
  },
  {
    q: 'Do you offer free site visits?',
    a: 'Yes! Site visits within Nairobi are completely free. For locations outside Nairobi, a small transport fee may apply.',
  },
  {
    q: 'What warranty do you provide?',
    a: 'All our products come with a 5-year warranty on materials and workmanship. Installation is covered by a 2-year guarantee.',
  },
  {
    q: 'Do you handle county council approvals?',
    a: 'We can assist with documentation for building approvals. Our team is familiar with Nairobi County and surrounding county requirements.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept M-Pesa, bank transfer, and cheques. A 30% deposit is required to begin fabrication, with the balance due upon installation.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email is required';
    if (!form.message.trim() || form.message.trim().length < 10) errs.message = 'Message must be at least 10 characters';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    // In production, this would POST to an API endpoint
    setSubmitted(true);
  };

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-charcoal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">Get In Touch</p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-warmwhite mb-4">
            Contact Us
          </h1>
          <p className="text-silver-300 max-w-2xl">
            Have a question or ready to start your project? Reach out and our team will get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-heading font-bold text-warmwhite mb-2">Our Details</h2>
            <div className="space-y-4">
              {CONTACT_INFO.map(ci => (
                <div key={ci.label} className="flex items-start gap-3">
                  <div className="text-cobalt-300 mt-0.5">{ci.icon}</div>
                  <div>
                    <p className="text-xs text-silver-500 uppercase tracking-wider">{ci.label}</p>
                    <p className="text-warmwhite text-sm">{ci.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-charcoal-600">
              <h3 className="text-lg font-heading font-semibold text-warmwhite mb-3">Quick Links</h3>
              <div className="flex flex-col gap-2">
                <Link to="/booking" className="text-cobalt-300 hover:text-cobalt-200 text-sm transition-colors">Book a site visit →</Link>
                <Link to="/quote" className="text-cobalt-300 hover:text-cobalt-200 text-sm transition-colors">Get an instant quote →</Link>
                <Link to="/products" className="text-cobalt-300 hover:text-cobalt-200 text-sm transition-colors">Browse our products →</Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="card text-center py-12 border-green-500/30 bg-green-500/5">
                <svg className="w-12 h-12 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-heading font-semibold text-warmwhite mb-2">Message Sent!</h3>
                <p className="text-silver-400 mb-4">Thank you for reaching out. We&apos;ll get back to you within 24 hours.</p>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} className="btn-secondary">
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="input-label">Name *</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Your full name"
                    />
                    {errors.name && <p className="input-error">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="input-label">Email *</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="your@email.com"
                    />
                    {errors.email && <p className="input-error">{errors.email}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="input-label">Phone</label>
                    <input
                      id="contact-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="input-field"
                      placeholder="+254 7XX XXX XXX"
                    />
                  </div>
                  <div>
                    <label className="input-label">Subject</label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Select a topic</option>
                      <option value="quote">Request a Quote</option>
                      <option value="booking">Book a Site Visit</option>
                      <option value="existing">Existing Order Enquiry</option>
                      <option value="partnership">Business Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Message *</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className={`input-field min-h-[120px] ${errors.message ? 'border-red-500' : ''}`}
                    placeholder="Tell us about your project or question..."
                    rows={4}
                  />
                  {errors.message && <p className="input-error">{errors.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full sm:w-auto">Send Message</button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-charcoal-900 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-warmwhite text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="border border-charcoal-600 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-charcoal-700/50 transition-colors"
                >
                  <span className="text-warmwhite font-medium text-sm pr-4">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-silver-400 flex-shrink-0 transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-silver-400 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
