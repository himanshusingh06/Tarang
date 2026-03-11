import { createContext, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import { apiFetch } from "../lib/api";
import { API_BASE } from "../lib/config";

export interface User {
  id: number;
  email: string;
  full_name?: string;
  role?: string;
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("dhun_token"));
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    const data = await apiFetch<User>("/api/v1/users/me", {}, token);
    setUser(data);
  }, [token]);

  useEffect(() => {
    refreshUser().catch(() => setUser(null));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const body = new URLSearchParams({ username: email, password });
    const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || "Login failed");
    }
    const data = await response.json();
    localStorage.setItem("dhun_token", data.access_token);
    setToken(data.access_token);
  }, []);

  const register = useCallback(async (email: string, password: string, fullName?: string) => {
    await apiFetch("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName })
    });
    await login(email, password);
  }, [login, token]);

  const logout = useCallback(() => {
    localStorage.removeItem("dhun_token");
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      login,
      register,
      logout,
      refreshUser
    }),
    [token, user, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
