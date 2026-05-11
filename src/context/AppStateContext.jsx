import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";

const AppStateContext = createContext(null);

function getCoinsFromUser(user) {
  if (!user || typeof user !== "object") return 0;
  return Number(user.coins ?? user.coin_balance ?? 0);
}

export function AppStateProvider({ children }) {
  const { user, refresh: refreshAuth, loading: authLoading } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [coins, setCoins] = useState(() => getCoinsFromUser(user));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCoins(getCoinsFromUser(user));
  }, [user]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const syncAppState = useCallback(async () => {
    try {
      setLoading(true);

      const updatedUser = await refreshAuth();
      setCoins(getCoinsFromUser(updatedUser));

      triggerRefresh();
    } catch (err) {
      console.error("Failed to sync app state:", err);
    } finally {
      setLoading(false);
    }
  }, [refreshAuth, triggerRefresh]);

  const updateCoins = useCallback((newAmount) => {
    setCoins(Number(newAmount ?? 0));
  }, []);

  const value = useMemo(
    () => ({
      refreshKey,
      triggerRefresh,
      syncAppState,
      coins,
      updateCoins,
      loading: loading || authLoading,
    }),
    [refreshKey, triggerRefresh, syncAppState, coins, updateCoins, loading, authLoading]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);