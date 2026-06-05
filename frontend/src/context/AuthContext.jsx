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

  const loginWithGoogle = useCallback(
    async (idToken) => {
      try {
        const { data } = await api.post("/auth/google", { id_token: idToken });

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

  const connectGoogle = useCallback(
    async (idToken) => {
      // Link a Google account to the CURRENTLY logged-in user by reusing the
      // backend /auth/google endpoint (it links by matching email/google_id).
      // Guard against accidentally switching into a different account.
      const prevToken = localStorage.getItem(TOKEN_KEY);
      const prevId =
        user && typeof user === "object" ? user.id : null;

      try {
        const { data } = await api.post("/auth/google", { id_token: idToken });
        const linkedUser = normalizeUser(data);

        if (prevId && linkedUser?.id && linkedUser.id !== prevId) {
          // The Google account belongs to a different OurOrbit user.
          // Restore the original session and do NOT switch.
          if (prevToken) localStorage.setItem(TOKEN_KEY, prevToken);
          return {
            ok: false,
            error:
              "That Google account is linked to a different OurOrbit user. Use the Google account that matches your email.",
          };
        }

        saveToken(data);
        setUser(linkedUser);

        return { ok: true, user: linkedUser };
      } catch (e) {
        if (prevToken) localStorage.setItem(TOKEN_KEY, prevToken);
        return {
          ok: false,
          error: formatApiError(e.response?.data?.detail) || e.message,
        };
      }
    },
    [saveToken, user]
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

  const unlinkGoogle = useCallback(async () => {
    try {
      const { data } = await api.post("/auth/unlink-google");

      saveToken(data);

      const updatedUser = normalizeUser(data);
      setUser(updatedUser);

      return { ok: true, user: updatedUser };
    } catch (e) {
      return {
        ok: false,
        error: formatApiError(e.response?.data?.detail) || e.message,
      };
    }
  }, [saveToken]);

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
      loginWithGoogle,
      connectGoogle,
      unlinkGoogle,
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
      loginWithGoogle,
      connectGoogle,
      unlinkGoogle,
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