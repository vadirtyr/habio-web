import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Clock } from "lucide-react";
import { toast } from "sonner";

import { socialApi, formatApiError } from "@/lib/api";
import ActivityTimeline from "@/components/ActivityTimeline";

export default function PublicActivity() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadActivity() {
    if (!userId) return;
    try {
      setLoading(true);
      const { data } = await socialApi.getUserActivity(userId);
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div style={styles.page} data-testid="public-activity-page">
      <header style={styles.header}>
        <p style={styles.eyebrow}>Activity</p>
        <h1 style={styles.title}>{username ? `@${username}` : "Activity"}</h1>
        <p style={styles.subtitle}>Recent progress from this orbit.</p>
      </header>

      {loading ? (
        <p style={styles.status}>Loading activity...</p>
      ) : items.length === 0 ? (
        <div style={styles.empty}>
          <Clock size={40} />
          <h2 style={styles.emptyTitle}>No activity yet</h2>
          <p style={styles.emptyText}>Activity will appear as progress is made.</p>
        </div>
      ) : (
        <ActivityTimeline items={items} setItems={setItems} />
      )}
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
  subtitle: {
    margin: "12px 0 0",
    color: "var(--muted)",
    fontWeight: 600,
    fontSize: 16,
  },
  status: { color: "var(--muted)", fontWeight: 700 },
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
  emptyText: {
    margin: "0 auto",
    maxWidth: 420,
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.55,
  },
};
