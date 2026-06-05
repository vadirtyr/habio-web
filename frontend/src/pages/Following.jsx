import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";

import { socialApi, formatApiError } from "@/lib/api";
import UserRow from "@/components/UserRow";

export default function Following() {
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const username = searchParams.get("username");
  const navigate = useNavigate();

  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!userId) return;
    try {
      setLoading(true);
      const { data } = await socialApi.getFollowing(userId);
      setFollowing(Array.isArray(data?.following) ? data.following : []);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <div style={styles.page} data-testid="following-page">
      <header style={styles.header}>
        <p style={styles.eyebrow}>Community</p>
        <h1 style={styles.title}>Following</h1>
        <p style={styles.subtitle}>
          {username ? `@${username}` : "People this orbit follows"}
        </p>
      </header>

      {loading ? (
        <p style={styles.status}>Loading following...</p>
      ) : following.length === 0 ? (
        <div style={styles.empty}>
          <UserCheck size={40} />
          <h2 style={styles.emptyTitle}>Not following anyone yet</h2>
          <p style={styles.emptyText}>Follow other explorers to build your orbit.</p>
        </div>
      ) : (
        <div style={styles.results}>
          {following.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onClick={() => user.username && navigate(`/u/${user.username}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: { width: "100%" },
  header: { marginBottom: 22, maxWidth: 720 },
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
  results: { display: "flex", flexDirection: "column", gap: 12, maxWidth: 560 },
  empty: {
    padding: 40,
    textAlign: "center",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
    color: "var(--primary-dark)",
    maxWidth: 560,
  },
  emptyTitle: { margin: "14px 0 6px", color: "var(--text)" },
  emptyText: { margin: "0 auto", maxWidth: 380, color: "var(--muted)", fontWeight: 700, lineHeight: 1.55 },
};
