import React, { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);
  const [summary, setSummary] = useState({ earned: 0, total: 0, nextUnlock: null });
  const [loading, setLoading] = useState(true);

  async function loadAchievements() {
    try {
      const { data } = await api.get("/achievements");
      const items = Array.isArray(data)
        ? data
        : data.items || data.achievements || [];
      setAchievements(items);
      setSummary({
        earned: Number(
          Array.isArray(data)
            ? items.filter((item) => item.unlocked ?? item.earned).length
            : data.earned_count ?? 0
        ),
        total: Number(Array.isArray(data) ? items.length : data.total ?? items.length),
        nextUnlock: Array.isArray(data) ? null : data.next_unlock || null,
      });
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load achievements"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAchievements();
  }, []);

  const groupedAchievements = useMemo(() => {
    const order = ["Habits", "Tasks", "Streaks", "Coins", "Rewards", "Quests"];
    const groups = achievements.reduce((result, achievement) => {
      const category = achievement.category || "Other";
      (result[category] ||= []).push(achievement);
      return result;
    }, {});
    return Object.entries(groups).sort(([a], [b]) => {
      const aIndex = order.indexOf(a);
      const bIndex = order.indexOf(b);
      return (aIndex < 0 ? order.length : aIndex) - (bIndex < 0 ? order.length : bIndex);
    });
  }, [achievements]);

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Achievements</h1>
        <p style={styles.subtitle}>Loading achievements...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Achievements</h1>
          <p style={styles.subtitle}>
            Milestones that show how far you’ve come.
          </p>
        </div>
      </div>

      {achievements.length > 0 && (
        <div style={styles.summaryCard}>
          <div style={styles.summaryText}>
            <strong>
              {summary.earned}/{summary.total || achievements.length} unlocked
            </strong>
            <span>
              {Math.round(
                (summary.earned / (summary.total || achievements.length)) * 100
              )}% complete
            </span>
          </div>
          {summary.nextUnlock && (
            <span>
              Next: {summary.nextUnlock.title || summary.nextUnlock.name}
            </span>
          )}
        </div>
      )}

      {achievements.length === 0 ? (
        <div style={styles.emptyCard}>
          <h2>No achievements yet</h2>
          <p style={styles.subtitle}>
            Keep completing habits and tasks — achievements will unlock as you
            go.
          </p>
        </div>
      ) : (
        groupedAchievements.map(([category, items]) => (
          <section key={category} style={styles.section}>
            <h2 style={styles.sectionTitle}>{category}</h2>
            <div style={styles.grid}>
          {items.map((ach) => {
            const id = ach.id || ach._id || ach.achievement_id;
            const unlocked = Boolean(ach.unlocked ?? ach.earned);
            const progress = Number(ach.progress ?? 0);
            const target = Number(ach.target ?? 1);
            const percent = Number(
              ach.percent ?? Math.min(100, Math.round((progress / target) * 100))
            );

            return (
              <div
                key={id}
                style={{
                  ...styles.card,
                  ...(unlocked ? styles.unlockedCard : styles.lockedCard),
                }}
              >
                <div style={styles.cardTop}>
                  <div>
                    <h2 style={styles.name}>{ach.title || ach.name}</h2>
                    <p style={styles.meta}>
                      {ach.category || "Achievement"}
                    </p>
                  </div>

                  <div style={styles.badge}>
                    {ach.newly_earned ? "New" : unlocked ? "Unlocked" : "Locked"}
                  </div>
                </div>

                {ach.description && (
                  <p style={styles.description}>{ach.description}</p>
                )}

                {!unlocked && (
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
                )}

                {unlocked && (
                  <div style={styles.rewardBox}>
                    {ach.rarity ? `${ach.rarity} · ` : ""}+{ach.reward_coins ?? ach.coins ?? 50} coins earned
                  </div>
                )}
              </div>
            );
          })}
            </div>
          </section>
        ))
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
    alignItems: "center",
    gap: 16,
    marginBottom: 26,
    padding: "18px 22px",
    borderRadius: 22,
    background: "#fff7df",
    border: "1px solid rgba(242, 184, 75, 0.45)",
    color: "var(--primary-dark)",
    flexWrap: "wrap",
  },

  summaryText: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  section: {
    marginBottom: 28,
  },

  sectionTitle: {
    margin: "0 0 14px",
    color: "var(--text)",
    fontSize: 24,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: 20,
  },

  card: {
    padding: 22,
    borderRadius: 28,
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
    transition: "transform 0.15s ease",
  },

  unlockedCard: {
    background: "linear-gradient(180deg, #f4fff6 0%, #ffffff 100%)",
  },

  lockedCard: {
    background: "#fafaf8",
    opacity: 0.82,
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
  },

  name: {
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

  badge: {
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

  rewardBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    background: "#fff7df",
    color: "var(--primary-dark)",
    border: "1px solid rgba(242, 184, 75, 0.45)",
    fontWeight: 900,
    textAlign: "center",
  },
};
