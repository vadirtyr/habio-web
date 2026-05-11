import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = [
  "Fun",
  "Relaxation",
  "Food",
  "Entertainment",
  "Shopping",
  "Social",
  "Custom",
];

export default function EditReward() {
  const navigate = useNavigate();
  const { rewardId } = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Fun");
  const [cost, setCost] = useState(50);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReward();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rewardId]);

  async function loadReward() {
    try {
      const { data } = await api.get(`/rewards/${rewardId}`);
      const reward = data.reward || data;

      setName(reward.name || "");
      setDescription(reward.description || "");
      setCategory(reward.category || "Fun");
      setCost(reward.cost ?? reward.coin_cost ?? 50);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to load reward"
      );
      navigate("/rewards");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Reward name is required");
      return;
    }

    setSaving(true);

    try {
      await api.put(`/rewards/${rewardId}`, {
        name: name.trim(),
        description: description.trim(),
        category,
        cost: Number(cost),
      });

      toast.success("Reward updated");
      navigate("/rewards");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to update reward"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Edit Reward</h1>
        <p>Loading reward...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Edit Reward</h1>
            <p style={styles.subtitle}>Update what this reward costs and means.</p>
          </div>

          <button style={styles.backButton} onClick={() => navigate("/rewards")}>
            Back
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Reward name</label>
          <input
            style={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label style={styles.label}>Description</label>
          <textarea
            style={{ ...styles.input, minHeight: 100, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <select
                style={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Coin cost</label>
              <input
                style={styles.input}
                type="number"
                min="1"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

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