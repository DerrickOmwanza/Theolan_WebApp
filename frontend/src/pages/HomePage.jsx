import { Link } from "react-router-dom";

export default function HomePage() {
  const products = [
    {
      title: "Windows",
      desc: "Fixed, sliding, casement, and top-hung aluminium windows",
      cat: "windows",
      image: "/images/Windows.webp",
    },
    {
      title: "Doors",
      desc: "Sliding, French, and hinged aluminium doors",
      cat: "doors",
      image: "/images/Doors.webp",
    },
    {
      title: "Curtain Walls",
      desc: "Structural glazing and stick curtain wall systems",
      cat: "curtain_walls",
      image: "/images/Curtain_Walls.webp",
    },
    {
      title: "Balustrades",
      desc: "Frameless glass and post-system balustrades",
      cat: "balustrades",
      image: "/images/Balustrades.webp",
    },
    {
      title: "Partitions",
      desc: "Single and double-glazed office partitions",
      cat: "partitions",
      image: "/images/Partitions.webp",
    },
    {
      title: "Aluminium Fabrications",
      desc: "Custom aluminium fabrication and structural works",
      cat: "aluminium_fabrications",
      image: "/images/Custom_designs.webp",
    },
    {
      title: "Stainless Steel Railings",
      desc: "Premium stainless steel railings and balusters",
      cat: "stainless_steel_railings",
      image: "/images/Balustrades.webp",
    },
    {
      title: "Frameless Glass & Sunroofs",
      desc: "Modern frameless glass systems and sunroofs",
      cat: "frameless_glass",
      image: "/images/Curtain_Walls.webp",
    },
    {
      title: "Gypsum Walls & Ceilings",
      desc: "Professional gypsum wall and ceiling installations",
      cat: "gypsum_ceilings",
      image: "/images/Partitions.webp",
    },
    {
      title: "Kitchen & Wardrobe Cabinets",
      desc: "Custom kitchen cabinets and wardrobe solutions",
      cat: "kitchen_cabinets",
      image: "/images/Doors.webp",
    },
    {
      title: "Floor Tiling",
      desc: "Professional floor tiling and installation services",
      cat: "floor_tiling",
      image: "/images/Windows.webp",
    },
  ];

  return (
    <div>
      {/* Hero Section - Split layout with curved image on right */}
      <section className="relative min-h-[70vh] flex items-center bg-charcoal-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          {/* Desktop: Split layout with curved image */}
          <div className="hidden lg:grid grid-cols-2 gap-12 items-center">
            {/* Left Column - CTA Content */}
            <div className="text-left animate-slide-in-left">
              <p
                className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-4 animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                Nairobi&apos;s Premier Aluminium Fabricator
              </p>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-warmwhite leading-tight mb-6 animate-fade-in"
                style={{ animationDelay: "0.2s" }}
              >
                Precision Crafted <br />
                <span className="text-cobalt-400">Aluminium</span> Solutions
              </h1>
              <p
                className="text-lg text-silver-300 leading-relaxed mb-8 max-w-lg animate-fade-in"
                style={{ animationDelay: "0.3s" }}
              >
                Custom windows, doors, curtain walls, partitions, and
                architectural glazing systems. From design to installation —
                built to last.
              </p>
              <div
                className="flex flex-wrap gap-4 animate-fade-in"
                style={{ animationDelay: "0.4s" }}
              >
                <Link to="/booking" className="btn-primary">
                  Book a Site Visit
                </Link>
                <Link to="/quote" className="btn-secondary">
                  Get Instant Quote
                </Link>
              </div>
            </div>

            {/* Right Column - Curved Image */}
            <div
              className="relative h-[500px] animate-slide-in-right"
              style={{ animationDelay: "0.3s" }}
            >
              <img
                src="/images/hero_image.png"
                alt="Modern aluminium sliding door installation"
                className="absolute inset-0 w-full h-full hero-image-curved"
              />
            </div>
          </div>

          {/* Mobile: Stacked layout with image below text */}
          <div className="lg:hidden">
            {/* CTA Content */}
            <div className="text-left mb-8 animate-fade-in">
              <p className="text-gold-400 text-sm font-medium uppercase tracking-widest mb-4">
                Nairobi&apos;s Premier Aluminium Fabricator
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-warmwhite leading-tight mb-6">
                Precision Crafted <br />
                <span className="text-cobalt-400">Aluminium</span> Solutions
              </h1>
              <p className="text-lg text-silver-300 leading-relaxed mb-8 max-w-lg">
                Custom windows, doors, curtain walls, partitions, and
                architectural glazing systems. From design to installation —
                built to last.
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

            {/* Image */}
            <div
              className="relative h-[300px] animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <img
                src="/images/hero_image.png"
                alt="Modern aluminium sliding door installation"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Products Carousel Section */}
      <section className="py-20 bg-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-heading font-bold text-warmwhite text-center mb-12">
            Our Products
          </h2>

          {/* Continuous Carousel - Cards slide from right to left */}
          <div className="relative h-[320px] sm:h-[380px] overflow-hidden rounded-xl">
            <div className="relative h-full flex items-center">
              {/* Left blur fade for smooth entry */}
              <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-charcoal-900 to-transparent pointer-events-none" />

              {/* Carousel wrapper */}
              <div className="carousel-container flex items-center h-full py-4">
                {/* Duplicate products for infinite loop */}
                {[...products, ...products].map((product, index) => (
                  <Link
                    key={`${product.cat}-${index}`}
                    to={`/products?category=${product.cat}`}
                    className="product-card flex-shrink-0 w-72 sm:w-80 lg:w-96 h-full mx-3 group"
                  >
                    <div className="relative h-full overflow-hidden rounded-xl bg-charcoal-700">
                      <img
                        src={product.image}
                        alt={product.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/95 via-charcoal-800/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-warmwhite">
                        <h3 className="text-2xl sm:text-3xl font-heading font-bold mb-2 group-hover:text-cobalt-300 transition-colors">
                          {product.title}
                        </h3>
                        <p className="text-sm sm:text-base text-silver-300">
                          {product.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Right blur fade */}
              <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-charcoal-900 to-transparent pointer-events-none" />
            </div>
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
