import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 border-t border-charcoal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-heading font-bold text-warmwhite mb-2">
              The Olan Glass and Aluminium
            </h3>
            <p className="text-sm text-silver-500 leading-relaxed">
              Premium aluminium fabrication and architectural glazing solutions
              in Umoja 2, Nairobi, Kenya.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-silver-300 uppercase tracking-wider mb-3">
              Quick Links
            </h4>
            <ul className="space-y-2">
              {[
                { to: "/products", label: "Products" },
                { to: "/gallery", label: "Gallery" },
                { to: "/booking", label: "Book a Visit" },
                { to: "/quote", label: "Get Quote" },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-silver-500 hover:text-warmwhite"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-medium text-silver-300 uppercase tracking-wider mb-3">
              Contact
            </h4>
            <ul className="space-y-2 text-sm text-silver-500">
              <li>Umoja 2, Nairobi, Kenya, 000</li>
              <li>
                <a
                  href="mailto:theolanaluminiumandglass@gmail.com"
                  className="hover:text-cobalt-300"
                >
                  theolanaluminiumandglass@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+254712916504" className="hover:text-cobalt-300">
                  +254 712 916504
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/Theolanalumintltd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cobalt-300 flex items-center gap-1"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.5v-3.47h2.625V9.397c0-2.625 1.575-4.006 3.875-4.006 1.104 0 2.254.212 2.254.212v2.47h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 3.47h-2.33v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-charcoal-700 text-center">
          <p className="text-xs text-silver-600">
            &copy; {year} The Olan Glass and Aluminium. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
