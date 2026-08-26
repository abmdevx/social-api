import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-500">Checking your session...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
