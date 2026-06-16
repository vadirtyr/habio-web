import React, { useEffect, useMemo, useState } from "react";
import {
  Award,
  Bell,
  CheckCircle2,
  Coins,
  Flame,
  Rocket,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { api, notificationApi } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/UserAvatar";
import { getOrbitItems, mergeUnique } from "@/lib/orbitItems";

export default function Dashboard() {
  const navigate = useNavigate();
  const { refreshKey, coins, levelData } = useAppState();
  const { user } = useAuth();

  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [orbitSummaries, setOrbitSummaries] = useState([]);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [habitsRes, tasksRes, rewardsRes, orbitItems] = await Promise.all([
        api.get("/habits"),
        api.get("/tasks"),
        api.get("/rewards"),
        getOrbitItems().catch(() => ({ habits: [], tasks: [] })),
      ]);

      const habitsData = habitsRes.data;
      const tasksData = tasksRes.data;
      const rewardsData = rewardsRes.data;

      setHabits(mergeUnique(Array.isArray(habitsData) ? habitsData : habitsData.habits || [], orbitItems.habits, "habit").sort((a, b) => Number(b.is_orbit_item) - Number(a.is_orbit_item)));
      setTasks(mergeUnique(Array.isArray(tasksData) ? tasksData : tasksData.tasks || [], orbitItems.tasks, "task").sort((a, b) => Number(b.is_orbit_item) - Number(a.is_orbit_item)));
      setOrbitSummaries(orbitItems.orbits || []);
      setRewards(Array.isArray(rewardsData) ? rewardsData : rewardsData.rewards || []);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [refreshKey]);

  useEffect(() => {
    let active = true;

    async function loadUnread() {
      try {
        const { data } = await notificationApi.getUnreadCount();
        if (active) setUnreadCount(data?.count || 0);
      } catch (err) {
        // The sidebar still provides notification access if this request fails.
      }
    }

    loadUnread();
    window.addEventListener("habio:notif-refresh", loadUnread);

    return () => {
      active = false;
      window.removeEventListener("habio:notif-refresh", loadUnread);
    };
  }, []);

  const completedHabits = habits.filter((h) => h.completed_today).length;
  const openTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const bestStreak = habits.reduce(
    (max, habit) => Math.max(max, habit.streak || 0),
    0
  );

  const totalProgress = useMemo(() => {
    const total = habits.length + tasks.length;
    const done = completedHabits + completedTasks;

    if (total === 0) return 0;

    return Math.round((done / total) * 100);
  }, [habits, tasks, completedHabits, completedTasks]);

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <Sparkles size={34} />
          <h1 style={styles.loadingTitle}>Loading your orbit...</h1>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <div>
          <div style={styles.heroHeadingRow}>
            <p style={styles.eyebrow}>Welcome back to OurOrbit</p>
            <div style={styles.headerActions}>
            <button type="button" style={styles.avatarButton} onClick={() => navigate("/profile")} aria-label="Open profile">
              <UserAvatar user={user} size={42} />
            </button>
            <button
              type="button"
              style={styles.notificationButton}
              onClick={() => navigate("/notifications")}
              aria-label={
                unreadCount
                  ? `${unreadCount} unread notifications`
                  : "Notifications"
              }
              data-testid="dashboard-notifications-button"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span style={styles.notificationBadge}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
            </div>
          </div>

          <h1 style={styles.title}>Today’s Progress</h1>

          <p style={styles.subtitle}>
            Small actions repeated consistently become meaningful change.
          </p>

          <div style={styles.heroActions}>
            <button
              style={styles.primaryButton}
              onClick={() => navigate("/habits/new")}
            >
              <Rocket size={18} />
              Create Habit
            </button>

            <button
              style={styles.secondaryButton}
              onClick={() => navigate("/tasks/new")}
            >
              <Target size={18} />
              Add Task
            </button>
          </div>
        </div>

        <div style={styles.heroSide}>
          <div style={styles.coinCard}>
            <div style={styles.coinHeader}>
              <Coins size={18} />
              Coins
            </div>

            <strong style={styles.coinValue}>{coins}</strong>

            <p style={styles.coinSubtext}>
              Earn more by completing habits and tasks.
            </p>
          </div>

          <div style={styles.levelCard}>
            <div style={styles.levelHeader}>
              <Award size={18} />
              Level {levelData?.level ?? 1}
            </div>

            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(
                    ((levelData?.current_xp || 0) /
                      (levelData?.next_level_xp || 100)) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>

            <p style={styles.levelText}>
              {levelData?.current_xp ?? 0} XP
            </p>
          </div>
        </div>
      </section>

      <section style={styles.orbitsSection}>
        <div style={styles.orbitsHeader}><div><p style={styles.eyebrow}>Together</p><h2 style={styles.orbitsTitle}>Your Orbits</h2></div><button style={styles.smallButton} onClick={() => navigate("/orbits")}>View all</button></div>
        {orbitSummaries.length ? <>
          <div style={styles.orbitStrip}>{orbitSummaries.map(orbit => <button key={orbit.id} style={styles.orbitChip} onClick={() => navigate(`/orbits/${orbit.id}`)}><span style={styles.orbitIcon}><Users size={19}/></span><strong>{orbit.name}</strong><span style={styles.orbitMeta}>Level {orbit.level || 1} · {orbit.member_count || 0} members</span></button>)}</div>
          <div style={styles.featuredOrbitGrid}>{orbitSummaries.slice(0, 3).map(orbit => <button key={`featured-${orbit.id}`} style={styles.featuredOrbitCard} onClick={() => navigate(`/orbits/${orbit.id}`)}><div style={styles.orbitCardHeader}><strong>{orbit.name}</strong><span style={styles.orbitLevel}>Level {orbit.level || 1}</span></div><div style={styles.orbitTrack}><div style={{...styles.orbitFill, width:`${Math.min(100, orbit.weekly_completion_rate || 0)}%`}}/></div><p style={styles.orbitMeta}>{orbit.weekly_completion_rate || 0}% this week · {orbit.active_challenges_count || 0} challenges · {orbit.due_count || 0} due</p></button>)}</div>
        </> : <div style={styles.noOrbitCard}><Users size={36}/><div><h3 style={styles.noOrbitTitle}>Create your first Orbit</h3><p style={styles.noOrbitText}>Share habits, tasks, challenges, and progress with people who matter.</p></div><div style={styles.orbitActions}><button style={styles.primaryButton} onClick={() => navigate("/orbits/new")}>Create Orbit</button><button style={styles.secondaryButton} onClick={() => navigate("/orbits/new")}>Start from Template</button></div></div>}
      </section>

      <section style={styles.statsGrid}>
        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Habits completed"
          value={`${completedHabits}/${habits.length}`}
        />

        <StatCard
          icon={<Target size={20} />}
          label="Open tasks"
          value={openTasks}
        />

        <StatCard
          icon={<Flame size={20} />}
          label="Best streak"
          value={`${bestStreak} days`}
        />

        <StatCard
          icon={<Sparkles size={20} />}
          label="Daily progress"
          value={`${totalProgress}%`}
        />
      </section>

      <section style={styles.sectionGrid}>
        <Panel
          title="Habits"
          subtitle="Build consistency daily"
          buttonText="+ New Habit"
          onClick={() => navigate("/habits/new")}
        >
          {habits.slice(0, 4).map((habit) => (
            <MiniItem
              key={habit._list_key || habit.id || habit._id}
              title={habit.name}
              detail={habit.is_orbit_item ? habit.orbit_name : "Personal"}
              badge={habit.completed_today ? "Done" : "Today"}
            />
          ))}

          {habits.length === 0 && (
            <EmptyLine text="No habits yet. Start your first streak today." />
          )}
        </Panel>

        <Panel
          title="Tasks"
          subtitle="One-time progress"
          buttonText="+ New Task"
          onClick={() => navigate("/tasks/new")}
        >
          {tasks
            .filter((task) => !task.completed)
            .slice(0, 4)
            .map((task) => (
              <MiniItem
                key={task._list_key || task.id || task._id}
                title={task.name || task.title}
                detail={task.is_orbit_item ? task.orbit_name : "Personal"}
                badge={task.due_date || "Open"}
              />
            ))}

          {tasks.filter((task) => !task.completed).length === 0 && (
            <EmptyLine text="No open tasks. Clear mind, clean orbit." />
          )}
        </Panel>

        <Panel
          title="Rewards"
          subtitle="Celebrate progress"
          buttonText="+ New Reward"
          onClick={() => navigate("/rewards/new")}
        >
          {rewards.slice(0, 4).map((reward) => (
            <MiniItem
              key={reward.id || reward._id}
              title={reward.name}
              detail={reward.category || "Reward"}
              badge={`${reward.cost ?? reward.coin_cost ?? 50} coins`}
            />
          ))}

          {rewards.length === 0 && (
            <EmptyLine text="Create rewards worth earning." />
          )}
        </Panel>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>{icon}</div>
      <strong style={styles.statValue}>{value}</strong>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function Panel({ title, subtitle, buttonText, onClick, children }) {
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div>
          <h2 style={styles.panelTitle}>{title}</h2>
          <p style={styles.panelSubtitle}>{subtitle}</p>
        </div>

        <button style={styles.smallButton} onClick={onClick}>
          {buttonText}
        </button>
      </div>

      <div style={styles.list}>{children}</div>
    </div>
  );
}

function MiniItem({ title, detail, badge }) {
  return (
    <div style={styles.item}>
      <div>
        <strong>{title}</strong>
        <p style={styles.itemDetail}>{detail}</p>
      </div>

      <span style={styles.badge}>{badge}</span>
    </div>
  );
}

function EmptyLine({ text }) {
  return <p style={styles.emptyText}>{text}</p>;
}

const styles = {
  page: {
    width: "100%",
  },
  orbitsSection: { marginBottom: 24 },
  orbitsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 14 },
  orbitsTitle: { margin: 0, color: "var(--text)", fontSize: 28, letterSpacing: "-0.04em" },
  orbitStrip: { display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10 },
  orbitChip: { minWidth: 210, padding: 16, display: "grid", gap: 7, textAlign: "left", borderRadius: 20, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", cursor: "pointer" },
  orbitIcon: { width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 13, color: "var(--primary-dark)", background: "color-mix(in srgb, var(--primary) 12%, var(--surface))" },
  orbitMeta: { margin: "8px 0 0", color: "var(--muted)", fontWeight: 700, fontSize: 13 },
  featuredOrbitGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 12, marginTop: 4 },
  featuredOrbitCard: { padding: 18, borderRadius: 22, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)", textAlign: "left", cursor: "pointer" },
  orbitCardHeader: { display: "flex", justifyContent: "space-between", gap: 12 },
  orbitLevel: { color: "var(--primary-dark)", fontWeight: 800 },
  orbitTrack: { height: 8, marginTop: 16, borderRadius: 999, overflow: "hidden", background: "rgba(127,127,127,0.16)" },
  orbitFill: { height: "100%", borderRadius: 999, background: "var(--primary)" },
  noOrbitCard: { padding: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", borderRadius: 24, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--primary-dark)" },
  noOrbitTitle: { margin: 0, color: "var(--text)" },
  noOrbitText: { margin: "6px 0 0", color: "var(--muted)", fontWeight: 700 },
  orbitActions: { marginLeft: "auto", display: "flex", gap: 10, flexWrap: "wrap" },

  loadingPage: {
    minHeight: "60vh",
    display: "grid",
    placeItems: "center",
  },

  loadingCard: {
    padding: 30,
    borderRadius: 30,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
    textAlign: "center",
  },

  loadingTitle: {
    marginTop: 14,
    color: "var(--text)",
  },

  eyebrow: {
    margin: "0 0 10px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },

  heroHeadingRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  headerActions: { display: "flex", alignItems: "center", gap: 10 },

  notificationButton: {
    position: "relative",
    width: 44,
    height: 44,
    border: "1px solid var(--border)",
    borderRadius: 16,
    background: "var(--surface)",
    color: "var(--text)",
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    boxShadow: "var(--shadow)",
  },
  avatarButton: { padding: 0, border: 0, borderRadius: 999, background: "transparent", cursor: "pointer" },

  notificationBadge: {
    position: "absolute",
    top: -7,
    right: -7,
    minWidth: 20,
    height: 20,
    padding: "0 5px",
    borderRadius: 999,
    background: "var(--danger)",
    color: "white",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 900,
    border: "2px solid var(--bg)",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: 24,
    alignItems: "stretch",
    marginBottom: 30,
    flexWrap: "wrap",
  },

  heroSide: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minWidth: 280,
  },

  title: {
    margin: 0,
    fontSize: 52,
    lineHeight: 1,
    letterSpacing: "-0.06em",
    color: "var(--text)",
  },

  subtitle: {
    margin: "14px 0 0",
    color: "var(--muted)",
    fontWeight: 600,
    fontSize: 17,
    maxWidth: 620,
    lineHeight: 1.6,
  },

  heroActions: {
    display: "flex",
    gap: 12,
    marginTop: 22,
    flexWrap: "wrap",
  },

  primaryButton: {
    padding: "13px 18px",
    borderRadius: 999,
    border: "none",
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    boxShadow: "0 10px 24px rgba(79, 143, 91, 0.24)",
  },

  secondaryButton: {
    padding: "13px 18px",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },

  coinCard: {
    padding: 24,
    borderRadius: 28,
    background:
      "linear-gradient(135deg, #fff7df 0%, #ffe8a3 100%)",
    boxShadow: "var(--shadow)",
    border: "1px solid rgba(242, 184, 75, 0.45)",
  },

  coinHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 900,
    color: "var(--primary-dark)",
  },

  coinValue: {
    display: "block",
    fontSize: 44,
    marginTop: 10,
    color: "var(--primary-dark)",
    lineHeight: 1,
  },

  coinSubtext: {
    margin: "10px 0 0",
    color: "var(--primary-dark)",
    opacity: 0.7,
    fontWeight: 700,
    fontSize: 13,
  },

  levelCard: {
    padding: 22,
    borderRadius: 28,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },

  levelHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--text)",
    fontWeight: 900,
    marginBottom: 14,
  },

  progressBar: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    background: "#edf2ef",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, var(--primary), var(--primary-dark))",
  },

  levelText: {
    margin: "10px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 14,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginBottom: 26,
  },

  statCard: {
    padding: 22,
    background: "var(--surface)",
    borderRadius: 24,
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },

  statIcon: {
    color: "var(--primary-dark)",
    marginBottom: 12,
  },

  statValue: {
    display: "block",
    fontSize: 34,
    color: "var(--primary-dark)",
    lineHeight: 1,
  },

  statLabel: {
    display: "block",
    marginTop: 8,
    fontWeight: 700,
    color: "var(--muted)",
    fontSize: 14,
  },

  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
  },

  panel: {
    padding: 22,
    background: "var(--surface)",
    borderRadius: 28,
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },

  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },

  panelTitle: {
    margin: 0,
    fontSize: 24,
    letterSpacing: "-0.03em",
    color: "var(--text)",
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 14,
  },

  smallButton: {
    padding: "10px 14px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
    boxShadow: "0 6px 18px rgba(79, 143, 91, 0.22)",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  item: {
    padding: 14,
    borderRadius: 18,
    background: "rgba(255,255,255,0.5)",
    border: "1px solid rgba(79, 143, 91, 0.08)",
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },

  itemDetail: {
    margin: "5px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 14,
  },

  badge: {
    padding: "7px 10px",
    borderRadius: 999,
    background: "#eef6ef",
    color: "var(--primary-dark)",
    fontWeight: 800,
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  emptyText: {
    color: "var(--muted)",
    fontWeight: 700,
  },
};
