import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-4">
              Nairobi's Premier Aluminium Fabricator
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-warmwhite leading-tight mb-6">
              Precision Crafted <br />
              <span className="text-cobalt-400">Aluminium</span> Solutions
            </h1>
            <p className="text-lg text-silver-300 leading-relaxed mb-8">
              Custom windows, doors, curtain walls, partitions, and architectural glazing systems.
              From design to installation — built to last.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/booking" className="btn-primary">
                Book a Site Visit
              </Link>
              <Link to="/quote" className="btn-secondary">
                Get Instant Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-warmwhite text-center mb-12">
            Our Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Windows', desc: 'Fixed, sliding, casement, and top-hung aluminium windows', cat: 'windows' },
              { title: 'Doors', desc: 'Sliding, French, and hinged aluminium doors', cat: 'doors' },
              { title: 'Curtain Walls', desc: 'Structural glazing and stick curtain wall systems', cat: 'curtain_walls' },
              { title: 'Partitions', desc: 'Single and double-glazed office partitions', cat: 'partitions' },
              { title: 'Balustrades', desc: 'Frameless glass and post-system balustrades', cat: 'balustrades' },
              { title: 'Custom Designs', desc: 'Bespoke architectural aluminium solutions', cat: 'custom' },
            ].map((item) => (
              <Link
                key={item.cat}
                to={`/products?category=${item.cat}`}
                className="card hover:border-cobalt/50 transition-colors group"
              >
                <h3 className="text-xl font-heading font-semibold text-warmwhite mb-2 group-hover:text-cobalt-300">
                  {item.title}
                </h3>
                <p className="text-sm text-silver-400">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold text-warmwhite mb-4">
            Ready to Start Your Project?
          </h2>
          <p className="text-silver-300 mb-8">
            Book a free site visit and get a detailed quotation within 48 hours.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/booking" className="btn-primary">
              Book Now
            </Link>
            <Link to="/gallery" className="btn-ghost">
              View Our Work
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
