import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  Bell,
  CheckCheck,
  Flame,
  HandMetal,
  Orbit,
  Sparkles,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";

import { notificationApi, formatApiError } from "@/lib/api";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const { data } = await notificationApi.getNotifications();
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    const previous = notifications;
    setNotifications((cur) =>
      cur.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await notificationApi.markRead(id);
      window.dispatchEvent(new Event("habio:notif-refresh"));
    } catch (err) {
      setNotifications(previous);
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    }
  }

  async function markAllRead() {
    const previous = notifications;
    setNotifications((cur) => cur.map((n) => ({ ...n, read: true })));
    try {
      await notificationApi.markAllRead();
      window.dispatchEvent(new Event("habio:notif-refresh"));
      toast.success("All notifications marked read");
    } catch (err) {
      setNotifications(previous);
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    }
  }

  async function openNotification(notification) {
    if (!notification.read) {
      await markRead(notification.id);
    }

    const destination = getNotificationDestination(notification);
    if (destination) navigate(destination);
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div style={styles.page} data-testid="notifications-page">
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Community</p>
          <h1 style={styles.title}>Notifications</h1>
          <p style={styles.subtitle}>Follows and activity from your orbit.</p>
        </div>

        {hasUnread && (
          <button
            style={styles.markAllButton}
            onClick={markAllRead}
            data-testid="mark-all-read-button"
          >
            <CheckCheck size={17} />
            Mark all read
          </button>
        )}
      </header>

      {loading ? (
        <p style={styles.status}>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>
          <Bell size={40} />
          <h2 style={styles.emptyTitle}>No notifications yet</h2>
          <p style={styles.emptyText}>
            When people follow you or your friends make progress, you'll see it
            here.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{ ...styles.card, ...(n.read ? {} : styles.unreadCard) }}
              data-testid="notification-item"
              role="button"
              tabIndex={0}
              onClick={() => openNotification(n)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openNotification(n);
                }
              }}
            >
              <div style={styles.iconWrap}>
                <NotificationIcon type={n.type} />
              </div>

              <div style={styles.copy}>
                <strong style={styles.message}>{n.message}</strong>
                <p style={styles.date}>{formatDate(n.created_at)}</p>
              </div>

              {!n.read && (
                <button
                  style={styles.markButton}
                  onClick={(event) => {
                    event.stopPropagation();
                    markRead(n.id);
                  }}
                  data-testid={`mark-read-${n.id}`}
                >
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationIcon({ type }) {
  const Icon = {
    followed_you: UserPlus,
    achievement_unlock: Award,
    level_up: Sparkles,
    streak_milestone: Flame,
    quest_complete: Award,
    reward_unlocked: Sparkles,
    activity_reaction: HandMetal,
    weekly_recap: Bell,
    orbit_invite: Orbit,
  }[type] || Bell;

  return <Icon size={18} />;
}

function getNotificationDestination(notification) {
  switch (notification.type) {
    case "weekly_recap":
      return "/weekly-recap";
    case "orbit_invite":
      return "/orbits";
    case "followed_you":
      return "/people";
    case "activity_reaction":
    case "achievement_unlock":
    case "level_up":
    case "streak_milestone":
    case "quest_complete":
    case "reward_unlocked":
      return "/feed";
    default:
      return null;
  }
}

const styles = {
  page: { width: "100%" },
  header: {
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
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
  markAllButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "var(--surface)",
    color: "var(--primary-dark)",
    fontWeight: 900,
    cursor: "pointer",
  },
  status: { color: "var(--muted)", fontWeight: 700 },
  list: { display: "flex", flexDirection: "column", gap: 12, maxWidth: 620 },
  card: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 18,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 22,
    boxShadow: "var(--shadow)",
    cursor: "pointer",
    outline: "none",
  },
  unreadCard: {
    border: "1px solid rgba(79, 143, 91, 0.45)",
    background: "rgba(79, 143, 91, 0.06)",
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    flex: "0 0 auto",
  },
  copy: { flex: 1, minWidth: 0 },
  message: { color: "var(--text)", fontSize: 15 },
  date: { margin: "5px 0 0", color: "var(--muted)", fontWeight: 700, fontSize: 12 },
  markButton: {
    padding: "8px 12px",
    border: "none",
    borderRadius: 999,
    background: "#fff7df",
    color: "var(--primary-dark)",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};
