import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

const PRIORITIES = ["low", "medium", "high"];

export default function EditTask() {
  const navigate = useNavigate();
  const { taskId } = useParams();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [rewardCoins, setRewardCoins] = useState(5);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

useEffect(() => {
  loadTask();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [taskId]);
  async function loadTask() {
    try {
      const { data } = await api.get(`/tasks/${taskId}`);
      const task = data.task || data;

      setTitle(task.title || "");
      setNotes(task.notes || "");
      setPriority(task.priority || "medium");
      setDueDate(task.due_date ? String(task.due_date).slice(0, 10) : "");
      setRewardCoins(task.reward_coins ?? task.coins ?? 5);
      setCompleted(Boolean(task.completed));
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to load task"
      );
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/tasks/${taskId}`, {
        title: title.trim(),
        notes: notes.trim(),
        priority,
        due_date: dueDate || null,
        reward_coins: Number(rewardCoins),
        completed,
      });

      toast.success("Task updated");
      navigate("/tasks");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to update task"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Edit Task</h1>
        <p>Loading task...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Edit Task</h1>
            <p style={styles.subtitle}>Update the task details.</p>
          </div>

          <button style={styles.backButton} onClick={() => navigate("/tasks")}>
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Task title</label>
          <input
            style={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <label style={styles.label}>Notes</label>
          <textarea
            style={{ ...styles.input, minHeight: 100, resize: "vertical" }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Priority</label>
              <select
                style={styles.input}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Due date</label>
              <input
                style={styles.input}
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <label style={styles.label}>Coin reward</label>
          <input
            style={styles.input}
            type="number"
            min="0"
            value={rewardCoins}
            onChange={(e) => setRewardCoins(e.target.value)}
          />

          <label style={styles.checkRow}>
            <input
              type="checkbox"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
            Mark task as completed
          </label>

          <button style={styles.submitButton} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
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