import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Coins, Lock, Palette, Sparkles } from "lucide-react";
import { toast } from "sonner";

import api, { formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useAppState } from "@/context/AppStateContext";
import { useTheme } from "@/context/ThemeContext";

const TYPE_LABELS = {
  included: "Included",
  store: "Coin Store",
  achievement: "Achievement",
  level: "Level Unlock",
};

const ACHIEVEMENT_LABELS = {
  "streak-7": "Reach a 7-day streak",
  "coins-500": "Earn 500 coins",
  "tasks-50": "Complete 50 tasks",
  "streak-30": "Reach a 30-day streak",
  "habits-25": "Complete habits 25 times",
  "quests-10": "Claim 10 quest rewards",
};

export default function ThemeStore() {
  const { refresh } = useAuth();
  const { coins, syncAppState, updateCoins } = useAppState();
  const { selectTheme: selectThemeFromContext, themes } = useTheme();

  const [loading, setLoading] = useState(true);
  const [busyTheme, setBusyTheme] = useState(null);
  const [data, setData] = useState({
    owned_themes: [],
    selected_theme: "light",
    store: [],
    level_data: null,
    unlocked_now: [],
  });

  const ownedSet = useMemo(
    () => new Set(data.owned_themes || []),
    [data.owned_themes]
  );

  async function loadThemes() {
    setLoading(true);

    try {
      const res = await api.get("/themes/me");
      setData(res.data);
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadThemes();
  }, []);

  async function applyThemeSelection(themeId) {
    setBusyTheme(themeId);

    try {
      await selectThemeFromContext(themeId);

      setData((current) => ({
        ...current,
        selected_theme: themeId,
      }));

      toast.success("Theme applied");
      await loadThemes();
      await refresh?.();
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail));
    } finally {
      setBusyTheme(null);
    }
  }

  async function purchaseTheme(themeId) {
    setBusyTheme(themeId);

    try {
      const { data: purchaseData } = await api.post("/themes/purchase", {
        theme_id: themeId,
      });

      if (purchaseData.new_balance !== undefined) {
        updateCoins(purchaseData.new_balance);
      }

      toast.success("Theme purchased");
      await loadThemes();
      await syncAppState();
      await refresh?.();
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail));
    } finally {
      setBusyTheme(null);
    }
  }

  function getAction(theme) {
    const owned = ownedSet.has(theme.id);
    const selected = data.selected_theme === theme.id;

    if (selected) {
      return (
        <button style={{ ...styles.button, ...styles.selectedButton }} disabled>
          <CheckCircle2 size={17} />
          Selected
        </button>
      );
    }

    if (owned) {
      return (
        <button
          style={styles.button}
          disabled={busyTheme === theme.id}
          onClick={() => applyThemeSelection(theme.id)}
        >
          <Palette size={17} />
          {busyTheme === theme.id ? "Applying..." : "Apply"}
        </button>
      );
    }

    if (theme.type === "store") {
      const shortfall = Math.max(0, Number(theme.price || 0) - coins);
      return (
        <button
          style={{ ...styles.button, ...(shortfall > 0 ? styles.lockedButton : {}) }}
          disabled={busyTheme === theme.id || shortfall > 0}
          onClick={() => purchaseTheme(theme.id)}
        >
          <Coins size={17} />
          {busyTheme === theme.id
            ? "Buying..."
            : shortfall > 0
              ? `Need ${shortfall} more`
              : `Buy for ${theme.price}`}
        </button>
      );
    }

    return (
      <button style={{ ...styles.button, ...styles.lockedButton }} disabled>
        <Lock size={17} />
        Locked
      </button>
    );
  }

  function getRequirement(theme) {
    if (theme.type === "achievement") {
      return ACHIEVEMENT_LABELS[theme.unlockAchievement]
        ? `Unlock: ${ACHIEVEMENT_LABELS[theme.unlockAchievement]}`
        : "Unlock through achievements";
    }

    if (theme.type === "level") {
      return `Reach level ${theme.unlockLevel}`;
    }

    if (theme.type === "store") {
      return `${theme.price} coins`;
    }

    return "Available by default";
  }

  function getPreviewStyle(theme) {
    const themeVars = themes?.[theme.id]?.vars;

    const accent = themeVars?.["--accent"] || "var(--accent)";
    const primary = themeVars?.["--primary"] || "var(--primary)";
    const primaryDark = themeVars?.["--primary-dark"] || "var(--primary-dark)";

    return {
      ...styles.preview,
      background: `radial-gradient(circle at 30% 30%, ${accent}, transparent 24%), linear-gradient(135deg, ${primary}, ${primaryDark})`,
    };
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Customize</p>
          <h1 style={styles.title}>Theme Store</h1>
          <p style={styles.subtitle}>
            Spend coins, unlock achievement themes, and choose the visual style
            that fits your orbit.
          </p>
        </div>

        <div style={styles.levelCard}>
          <Sparkles size={22} />
          <div>
            <strong>Level {data.level_data?.level ?? 1}</strong>
            <span>{data.level_data?.current_xp ?? 0} XP</span>
            <span>{coins} coins</span>
          </div>
        </div>
      </header>

      {loading ? (
        <div style={styles.emptyCard}>Loading themes...</div>
      ) : (
        <section style={styles.grid}>
          {(data.store || []).map((theme) => {
            const owned = ownedSet.has(theme.id);
            const selected = data.selected_theme === theme.id;
            const unlockedNow = data.unlocked_now?.includes(theme.id);

            return (
              <article
                key={theme.id}
                style={{
                  ...styles.card,
                  ...(selected ? styles.selectedCard : {}),
                  ...(unlockedNow ? styles.unlockedCard : {}),
                }}
              >
                <div style={getPreviewStyle(theme)}>
                  <div style={styles.orbit} />
                  <div style={styles.previewText}>{theme.name}</div>
                </div>

                <div style={styles.cardHeader}>
                  <div>
                    <h2 style={styles.themeName}>{theme.name}</h2>
                    <p style={styles.themeMeta}>{getRequirement(theme)}</p>
                  </div>

                  <span
                    style={{
                      ...styles.badge,
                      ...(owned ? styles.ownedBadge : {}),
                      ...(unlockedNow ? styles.unlockedBadge : {}),
                    }}
                  >
                    {unlockedNow
                      ? "New"
                      : owned
                        ? "Owned"
                        : TYPE_LABELS[theme.type] || "Theme"}
                  </span>
                </div>

                <div style={styles.cardFooter}>{getAction(theme)}</div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  title: {
    margin: 0,
    color: "var(--text)",
    fontSize: 44,
    lineHeight: 1,
    letterSpacing: "-0.06em",
  },
  subtitle: {
    margin: "12px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: 1.5,
    maxWidth: 680,
  },
  levelCard: {
    minWidth: 150,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 22,
    background: "#fff7df",
    border: "1px solid rgba(242, 184, 75, 0.55)",
    color: "var(--primary-dark)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 18,
  },
  card: {
    background: "rgba(255,255,255,0.92)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    padding: 18,
    boxShadow: "var(--shadow)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  selectedCard: {
    borderColor: "var(--primary)",
    boxShadow: "0 0 0 3px rgba(79, 143, 91, 0.16), var(--shadow)",
  },
  unlockedCard: {
    borderColor: "var(--accent)",
    boxShadow: "0 0 0 3px rgba(242, 184, 75, 0.2), var(--shadow)",
  },
  preview: {
    height: 130,
    borderRadius: 22,
    position: "relative",
    overflow: "hidden",
    color: "white",
  },
  orbit: {
    position: "absolute",
    width: 150,
    height: 70,
    border: "2px solid rgba(255,255,255,0.55)",
    borderRadius: "50%",
    transform: "rotate(-24deg)",
    right: -22,
    top: 26,
  },
  previewText: {
    position: "absolute",
    left: 18,
    bottom: 16,
    fontWeight: 900,
    fontSize: 22,
    letterSpacing: "-0.04em",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  themeName: {
    margin: 0,
    color: "var(--text)",
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "-0.04em",
  },
  themeMeta: {
    margin: "6px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.4,
  },
  badge: {
    borderRadius: 999,
    padding: "7px 10px",
    background: "#f3f4f6",
    color: "var(--muted)",
    fontWeight: 900,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  ownedBadge: {
    background: "#eef6ef",
    color: "var(--primary-dark)",
  },
  unlockedBadge: {
    background: "#fff7df",
    color: "var(--primary-dark)",
  },
  cardFooter: {
    marginTop: "auto",
  },
  button: {
    width: "100%",
    border: "none",
    borderRadius: 999,
    padding: "12px 14px",
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  selectedButton: {
    background: "#eef6ef",
    color: "var(--primary-dark)",
    cursor: "default",
  },
  lockedButton: {
    background: "#f3f4f6",
    color: "var(--muted)",
    cursor: "not-allowed",
  },
  emptyCard: {
    padding: 24,
    borderRadius: 24,
    background: "white",
    border: "1px solid var(--border)",
    color: "var(--muted)",
    fontWeight: 800,
  },
};
