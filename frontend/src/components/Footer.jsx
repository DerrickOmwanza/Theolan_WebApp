import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal-900 border-t border-charcoal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-3 mb-2">
              <img
                src="/images/logo.png"
                alt="The Olan Alum-int Ltd"
                className="h-16 w-auto object-contain"
              />
              <div>
                <p className="text-warmwhite font-bold text-lg leading-tight">
                  The Olan Alum-int Ltd
                </p>
                <p className="text-xs text-silver-500 uppercase tracking-wider">
                  Dream, create, live and inspire
                </p>
              </div>
            </Link>
            <p className="text-sm text-silver-500 leading-relaxed">
              Premium aluminium fabrication and architectural glazing solutions
              in Umoja 2, Embakasi West, Nairobi, Kenya.
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
                { to: "/privacy-policy", label: "Privacy Policy" },
                { to: "/terms-of-service", label: "Terms of Service" },
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
              <li>Near Umoja 2 basketball court, Embakasi West, Nairobi</li>
              <li>
                <a
                  href="mailto:theolanalumint25@gmail.com"
                  className="hover:text-cobalt-300"
                >
                  theolanalumint25@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:theolanaluminiumandglass@gmail.com"
                  className="hover:text-cobalt-300 block"
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
                <a href="tel:+254104687552" className="hover:text-cobalt-300">
                  +254 104 687552
                </a>
              </li>
              <li className="pt-2 text-xs">
                <strong className="text-silver-400">Hours:</strong>
                Mon-Fri: 8AM-5PM, Sat: 8:30AM-1PM
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-charcoal-700 text-center">
          <p className="text-xs text-silver-600">
            &copy; {year} The Olan Alum-int Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}