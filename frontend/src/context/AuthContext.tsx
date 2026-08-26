import { useEffect, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { getCurrentUser, login as loginRequest, logout as logoutRequest, refreshToken, register as registerRequest, type LoginInput, type RegisterInput } from "../api/auth";
import type { User } from "../types/auth";
import { getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from "../utils/storage";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    let active = true;
    const initialize = async () => {
      if (location.pathname === "/login" || location.pathname === "/register") {
        if (active) setIsLoading(false);
        return;
      }
      try {
        await refreshUser();
      } catch {
        if (getRefreshToken()) {
          try {
            const tokens = await refreshToken(getRefreshToken()!);
            setAccessToken(tokens.newAccessToken);
            setRefreshToken(tokens.newRefreshToken);
            await refreshUser();
          } catch {
            clearTokens();
          }
        } else {
          clearTokens();
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void initialize();
    return () => { active = false; window.removeEventListener("auth:unauthorized", handleUnauthorized); };
  }, [location.pathname]);

  const login = async (input: LoginInput) => {
    const result = await loginRequest(input);
    setAccessToken(result.accessToken);
    setRefreshToken(result.refreshToken);
    setUser(result.user);
  };

  const register = async (input: RegisterInput) => {
    const result = await registerRequest(input);
    return result.message;
  };

  const logout = async () => {
    try {
      if (user) await logoutRequest();
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  return <AuthContext.Provider value={{ user, isLoading, isAuthenticated: Boolean(user), login, register, logout, refreshUser }}>{children}</AuthContext.Provider>;
}

