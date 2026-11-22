import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import * as authApi from "@/api/auth";
import { UNAUTHORIZED_EVENT } from "@/api/client";
import { AuthContext, type AuthContextValue } from "@/context/auth-context";
import type { User } from "@/types/models";

/**
 * Session lives in httpOnly cookies, so the only client state is the user object. The session is
 * checked once on mount; an `UNAUTHORIZED_EVENT` (refresh failed) clears the user, and route
 * guards then redirect to /login.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    authApi
      .getCurrentUser()
      .then((current) => {
        if (!cancelled) setUser(current);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    const loggedIn = await authApi.login({ identifier, password });
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await authApi.getCurrentUser());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, register: authApi.register, logout, refreshUser }),
    [user, loading, login, logout, refreshUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
