import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, formatApiError, TOKEN_KEY } from "@/lib/api";

const AuthContext = createContext(null);

function normalizeUser(data) {
  return data?.user || data || null;
}

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

  const clearToken = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("habio_token");
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
      const freshUser = normalizeUser(data);
      console.log("AUTH USER", freshUser);
      setUser(freshUser || false);
      return freshUser;
    } catch {
      clearToken();
      setUser(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [clearToken]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(
    async (email, password) => {
      try {
        const { data } = await api.post("/auth/login", { email, password });

        saveToken(data);

        const loggedInUser = normalizeUser(data);
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

        const registeredUser = normalizeUser(data);
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

    clearToken();
    setUser(false);
  }, [clearToken]);

  const updateBalance = useCallback((newBalance) => {
    setUser((currentUser) =>
      currentUser && typeof currentUser === "object"
        ? {
            ...currentUser,
            coins: newBalance,
            coin_balance: newBalance,
          }
        : currentUser
    );
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((currentUser) =>
      currentUser && typeof currentUser === "object"
        ? {
            ...currentUser,
            ...updates,
          }
        : currentUser
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
      updateUser,
      isAuthenticated: Boolean(user && localStorage.getItem(TOKEN_KEY)),
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      refresh,
      updateBalance,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);