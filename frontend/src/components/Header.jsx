import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Products" },
  { to: "/gallery", label: "Gallery" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/booking", label: "Book a Visit" },
  { to: "/quote", label: "Get Quote" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-cobalt-300" : "text-silver-300 hover:text-warmwhite"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-charcoal-900/95 backdrop-blur-sm border-b border-charcoal-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="The Olan Glass and Aluminium"
              className="h-16 w-auto object-contain"
            />
            <div className="hidden sm:block">
              <p className="text-warmwhite font-bold text-lg leading-tight">
                The Olan Glass
              </p>
              <p className="text-xs text-silver-400 uppercase tracking-wider">
                and Aluminium
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClass}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === "admin" ? "/admin" : "/orders"}
                  className="text-sm text-silver-300 hover:text-warmwhite"
                >
                  Dashboard
                </Link>
                <span className="text-silver-500">|</span>
                <span className="text-sm text-warmwhite">
                  {user?.name?.split(" ")[0]}
                </span>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm text-silver-300 hover:text-warmwhite"
                >
                  Log In
                </Link>
                <Link to="/auth/signup" className="btn-primary text-xs">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-silver-400 hover:text-warmwhite"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-charcoal-600 bg-charcoal-900">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `block text-sm font-medium ${isActive ? "text-cobalt-300" : "text-silver-300"}`
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            <hr className="border-charcoal-600" />
            {isAuthenticated ? (
              <>
                <Link
                  to={user?.role === "admin" ? "/admin" : "/orders"}
                  className="block text-sm text-silver-300"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/account/profile"
                  className="block text-sm text-silver-300"
                  onClick={() => setMobileOpen(false)}
                >
                  Account
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="block text-sm text-silver-300"
                  onClick={() => setMobileOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/auth/signup"
                  className="block text-sm text-cobalt-300 font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
