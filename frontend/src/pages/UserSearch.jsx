import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, UserX } from "lucide-react";
import { toast } from "sonner";

import { socialApi, formatApiError } from "@/lib/api";
import UserRow from "@/components/UserRow";

export default function UserSearch() {
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setUsers([]);
      return;
    }

    const timeout = setTimeout(() => {
      runSearch(trimmed);
    }, 350);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  async function runSearch(text) {
    try {
      setLoading(true);
      const { data } = await socialApi.searchUsers(text);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }

  function openProfile(user) {
    if (!user?.username) return;
    navigate(`/u/${user.username}`);
  }

  const trimmed = query.trim();

  return (
    <div style={styles.page} data-testid="user-search-page">
      <header style={styles.header}>
        <p style={styles.eyebrow}>Community</p>
        <h1 style={styles.title}>Find People</h1>
        <p style={styles.subtitle}>Search public OurOrbit profiles.</p>
      </header>

      <div style={styles.searchBox}>
        <Search size={20} style={{ color: "var(--muted)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by username or name"
          autoCapitalize="none"
          autoCorrect="off"
          style={styles.input}
          data-testid="user-search-input"
        />
      </div>

      {trimmed.length < 2 ? (
        <div style={styles.empty}>
          <Search size={40} />
          <h2 style={styles.emptyTitle}>Search for people</h2>
          <p style={styles.emptyText}>
            Enter at least two characters to find public profiles.
          </p>
        </div>
      ) : loading ? (
        <p style={styles.status}>Searching...</p>
      ) : users.length === 0 ? (
        <div style={styles.empty}>
          <UserX size={40} />
          <h2 style={styles.emptyTitle}>No users found</h2>
          <p style={styles.emptyText}>Try another username or display name.</p>
        </div>
      ) : (
        <div style={styles.results}>
          {users.map((user) => (
            <UserRow
              key={user.id}
              user={user}
              onClick={() => openProfile(user)}
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
  subtitle: {
    margin: "12px 0 0",
    color: "var(--muted)",
    fontWeight: 600,
    fontSize: 16,
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 999,
    boxShadow: "var(--shadow)",
    marginBottom: 22,
    maxWidth: 560,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    color: "var(--text)",
    fontWeight: 700,
    fontSize: 15,
  },
  results: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    maxWidth: 560,
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
    maxWidth: 560,
  },
  emptyTitle: { margin: "14px 0 6px", color: "var(--text)" },
  emptyText: {
    margin: "0 auto",
    maxWidth: 380,
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.55,
  },
};
