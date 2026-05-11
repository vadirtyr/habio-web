import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, formatApiError } from "@/lib/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "habio_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveToken = useCallback((data) => {
    const token = data?.access_token || data?.token;

    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }

    return token;
  }, []);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setUser(false);
      setLoading(false);
      return null;
    }

    try {
      const { data } = await api.get("/auth/me");
      setUser(data?.user || data);
      return data?.user || data;
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      setUser(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await api.post("/auth/login", { email, password });

        saveToken(data);

        const loggedInUser = data?.user || data;
        setUser(loggedInUser);

        return { ok: true, user: loggedInUser };
      } catch (e) {
        return {
          ok: false,
          error: formatApiError(e.response?.data?.detail) || e.message,
        };
      }
    },
    [saveToken]
  );

  const register = useCallback(
    async (email, password, name) => {
      try {
        const { data } = await api.post("/auth/register", {
          email,
          password,
          name,
        });

        saveToken(data);

        const registeredUser = data?.user || data;
        setUser(registeredUser);

        return { ok: true, user: registeredUser };
      } catch (e) {
        return {
          ok: false,
          error: formatApiError(e.response?.data?.detail) || e.message,
        };
      }
    },
    [saveToken]
  );

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    localStorage.removeItem(TOKEN_KEY);
    setUser(false);
  }, []);

  const updateBalance = useCallback((newBalance) => {
    setUser((u) =>
      u && typeof u === "object"
        ? {
            ...u,
            coins: newBalance,
            coin_balance: newBalance,
          }
        : u
    );
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
      updateBalance,
      isAuthenticated: Boolean(user && localStorage.getItem(TOKEN_KEY)),
    }),
    [user, loading, login, register, logout, refresh, updateBalance]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);