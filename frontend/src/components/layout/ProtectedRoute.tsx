import { Navigate, Outlet, useLocation } from "react-router-dom";
import { PageSpinner } from "@/components/common/states";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <PageSpinner />;
  if (!user)
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

/** Login / register: signed-in users are sent home instead. */
export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}
