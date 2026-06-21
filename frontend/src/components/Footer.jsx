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
              <li>theolanaluminiumandglass@gmail.com</li>
              <li>+254 712 916504</li>
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
