import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import { toast } from "sonner";

export default function Rewards() {
  const navigate = useNavigate();
  const { coins, syncAppState } = useAppState();

  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState(null);

  async function loadRewards() {
    try {
      const { data } = await api.get("/rewards");
      setRewards(Array.isArray(data) ? data : data.rewards || []);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to load rewards"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, []);

  async function redeemReward(rewardId, cost) {
    if (coins < cost) {
      toast.error("Not enough coins yet");
      return;
    }

    setRedeemingId(rewardId);

    try {
      await api.post(`/rewards/${rewardId}/redeem`);

      await syncAppState();
      await loadRewards();

      toast.success("Reward redeemed!");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to redeem reward"
      );
    } finally {
      setRedeemingId(null);
    }
  }

  async function deleteReward(rewardId) {
    const confirmed = window.confirm("Delete this reward?");
    if (!confirmed) return;

    try {
      await api.delete(`/rewards/${rewardId}`);

      await syncAppState();
      await loadRewards();

      toast.success("Reward deleted");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to delete reward"
      );
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.title}>Rewards</h1>
        <p>Loading rewards...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Rewards</h1>
          <p style={styles.subtitle}>
            Spend your earned coins on things that keep you motivated.
          </p>
        </div>

        <div style={styles.headerActions}>
          <div style={styles.balanceBadge}>{coins} coins</div>

          <button
            style={styles.addButton}
            onClick={() => navigate("/rewards/new")}
          >
            + New Reward
          </button>
        </div>
      </div>

      {rewards.length === 0 ? (
        <div style={styles.emptyCard}>
          <h2>No rewards yet</h2>
          <p style={styles.subtitle}>
            Add something you’ll actually want to earn.
          </p>

          <button
            style={styles.primaryButton}
            onClick={() => navigate("/rewards/new")}
          >
            Create your first reward
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {rewards.map((reward) => {
            const rewardId = reward.id || reward._id;
            const cost = Number(reward.cost ?? reward.coin_cost ?? 50);
            const canAfford = coins >= cost;

            return (
              <div key={rewardId} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <h2 style={styles.rewardName}>{reward.name}</h2>
                    <p style={styles.meta}>{reward.category || "Reward"}</p>
                  </div>

                  <div style={styles.costBadge}>{cost}</div>
                </div>

                {reward.description && (
                  <p style={styles.description}>{reward.description}</p>
                )}

                <div style={styles.actions}>
                  <button
                    style={{
                      ...styles.redeemButton,
                      ...(!canAfford ? styles.disabledButton : {}),
                    }}
                    disabled={!canAfford || redeemingId === rewardId}
                    onClick={() => redeemReward(rewardId, cost)}
                  >
                    {redeemingId === rewardId
                      ? "Redeeming..."
                      : canAfford
                      ? "Redeem"
                      : "Need more coins"}
                  </button>

                  <button
                    style={styles.editButton}
                    onClick={() => navigate(`/rewards/${rewardId}/edit`)}
                  >
                    Edit
                  </button>

                  <button
                    style={styles.deleteButton}
                    onClick={() => deleteReward(rewardId)}
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