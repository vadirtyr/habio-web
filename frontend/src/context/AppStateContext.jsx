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

function getLevelDataFromUser(user) {
  if (!user || typeof user !== "object") {
    return {
      level: 1,
      current_xp: 0,
      next_level_xp: 100,
    };
  }

  if (user.level_data) {
    return {
      level: Number(user.level_data.level ?? 1),
      current_xp: Number(user.level_data.current_xp ?? 0),
      next_level_xp: Number(
        user.level_data.next_level_xp ?? 100
      ),
    };
  }

  return {
    level: Number(user.level ?? 1),
    current_xp: Number(user.xp ?? 0),
    next_level_xp: 100,
  };
}

export function AppStateProvider({ children }) {
  const { user, refresh: refreshAuth, loading: authLoading } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [coins, setCoins] = useState(() => getCoinsFromUser(user));
  const [levelData, setLevelData] = useState(() => getLevelDataFromUser(user));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCoins(getCoinsFromUser(user));
    setLevelData(getLevelDataFromUser(user));
  }, [user]);

  const triggerRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  const syncAppState = useCallback(async () => {
    try {
      setLoading(true);

      const updatedUser = await refreshAuth();

      setCoins(getCoinsFromUser(updatedUser));
      setLevelData(getLevelDataFromUser(updatedUser));

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

  const updateLevelData = useCallback((newLevelData = {}) => {
    setLevelData((current) => ({
      ...current,
      ...newLevelData,
      level: Number(newLevelData.level ?? current.level ?? 1),
      current_xp: Number(
        newLevelData.current_xp ??
          newLevelData.xp ??
          current.current_xp ??
          0
      ),
      next_level_xp: Number(
        newLevelData.next_level_xp ??
          current.next_level_xp ??
          100
      ),
    }));
  }, []);

  const value = useMemo(
    () => ({
      refreshKey,
      triggerRefresh,
      syncAppState,

      coins,
      updateCoins,

      levelData,
      updateLevelData,

      loading: loading || authLoading,
    }),
    [
      refreshKey,
      triggerRefresh,
      syncAppState,
      coins,
      updateCoins,
      levelData,
      updateLevelData,
      loading,
      authLoading,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export const useAppState = () => useContext(AppStateContext);