import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { api, getToken, setToken } from "../lib/api";
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);
  const persistToken = useCallback((next) => {
    setToken(next);
    setTokenState(next);
  }, []);
  const login = useCallback(
    async (email, password) => {
      const data = await api.post(
        "/auth/login",
        { email, password }
      );
      setUser(data.user);
      persistToken(data.token);
    },
    [persistToken]
  );
  const logout = useCallback(() => {
    setUser(null);
    persistToken(null);
  }, [persistToken]);
  useEffect(() => {
    let active = true;
    const existing = getToken();
    if (!existing) {
      setLoading(false);
      return;
    }
    api.get("/auth/me", { auth: true }).then((data) => {
      if (active) setUser(data.user);
    }).catch((err) => {
      if (err instanceof Error && err.status === 401) {
        persistToken(null);
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [persistToken]);
  const value = useMemo(
    () => ({ user, token, loading, login, logout, isAdmin: user?.role === "admin" }),
    [user, token, loading, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
