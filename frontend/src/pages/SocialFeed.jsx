import React, { useEffect, useState } from "react";
import { Satellite, Users } from "lucide-react";
import { toast } from "sonner";

import { activityApi, formatApiError } from "@/lib/api";
import ActivityTimeline from "@/components/ActivityTimeline";

export default function SocialFeed() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadFeed() {
    try {
      setLoading(true);
      const { data } = await activityApi.getFeed();
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, []);

  return (
    <div style={styles.page} data-testid="social-feed-page">
      <header style={styles.header}>
        <p style={styles.eyebrow}>Community</p>
        <h1 style={styles.title}>Friend Feed</h1>
        <p style={styles.subtitle}>
          See progress from people in your orbit, then cheer them on.
        </p>
      </header>

      {loading ? (
        <p style={styles.status}>Loading your feed...</p>
      ) : items.length === 0 ? (
        <div style={styles.empty}>
          <Users size={40} />
          <h2 style={styles.emptyTitle}>Your feed is quiet</h2>
          <p style={styles.emptyText}>
            Follow other explorers to see their habits, tasks, and milestones
            here.
          </p>
        </div>
      ) : (
        <ActivityTimeline items={items} setItems={setItems} showActor />
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
    lineHeight: 1.55,
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
