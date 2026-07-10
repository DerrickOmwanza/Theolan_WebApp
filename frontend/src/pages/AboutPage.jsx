import { Link } from "react-router-dom";

const STATS = [
  { value: "15+", label: "Years Experience" },
  { value: "500+", label: "Projects Completed" },
  { value: "98%", label: "Client Satisfaction" },
  { value: "24/7", label: "Support Available" },
];

const VALUES = [
  {
    title: "Creativity",
    description:
      "We innovate and design unique aluminium solutions that inspire and transform spaces.",
  },
  {
    title: "Quality",
    description:
      "We source premium-grade aluminium from certified suppliers, ensuring durability and corrosion resistance in Kenya's diverse climates.",
  },
  {
    title: "Integrity",
    description:
      "We operate with honesty and transparency in all our dealings with clients and partners.",
  },
  {
    title: "Customer Satisfaction",
    description:
      "Your satisfaction is our priority - we deliver beyond expectations every time.",
  },
  {
    title: "Innovative",
    description:
      "We use computer-aided design and precision machinery to ensure millimetre accuracy.",
  },
  {
    title: "Team work",
    description:
      "Our collaborative approach ensures seamless project execution from start to finish.",
  },
  {
    title: "Sustainability",
    description:
      "We champion eco-friendly aluminium solutions that reduce environmental impact.",
  },
  {
    title: "Excellence",
    description:
      "Every cut, weld, and finish meets international standards for superior quality.",
  },
];

const TEAM = [
  {
    name: "Fredrick Omondi",
    role: "Director and Founder",
    avatar: "/images/team/fredrick.jpg", // Placeholder - will use generic avatar
  },
  {
    name: "Sophy Adhiambo",
    role: "Finance",
    avatar: "/images/team/sophy.jpg", // Placeholder - will use generic avatar
  },
  {
    name: "Everlin Ganda",
    role: "Marketer",
    avatar: "/images/team/everlin.jpg", // Placeholder - will use generic avatar
  },
  {
    name: "Kennedy Olang",
    role: "Team Leader",
    avatar: "/images/team/kennedy.jpg", // Placeholder - will use generic avatar
  },
];

const CERTIFICATIONS = [
  "ISO 9001:2015 — Quality Management",
  "Kenya Bureau of Standards (KEBS) Certified",
  "National Construction Authority (NCA) Registered",
  "Safaricom Daraja Integration Partner",
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-charcoal-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-3">
            About Us
          </p>
          <div className="mb-4 flex items-center gap-4">
            <img
              src="/images/logo.png"
              alt="The Olan Alum-int Ltd"
              className="h-16 w-auto object-contain"
            />
            <div>
              <p className="text-warmwhite font-bold text-xl leading-tight">
                The Olan Alum-int Ltd
              </p>
              <p className="text-xs text-gold-400 uppercase tracking-wider">
                Dream, create, live and inspire
              </p>
            </div>
          </div>
          <p className="text-silver-300 max-w-2xl">
            Founded in 2018, based in Umoja 2, Embakasi West (Nairobi), Kenya.
            We provide premium aluminium and architectural glazing solutions with
            a focus on quality, innovation, and customer satisfaction.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-charcoal-600 bg-charcoal-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-heading font-bold text-gold-400">
                  {stat.value}
                </p>
                <p className="text-sm text-silver-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-heading font-bold text-warmwhite mb-6">
              Our Story
            </h2>
            <div className="space-y-4 text-silver-300 leading-relaxed">
              <p>
                The Olan Glass and Aluminium provides premium aluminium and
                glass solutions for residential and commercial projects in Umoja
                2, Nairobi.
              </p>
              <p>
                We specialize in custom windows, doors, curtain walls,
                partitions, and architectural glazing with a focus on quality
                and precision.
              </p>
              <p>
                Every project is handled with attention to detail, from initial
                consultation through to final installation.
              </p>
            </div>
          </div>
          <div className="bg-charcoal-700 rounded-lg border border-charcoal-600 p-8">
            <h3 className="text-xl font-heading font-semibold text-warmwhite mb-4">
              Our Mission
            </h3>
            <p className="text-silver-300 mb-6">
              To provide high-quality aluminium and glass solutions for
              residential and commercial projects with precision and
              reliability.
            </p>
            <h3 className="text-xl font-heading font-semibold text-warmwhite mb-4">
              Our Vision
            </h3>
            <p className="text-silver-300">
              To be Nairobi&apos;s trusted partner for premium aluminium
              fabrication and installation services.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-charcoal-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-warmwhite text-center mb-12">
            What Sets Us Apart
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="card hover:border-cobalt/50 transition-colors"
              >
                <h3 className="text-lg font-heading font-semibold text-cobalt-300 mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-silver-400 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-heading font-bold text-warmwhite text-center mb-12">
          Our Team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="text-center card hover:border-cobalt/50 transition-colors"
            >
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-charcoal-700 flex items-center justify-center overflow-hidden">
                <svg
                  className="w-12 h-12 text-silver-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-heading font-semibold text-warmwhite mb-1">
                {member.name}
              </h3>
              <p className="text-sm text-cobalt-300">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl font-heading font-bold text-warmwhite text-center mb-12">
          Certifications & Compliance
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {CERTIFICATIONS.map((cert) => (
            <div
              key={cert}
              className="flex items-start gap-3 p-4 rounded-lg bg-charcoal-700 border border-charcoal-600"
            >
              <svg
                className="w-5 h-5 text-gold-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-silver-300 text-sm">{cert}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-charcoal-900 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-4">
            Ready to Work With Us?
          </h2>
          <p className="text-silver-300 mb-8">
            Whether it&apos;s a single window or an entire building facade, we
            bring the same level of dedication to every project.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking" className="btn-primary">
              Book a Site Visit
            </Link>
            <Link to="/quote" className="btn-secondary">
              Get a Quote
            </Link>
            <Link to="/contact" className="btn-ghost">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
