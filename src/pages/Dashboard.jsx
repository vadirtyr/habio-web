import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import { toast } from "sonner";

export default function Dashboard() {
  const navigate = useNavigate();
  const { refreshKey, coins } = useAppState();

  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const [habitsRes, tasksRes, rewardsRes] = await Promise.all([
        api.get("/habits"),
        api.get("/tasks"),
        api.get("/rewards"),
      ]);

      const habitsData = habitsRes.data;
      const tasksData = tasksRes.data;
      const rewardsData = rewardsRes.data;

      setHabits(Array.isArray(habitsData) ? habitsData : habitsData.habits || []);
      setTasks(Array.isArray(tasksData) ? tasksData : tasksData.tasks || []);
      setRewards(Array.isArray(rewardsData) ? rewardsData : rewardsData.rewards || []);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [refreshKey]);

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const completedHabits = habits.filter((h) => h.completed_today).length;
  const openTasks = tasks.filter((t) => !t.completed).length;
  const completedTasks = tasks.filter((t) => t.completed).length;

  const bestStreak = habits.reduce(
    (max, habit) => Math.max(max, habit.streak || 0),
    0
  );

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <div>
          <h1 style={styles.title}>Today’s Progress</h1>
          <p style={styles.subtitle}>
            Keep stacking small wins. That’s how Habio works.
          </p>
        </div>

        <div style={styles.coinCard}>
          <span style={styles.coinLabel}>Coins</span>
          <strong style={styles.coinValue}>{coins}</strong>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard label="Habits done today" value={`${completedHabits}/${habits.length}`} />
        <StatCard label="Open tasks" value={openTasks} />
        <StatCard label="Completed tasks" value={completedTasks} />
        <StatCard label="Best streak" value={`${bestStreak} days`} />
      </div>

      <div style={styles.sectionGrid}>
        <Panel title="Habits" subtitle="Daily consistency" buttonText="+ New Habit" onClick={() => navigate("/habits/new")}>
          {habits.slice(0, 4).map((habit) => (
            <MiniItem
              key={habit.id || habit._id}
              title={habit.name}
              detail={`${habit.streak || 0} day streak`}
              badge={habit.completed_today ? "Done" : "Today"}
            />
          ))}
          {habits.length === 0 && <EmptyLine text="No habits yet. Create one to start building momentum." />}
        </Panel>

        <Panel title="Tasks" subtitle="One-time wins" buttonText="+ New Task" onClick={() => navigate("/tasks/new")}>
          {tasks.filter((task) => !task.completed).slice(0, 4).map((task) => (
            <MiniItem
              key={task.id || task._id}
              title={task.title}
              detail={task.priority || "medium"}
              badge={task.due_date || "Open"}
            />
          ))}
          {tasks.filter((task) => !task.completed).length === 0 && <EmptyLine text="No open tasks. Nice work." />}
        </Panel>

        <Panel title="Rewards" subtitle="Spend what you earn" buttonText="+ New Reward" onClick={() => navigate("/rewards/new")}>
          {rewards.slice(0, 4).map((reward) => (
            <MiniItem
              key={reward.id || reward._id}
              title={reward.name}
              detail={reward.category || "Reward"}
              badge={`${reward.cost ?? reward.coin_cost ?? 50} coins`}
            />
          ))}
          {rewards.length === 0 && <EmptyLine text="No rewards yet. Add something worth earning." />}
        </Panel>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={styles.statCard}>
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
        <button style={styles.smallButton} onClick={onClick}>{buttonText}</button>
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

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
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

  coinCard: {
    minWidth: 180,
    padding: 24,
    borderRadius: 28,
    background:
      "linear-gradient(135deg, #fff7df 0%, #ffe8a3 100%)",
    boxShadow: "var(--shadow)",
    border: "1px solid rgba(242, 184, 75, 0.45)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },

  coinLabel: {
    display: "block",
    fontWeight: 800,
    color: "var(--primary-dark)",
    opacity: 0.7,
    fontSize: 14,
  },

  coinValue: {
    display: "block",
    fontSize: 42,
    marginTop: 4,
    color: "var(--primary-dark)",
    lineHeight: 1,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
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
    background: "#f9fbf8",
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