import { Outlet, Link } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-charcoal-900">
      {/* Minimal header with logo */}
      <header className="py-4 px-6">
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
            <p className="text-xs text-gold-400 uppercase tracking-wider">
              and Aluminium
            </p>
          </div>
        </Link>
      </header>

      {/* Centered auth form */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      {/* Minimal footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-silver-600">
          &copy; {new Date().getFullYear()} The Olan Glass and Aluminium
        </p>
      </footer>
    </div>
  );
}
