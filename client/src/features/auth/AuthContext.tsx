import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import api from "../../lib/api";
import type { User } from "./types";

interface AuthContextValue { user: User | null; loading: boolean; login: (email: string, password: string) => Promise<void>; register: (name: string, email: string, password: string) => Promise<void>; logout: () => Promise<void>; }
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const loadUser = useCallback(async () => {
    try {
      await api.post("/auth/refresh");
      const response = await api.get("/auth/me");
      setUser(response.data.user as User);
    } catch { setUser(null); }
  }, []);
  useEffect(() => { void loadUser().finally(() => setLoading(false)); }, [loadUser]);
  const login = useCallback(async (email: string, password: string) => { const response = await api.post("/auth/login", { email, password }); setUser(response.data.user as User); }, []);
  const register = useCallback(async (name: string, email: string, password: string) => { const response = await api.post("/auth/register", { name, email, password }); setUser(response.data.user as User); }, []);
  const logout = useCallback(async () => { try { await api.post("/auth/logout"); } finally { setUser(null); } }, []);
  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be used inside AuthProvider"); return context; }
