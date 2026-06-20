import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <h1 className="text-8xl font-heading font-bold text-charcoal-600 mb-4">404</h1>
      <h2 className="text-2xl font-heading font-semibold text-warmwhite mb-2">Page Not Found</h2>
      <p className="text-silver-400 mb-8 text-center max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
