import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import { toast } from "sonner";

export default function Tasks() {
  const navigate = useNavigate();
  const { syncAppState, updateCoins, updateLevelData } = useAppState();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  async function loadTasks() {
    try {
      const { data } = await api.get("/tasks");
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function completeTask(taskId) {
    setCompletingId(taskId);

    try {
      const { data } = await api.post(`/tasks/${taskId}/complete`);

      if (data.new_balance !== undefined) updateCoins(data.new_balance);
      if (data.level_data) updateLevelData(data.level_data);

      await syncAppState();
      await loadTasks();

      toast.success(
        `Task completed! +${data.coins_earned || 0} coins, +${data.xp_earned || 0} XP`
      );
      if (data.new_avatars?.length) {
        toast.success(
          `${data.new_avatars.length} avatar${data.new_avatars.length === 1 ? "" : "s"} unlocked`
        );
      }
      if (data.new_achievements?.length) {
        toast.success(
          `${data.new_achievements.length} achievement${data.new_achievements.length === 1 ? "" : "s"} unlocked`
        );
      }
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to complete task"
      );
    } finally {
      setCompletingId(null);
    }
  }

  async function uncompleteTask(taskId) {
    setCompletingId(taskId);

    try {
      const { data } = await api.post(`/tasks/${taskId}/uncomplete`);

      if (data.new_balance !== undefined) updateCoins(data.new_balance);

      await syncAppState();
      await loadTasks();

      toast.success("Task reopened");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to reopen task"
      );
    } finally {
      setCompletingId(null);
    }
  }

  async function deleteTask(taskId) {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${taskId}`);

      await syncAppState();
      await loadTasks();

      toast.success("Task deleted");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to delete task"
      );
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Tasks</h1>
        <p style={styles.subtitle}>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Tasks</h1>
          <p style={styles.subtitle}>
            Knock out one-time wins and earn coins.
          </p>
        </div>

        <button style={styles.addButton} onClick={() => navigate("/tasks/new")}>
          + New Task
        </button>
      </div>

      {tasks.length === 0 ? (
        <div style={styles.emptyCard}>
          <h2 style={styles.emptyTitle}>No tasks yet</h2>
          <p style={styles.subtitle}>Add a small task and build momentum.</p>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/tasks/new")}
          >
            Create your first task
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {tasks.map((task) => {
            const taskId = task.id || task._id;
            const completed = Boolean(task.completed);
            const taskTitle = task.title || task.name || "Untitled task";

            return (
              <div key={taskId} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <h2
                      style={{
                        ...styles.taskTitle,
                        textDecoration: completed ? "line-through" : "none",
                        opacity: completed ? 0.6 : 1,
                      }}
                    >
                      {taskTitle}
                    </h2>

                    <p style={styles.meta}>
                      {task.priority || "medium"} priority
                      {task.due_date ? ` · due ${task.due_date}` : ""}
                    </p>
                  </div>

                  <div style={styles.coinBadge}>
                    +{task.reward_coins ?? task.coins ?? 5}
                  </div>
                </div>

                {(task.notes || task.description) && (
                  <p style={styles.notes}>{task.notes || task.description}</p>
                )}

                <div style={styles.actions}>
                  <button
                    style={{
                      ...styles.completeButton,
                      ...(completed ? styles.completedButton : {}),
                    }}
                    disabled={completingId === taskId}
                    onClick={() =>
                      completed
                        ? uncompleteTask(taskId)
                        : completeTask(taskId)
                    }
                  >
                    {completingId === taskId
                      ? "Saving..."
                      : completed
                      ? "Reopen"
                      : "Complete"}
                  </button>

                  <button
                    style={styles.editButton}
                    onClick={() => navigate(`/tasks/${taskId}/edit`)}
                  >
                    Edit
                  </button>

                  <button
                    style={styles.deleteButton}
                    onClick={() => deleteTask(taskId)}
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

  emptyTitle: {
    margin: 0,
    color: "var(--text)",
    letterSpacing: "-0.03em",
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

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
  },

  taskTitle: {
    margin: 0,
    fontSize: 22,
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

  notes: {
    marginTop: 14,
    color: "var(--muted)",
    lineHeight: 1.5,
    fontSize: 15,
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
    cursor: "pointer",
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
