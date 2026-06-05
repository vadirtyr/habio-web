import React, { useEffect, useState } from "react";
import {
  Award,
  Coins,
  Flag,
  Flame,
  Repeat,
  Rocket,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { recapApi, formatApiError } from "@/lib/api";

export default function WeeklyRecap() {
  const [recaps, setRecaps] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRecaps() {
    try {
      const { data } = await recapApi.list();
      setRecaps(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        await recapApi.generate();
      } catch (err) {
        // ignore — recap may already exist
      }
      await loadRecaps();
    }
    init();
  }, []);

  const latest = recaps[0] || null;

  return (
    <div style={styles.page} data-testid="weekly-recap-page">
      <header style={styles.header}>
        <p style={styles.eyebrow}>OurOrbit</p>
        <h1 style={styles.title}>Weekly Recap</h1>
        <p style={styles.subtitle}>See how your orbit grew over the last week.</p>
      </header>

      {loading ? (
        <p style={styles.status}>Loading your recap...</p>
      ) : !latest ? (
        <div style={styles.empty}>
          <TrendingUp size={40} />
          <h2 style={styles.emptyTitle}>No weekly recap yet</h2>
          <p style={styles.emptyText}>
            Complete a few habits and tasks this week to generate your first
            recap.
          </p>
        </div>
      ) : (
        <>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <TrendingUp size={26} />
              </div>
              <div>
                <h2 style={styles.cardTitle}>
                  {latest.week_start} → {latest.week_end}
                </h2>
                <p style={styles.cardCopy}>Your latest progress snapshot.</p>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <StatTile Icon={Repeat} label="Habits" value={latest.habits_completed} />
              <StatTile Icon={Flag} label="Tasks" value={latest.tasks_completed} />
              <StatTile Icon={Sparkles} label="Quests" value={latest.quests_completed} />
              <StatTile Icon={Coins} label="Coins" value={latest.coins_earned} />
              <StatTile Icon={Star} label="XP" value={latest.xp_earned} />
              <StatTile Icon={Award} label="Achievements" value={latest.achievements_unlocked} />
            </div>

            {latest.level_ups > 0 && (
              <div style={styles.levelBanner}>
                <Rocket size={20} />
                You leveled up {latest.level_ups} time
                {latest.level_ups === 1 ? "" : "s"} this week.
              </div>
            )}
          </div>

          {recaps.length > 1 && (
            <section style={styles.history}>
              <h3 style={styles.historyTitle}>Past Recaps</h3>
              <div style={styles.historyList}>
                {recaps.slice(1).map((recap) => (
                  <div key={recap.id} style={styles.historyCard}>
                    <strong style={styles.historyRange}>
                      {recap.week_start} → {recap.week_end}
                    </strong>
                    <p style={styles.historyCopy}>
                      {recap.habits_completed} habits · {recap.tasks_completed} tasks ·{" "}
                      {recap.coins_earned} coins
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function StatTile({ Icon, label, value }) {
  return (
    <div style={styles.tile}>
      <Icon size={22} style={{ color: "var(--primary-dark)" }} />
      <strong style={styles.tileValue}>{value || 0}</strong>
      <span style={styles.tileLabel}>{label}</span>
    </div>
  );
}

const styles = {
  page: { width: "100%" },
  header: { marginBottom: 24, maxWidth: 720 },
  eyebrow: {
    margin: "0 0 10px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  title: {
    margin: 0,
    fontSize: 44,
    lineHeight: 1,
    letterSpacing: "-0.06em",
    color: "var(--text)",
  },
  subtitle: { margin: "12px 0 0", color: "var(--muted)", fontWeight: 600, fontSize: 16 },
  status: { color: "var(--muted)", fontWeight: 700 },
  card: {
    padding: 24,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 14, marginBottom: 22 },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    flex: "0 0 auto",
  },
  cardTitle: { margin: 0, fontSize: 22, color: "var(--text)", letterSpacing: "-0.03em" },
  cardCopy: { margin: "6px 0 0", color: "var(--muted)", fontWeight: 700, fontSize: 14 },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: 14,
  },
  tile: {
    padding: 18,
    borderRadius: 20,
    background: "#f9fbf8",
    border: "1px solid rgba(79, 143, 91, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  tileValue: { fontSize: 28, color: "var(--primary-dark)", lineHeight: 1 },
  tileLabel: { color: "var(--muted)", fontWeight: 800, fontSize: 13 },
  levelBanner: {
    marginTop: 18,
    padding: 16,
    borderRadius: 18,
    background: "rgba(79, 143, 91, 0.1)",
    border: "1px solid rgba(79, 143, 91, 0.3)",
    color: "var(--primary-dark)",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  history: { marginTop: 28 },
  historyTitle: { margin: "0 0 14px", color: "var(--text)", fontSize: 22 },
  historyList: { display: "flex", flexDirection: "column", gap: 12 },
  historyCard: {
    padding: 18,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 22,
    boxShadow: "var(--shadow)",
  },
  historyRange: { color: "var(--text)", fontSize: 15 },
  historyCopy: { margin: "6px 0 0", color: "var(--muted)", fontWeight: 700, fontSize: 14 },
  empty: {
    padding: 40,
    textAlign: "center",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
    color: "var(--primary-dark)",
  },
  emptyTitle: { margin: "14px 0 6px", color: "var(--text)" },
  emptyText: { margin: "0 auto", maxWidth: 420, color: "var(--muted)", fontWeight: 700, lineHeight: 1.55 },
};
