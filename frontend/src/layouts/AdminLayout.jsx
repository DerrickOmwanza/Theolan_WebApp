import { Outlet, NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";

const adminSidebarLinks = [
  {
    to: "/admin/analytics",
    label: "Analytics",
    icon: "M9 19v-6m6 6V5m6 14v-4M3 19h18M5 19V5a2 2 0 012-2h10a2 2 0 012 2v14",
  },
  {
    to: "/admin/orders",
    label: "Orders",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    to: "/admin/bookings",
    label: "Bookings",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    to: "/admin/calendar",
    label: "Calendar",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    to: "/admin/settings",
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
  {
    to: "/admin/gallery",
    label: "Gallery",
    icon: "M4 16l4.5-4.5L12 16l7-7M4 16h16M4 16a2 2 0 112-2h12a2 2 0 112 2v6a2 2 0 11-2 2H6a2 2 0 11-2-2v-6z",
  },
  {
    to: "/admin/products",
    label: "Products",
    icon: "M3 7h18M3 11h18M3 15h18M3 19h18M9 7v10M15 7v10",
  },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-cobalt/20 text-cobalt-300"
        : "text-silver-400 hover:text-warmwhite hover:bg-charcoal-600"
    }`;

  return (
    <div className="flex min-h-screen bg-charcoal-800">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex lg:flex-col w-64 h-screen sticky top-0 overflow-y-auto bg-charcoal-900 border-r border-charcoal-600">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/images/logo.png"
              alt="The Olan Glass and Aluminium"
              className="h-16 w-auto object-contain"
            />
            <div>
              <p className="text-warmwhite font-bold text-lg leading-tight">
                The Olan Glass
              </p>
              <p className="text-xs text-silver-500 uppercase tracking-wider">
                Aluminium
              </p>
            </div>
          </Link>
        </div>
        <div className="px-3 pb-3">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-silver-400 hover:text-warmwhite hover:bg-charcoal-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Site
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 space-y-1">
          {adminSidebarLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkClass}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={link.icon}
                />
              </svg>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-charcoal-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-cobalt/20 flex items-center justify-center text-cobalt-300 text-sm font-medium">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warmwhite truncate">
                {user?.name}
              </p>
              <p className="text-xs text-silver-500 truncate">{user?.phone}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 text-sm text-silver-400 hover:text-red-400 hover:bg-charcoal-600 rounded-md transition-colors"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-charcoal-900 z-50">
            <div className="p-6 flex justify-between items-center">
              <Link
                to="/"
                className="flex items-center gap-3"
                onClick={() => setSidebarOpen(false)}
              >
                <img
                  src="/images/logo.png"
                  alt="The Olan Glass and Aluminium"
                  className="h-16 w-auto object-contain"
                />
                <div>
                  <p className="text-warmwhite font-bold text-lg leading-tight">
                    The Olan Glass
                  </p>
                  <p className="text-xs text-silver-500 uppercase tracking-wider">
                    Aluminium
                  </p>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-silver-400"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-3 pb-3">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium text-silver-400 hover:text-warmwhite hover:bg-charcoal-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Back to Site
              </Link>
            </div>
            <nav className="px-3 space-y-1">
              {adminSidebarLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={linkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 bg-charcoal-900/50 border-b border-charcoal-600 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-silver-400 hover:text-warmwhite"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h1 className="text-lg font-heading font-semibold text-warmwhite">
              Admin Dashboard
            </h1>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-silver-400 hover:text-warmwhite hover:bg-charcoal-700 rounded-md transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m-9 5L21 5"
              />
            </svg>
            <span className="hidden sm:inline">View Site</span>
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
