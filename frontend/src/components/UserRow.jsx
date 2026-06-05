import React from "react";
import { ChevronRight, User } from "lucide-react";

export default function UserRow({ user, onClick }) {
  const displayName = user.display_name || user.name || user.username;

  return (
    <button
      type="button"
      onClick={onClick}
      style={styles.card}
      data-testid={`user-row-${user.username || user.id}`}
    >
      <div style={styles.avatar}>
        <User size={24} />
      </div>

      <div style={styles.copy}>
        <strong style={styles.name}>{displayName}</strong>
        {user.username ? <p style={styles.handle}>@{user.username}</p> : null}
      </div>

      <ChevronRight size={20} style={styles.chevron} />
    </button>
  );
}

const styles = {
  card: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 16,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 22,
    boxShadow: "var(--shadow)",
    cursor: "pointer",
    textAlign: "left",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    flex: "0 0 auto",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: "var(--text)",
    fontSize: 16,
  },
  handle: {
    margin: "3px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 13,
  },
  chevron: {
    color: "var(--muted)",
    flex: "0 0 auto",
  },
};
