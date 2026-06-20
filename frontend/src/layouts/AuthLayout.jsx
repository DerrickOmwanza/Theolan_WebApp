import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-charcoal-900">
      {/* Minimal header with logo */}
      <header className="py-4 px-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-heading font-bold text-warmwhite tracking-tight">
            Theolan
          </span>
          <span className="text-xs text-gold-400 font-medium uppercase tracking-widest">
            Aluminium
          </span>
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
          &copy; {new Date().getFullYear()} Theolan Aluminium International Ltd
        </p>
      </footer>
    </div>
  );
}
