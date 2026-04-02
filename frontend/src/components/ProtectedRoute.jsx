import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowIncompleteProfile = false }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!allowIncompleteProfile && user && !user.complemented) {
    return <Navigate to="/complements" replace />;
  }

  return children;
}

export default ProtectedRoute;
