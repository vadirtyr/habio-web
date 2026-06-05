import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import { toast } from "sonner";

export default function Habits() {
  const navigate = useNavigate();
  const { syncAppState } = useAppState();

  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  async function loadHabits() {
    try {
      const { data } = await api.get("/habits");
      setHabits(Array.isArray(data) ? data : data.habits || []);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to load habits"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHabits();
  }, []);

  async function completeHabit(habitId) {
    setCompletingId(habitId);

    try {
      await api.post(`/habits/${habitId}/complete`);

      await syncAppState();
      await loadHabits();

      toast.success("Habit completed! +coins");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to complete habit"
      );
    } finally {
      setCompletingId(null);
    }
  }

  async function deleteHabit(habitId) {
    const confirmed = window.confirm("Delete this habit?");
    if (!confirmed) return;

    try {
      await api.delete(`/habits/${habitId}`);

      await syncAppState();
      await loadHabits();

      toast.success("Habit deleted");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to delete habit"
      );
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Habits</h1>
        <p>Loading habits...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Habits</h1>
          <p style={styles.subtitle}>
            Build consistency one small win at a time.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            style={styles.templatesButton}
            onClick={() => navigate("/habits/choose")}
            data-testid="habit-templates-button"
          >
            ✨ Templates
          </button>
          <button style={styles.addButton} onClick={() => navigate("/habits/new")}>
            + New Habit
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div style={styles.emptyCard}>
          <h2>No habits yet</h2>
          <p style={styles.subtitle}>
            Start with one easy habit. Make it obvious, simple, and repeatable.
          </p>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/habits/new")}
          >
            Create your first habit
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {habits.map((habit) => {
            const habitId = habit.id || habit._id;
            const completed = Boolean(habit.completed_today);

            return (
              <div key={habitId} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <h2 style={styles.habitName}>{habit.name}</h2>
                    <p style={styles.meta}>
                      {habit.category || "Habit"} · {habit.frequency || "daily"}
                    </p>
                  </div>

                  <div style={styles.coinBadge}>
                    +{habit.reward_coins ?? habit.coins ?? 10}
                  </div>
                </div>

                <div style={styles.statsRow}>
                  <div style={styles.statBox}>
                    <strong>{habit.streak || 0}</strong>
                    <span>day streak</span>
                  </div>

                  <div style={styles.statBox}>
                    <strong>{habit.target || 1}</strong>
                    <span>target</span>
                  </div>
                </div>

                <div style={styles.actions}>
                  <button
                    style={{
                      ...styles.completeButton,
                      ...(completed ? styles.completedButton : {}),
                    }}
                    disabled={completed || completingId === habitId}
                    onClick={() => completeHabit(habitId)}
                  >
                    {completed
                      ? "Done Today"
                      : completingId === habitId
                      ? "Saving..."
                      : "Complete"}
                  </button>

                  <button
                    style={styles.editButton}
                    onClick={() => navigate(`/habits/${habitId}/edit`)}
                  >
                    Edit
                  </button>

                  <button
                    style={styles.deleteButton}
                    onClick={() => deleteHabit(habitId)}
                  >
                    Delete
                  </button>
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

  addButton: {
    padding: "12px 18px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },

  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  templatesButton: {
    padding: "12px 18px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "var(--surface)",
    color: "var(--primary-dark)",
    fontWeight: 900,
    cursor: "pointer",
  },

  primaryButton: {
    marginTop: 18,
    padding: "13px 20px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },

  emptyCard: {
    padding: 34,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
    textAlign: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 20,
  },

  card: {
    padding: 22,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },

  habitName: {
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

  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginTop: 20,
  },

  statBox: {
    padding: 14,
    borderRadius: 18,
    background: "#f9fbf8",
    border: "1px solid rgba(79, 143, 91, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    color: "var(--primary-dark)",
  },

  actions: {
    display: "flex",
    gap: 10,
    marginTop: 20,
    flexWrap: "wrap",
  },

  completeButton: {
    flex: 1,
    minWidth: 120,
    padding: "12px 14px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },

  completedButton: {
    background: "#dfeee1",
    color: "var(--primary-dark)",
    cursor: "not-allowed",
  },

  editButton: {
    padding: "12px 14px",
    border: "none",
    borderRadius: 999,
    background: "#fff7df",
    color: "var(--primary-dark)",
    fontWeight: 900,
    cursor: "pointer",
  },

  deleteButton: {
    padding: "12px 14px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "white",
    color: "var(--danger)",
    fontWeight: 900,
    cursor: "pointer",
  },
};
