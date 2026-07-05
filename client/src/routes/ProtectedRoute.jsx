import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import Loader from "../components/ui/Loader.jsx";

/** Guards a route subtree: requires login, and optionally restricts by role. */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullScreen label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
