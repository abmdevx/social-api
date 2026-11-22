import { createContext } from "react";
import type { RegisterInput } from "@/api/auth";
import type { User } from "@/types/models";

export interface AuthContextValue {
  user: User | null;
  /** True only during the first session check on page load. */
  loading: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<string>;
  logout: () => Promise<void>;
  /** Re-fetch the current user (after profile / avatar changes). */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
