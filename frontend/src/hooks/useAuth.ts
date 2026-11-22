import { useContext } from "react";
import { AuthContext, type AuthContextValue } from "@/context/auth-context";

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}

/** For pages behind <ProtectedRoute>, where a user is guaranteed. */
export function useCurrentUser() {
  const { user } = useAuth();
  if (!user) throw new Error("useCurrentUser used outside a protected route");
  return user;
}
