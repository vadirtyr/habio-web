import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import { toast } from "sonner";

export default function Quests() {
  const { syncAppState, updateCoins, updateLevelData } = useAppState();

  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  async function loadQuests() {
    try {
      const { data } = await api.get("/quests");

      setQuests(
        Array.isArray(data) ? data : data.items || data.quests || []
      );
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to load quests"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuests();
  }, []);

  const sortedQuests = useMemo(
    () =>
      [...quests].sort((a, b) => {
        const aReady = Boolean(a.claimable && !a.claimed);
        const bReady = Boolean(b.claimable && !b.claimed);
        if (aReady !== bReady) return aReady ? -1 : 1;
        if (Boolean(a.claimed) !== Boolean(b.claimed)) return a.claimed ? 1 : -1;
        return Number(b.percent ?? b.progress ?? 0) - Number(a.percent ?? a.progress ?? 0);
      }),
    [quests]
  );

  const completedCount = quests.filter((quest) => quest.completed || quest.claimed).length;
  const readyCount = quests.filter((quest) => quest.claimable && !quest.claimed).length;

  async function claimQuest(questId) {
    setClaimingId(questId);

    try {
      const { data } = await api.post(`/quests/${questId}/claim`);

      if (data.new_balance !== undefined) updateCoins(data.new_balance);
      if (data.level_data) updateLevelData(data.level_data);

      await syncAppState();
      await loadQuests();

      toast.success(
        `Quest reward claimed! +${data.coins_earned || 0} coins, +${data.xp_earned || 0} XP`
      );
      if (data.new_avatars?.length) {
        toast.success(`${data.new_avatars.length} avatar${data.new_avatars.length === 1 ? "" : "s"} unlocked`);
      }
      if (data.new_achievements?.length) {
        toast.success(`${data.new_achievements.length} achievement${data.new_achievements.length === 1 ? "" : "s"} unlocked`);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to claim quest"
      );
    } finally {
      setClaimingId(null);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Quests</h1>
        <p style={styles.subtitle}>Loading quests...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Quests</h1>
          <p style={styles.subtitle}>
            Complete challenges, build momentum, and earn bonus coins.
          </p>
        </div>
      </div>

      {quests.length > 0 && (
        <div style={styles.summaryCard}>
          <strong>{completedCount}/{quests.length} completed</strong>
          <span>{readyCount > 0 ? `${readyCount} ready to claim` : "Keep building progress"}</span>
        </div>
      )}

      {quests.length === 0 ? (
        <div style={styles.emptyCard}>
          <h2>No quests yet</h2>
          <p style={styles.subtitle}>
            Quests will appear here as you use OurOrbit.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {sortedQuests.map((quest) => {
            const questId = quest.id || quest._id;

            const progress = Number(quest.progress ?? quest.current ?? 0);

            const target = Number(quest.target ?? quest.goal ?? 1);

            const percent = Number(
              quest.percent ??
                Math.min(100, Math.round((progress / target) * 100))
            );

            const completed = Boolean(quest.completed || quest.claimed);
            const claimed = Boolean(quest.claimed);
            const claimable = Boolean(quest.claimable);

            return (
              <div
                key={questId}
                style={{
                  ...styles.card,
                  ...(completed ? styles.completedCard : {}),
                }}
              >
                <div style={styles.cardTop}>
                  <div>
                    <h2 style={styles.questName}>
                      {quest.title || quest.name}
                    </h2>

                    <p style={styles.meta}>
                      {quest.type ||
                        quest.category ||
                        `${quest.period || "daily"} quest`}
                    </p>
                  </div>

                  <div style={styles.coinBadge}>
                    +{quest.reward_coins ?? quest.coins ?? quest.reward ?? 25}
                  </div>
                </div>

                {quest.description && (
                  <p style={styles.description}>{quest.description}</p>
                )}

                <div style={styles.progressWrap}>
                  <div style={styles.progressHeader}>
                    <strong>
                      {progress}/{target}
                    </strong>

                    <span>{percent}%</span>
                  </div>

                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${percent}%`,
                      }}
                    />
                  </div>
                </div>

                <div style={styles.footer}>
                  <div
                    style={{
                      ...styles.statusBadge,
                      ...(completed ? styles.completedBadge : {}),
                    }}
                  >
                    {claimed
                      ? "Claimed"
                      : completed
                      ? "Completed"
                      : "In Progress"}
                  </div>

                  {claimable && !claimed && (
                    <button
                      style={styles.claimButton}
                      disabled={claimingId === questId}
                      onClick={() => claimQuest(questId)}
                    >
                      {claimingId === questId
                        ? "Claiming..."
                        : "Claim Reward"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 30,
    flexWrap: "wrap",
  },

  title: {
    margin: 0,
    fontSize: 42,
    lineHeight: 1,
    letterSpacing: "-0.05em",
    color: "var(--text)",
  },

  subtitle: {
    margin: "10px 0 0",
    color: "var(--muted)",
    fontWeight: 600,
    fontSize: 16,
  },

  emptyCard: {
    padding: 34,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
    textAlign: "center",
  },

  summaryCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
    padding: "16px 20px",
    borderRadius: 20,
    background: "#fff7df",
    border: "1px solid rgba(242, 184, 75, 0.45)",
    color: "var(--primary-dark)",
    flexWrap: "wrap",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 20,
  },

  card: {
    padding: 22,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
  },

  completedCard: {
    background: "linear-gradient(180deg, #f4fff6 0%, #ffffff 100%)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
  },

  questName: {
    margin: 0,
    fontSize: 23,
    letterSpacing: "-0.03em",
    color: "var(--text)",
  },

  meta: {
    margin: "7px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 14,
  },

  coinBadge: {
    padding: "7px 11px",
    borderRadius: 999,
    background: "#fff7df",
    color: "var(--primary-dark)",
    border: "1px solid rgba(242, 184, 75, 0.55)",
    fontWeight: 900,
    whiteSpace: "nowrap",
    fontSize: 13,
  },

  description: {
    marginTop: 14,
    color: "var(--muted)",
    lineHeight: 1.5,
    fontSize: 15,
  },

  progressWrap: {
    marginTop: 20,
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 9,
    fontWeight: 800,
    color: "var(--primary-dark)",
  },

  progressTrack: {
    height: 12,
    borderRadius: 999,
    background: "#eef2ea",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--primary), var(--accent))",
    borderRadius: 999,
  },

  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 18,
    flexWrap: "wrap",
  },

  statusBadge: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: 999,
    background: "#eef6ef",
    color: "var(--primary-dark)",
    fontWeight: 900,
    fontSize: 13,
  },

  completedBadge: {
    background: "#dff3e2",
  },

  claimButton: {
    padding: "11px 16px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },
};
