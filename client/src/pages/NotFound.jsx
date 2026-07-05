import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4 text-center">
    <p className="font-display text-7xl font-extrabold bg-brand-gradient bg-clip-text text-transparent">404</p>
    <h1 className="mt-2 text-xl font-semibold text-neutral-900 dark:text-white">Page not found</h1>
    <p className="mt-1 text-neutral-500 dark:text-neutral-400">The page you're looking for doesn't exist.</p>
    <Link to="/login" className="btn-primary mt-6">Back to login</Link>
  </div>
);

export default NotFound;
