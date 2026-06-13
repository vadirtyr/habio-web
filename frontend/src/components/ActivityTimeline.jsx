import React, { useState } from "react";
import {
  Activity as ActivityIcon,
  Award,
  CheckCircle2,
  CheckSquare,
  Flag,
  Flame,
  HandMetal,
  Heart,
  Star,
  UserPlus,
  Users,
} from "lucide-react";

import { activityApi } from "@/lib/api";
import UserAvatar from "@/components/UserAvatar";

export function getActivityMeta(item) {
  switch (item?.type) {
    case "habit_complete":
      return {
        Icon: CheckCircle2,
        title: `Completed ${item.habit_name || "a habit"}`,
        detail:
          (item.streak ? `${item.streak} day streak` : "") +
          (item.coins ? `${item.streak ? " · " : ""}+${item.coins} coins` : ""),
      };
    case "streak_milestone":
      return {
        Icon: Flame,
        title: `${item.habit_name || "Habit"} reached a ${
          item.streak || "?"
        }-day streak`,
        detail: item.coins ? `+${item.coins} coins` : "",
      };
    case "task_complete":
      return {
        Icon: CheckSquare,
        title: `Completed ${item.task_name || "a task"}`,
        detail: item.coins ? `+${item.coins} coins` : "",
      };
    case "quest_complete":
      return {
        Icon: Flag,
        title: `Completed ${item.quest_name || "a quest"}`,
        detail: item.coins ? `+${item.coins} coins` : "",
      };
    case "achievement_unlock":
      return {
        Icon: Award,
        title: `Unlocked achievement: ${item.achievement_name || ""}`,
        detail: "",
      };
    case "avatar_unlock":
      return {
        Icon: UserPlus,
        title: `Unlocked avatar: ${item.avatar_name || ""}`,
        detail: "",
      };
    case "level_up":
      return {
        Icon: Star,
        title: `Reached level ${item.level || "?"}`,
        detail: "",
      };
    case "follow_user":
      return {
        Icon: Users,
        title: `Started following ${
          item.target_display_name || item.target_username || "a user"
        }`,
        detail: "",
      };
    default:
      return { Icon: ActivityIcon, title: item?.type || "Activity", detail: "" };
  }
}

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

export default function ActivityTimeline({ items, setItems, showActor = false }) {
  const [reactingId, setReactingId] = useState(null);

  function hasReaction(item, reaction) {
    return item?.reactions?.viewer_reactions?.includes(reaction);
  }

  function updateLocalReaction(activityId, reaction, active) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== activityId) return item;

        const reactions = item.reactions || {
          like: 0,
          cheer: 0,
          viewer_reactions: [],
        };

        const viewerReactions = Array.isArray(reactions.viewer_reactions)
          ? reactions.viewer_reactions
          : [];

        const alreadyActive = viewerReactions.includes(reaction);
        if (active && alreadyActive) return item;
        if (!active && !alreadyActive) return item;

        return {
          ...item,
          reactions: {
            ...reactions,
            [reaction]: Math.max(0, (reactions[reaction] || 0) + (active ? 1 : -1)),
            viewer_reactions: active
              ? [...viewerReactions, reaction]
              : viewerReactions.filter((r) => r !== reaction),
          },
        };
      })
    );
  }

  async function toggleReaction(item, reaction) {
    if (!item?.id || reactingId) return;

    const active = hasReaction(item, reaction);
    const nextActive = !active;

    setReactingId(`${item.id}-${reaction}`);
    updateLocalReaction(item.id, reaction, nextActive);

    try {
      if (nextActive) {
        await activityApi.react(item.id, reaction);
      } else {
        await activityApi.removeReaction(item.id, reaction);
      }
    } catch (err) {
      updateLocalReaction(item.id, reaction, active);
    } finally {
      setReactingId(null);
    }
  }

  return (
    <div style={styles.timeline} data-testid="activity-timeline">
      {items.map((item, index) => {
        const meta = getActivityMeta(item);
        const Icon = meta.Icon;
        const actorName =
          item.display_name || item.username || "Someone in your orbit";

        return (
          <div
            key={item.id || `${item.type}-${index}`}
            style={styles.card}
            data-testid="activity-item"
          >
            <div style={styles.row}>
              {showActor ? <UserAvatar user={item} size={42} /> : null}
              <div style={styles.iconWrap}>
                <Icon size={20} />
              </div>

              <div style={styles.copy}>
                {showActor && (
                  <p style={styles.actor}>
                    {actorName}
                    {item.username ? (
                      <span style={styles.handle}> @{item.username}</span>
                    ) : null}
                  </p>
                )}

                <strong style={styles.title}>{meta.title}</strong>

                {meta.detail ? <p style={styles.detail}>{meta.detail}</p> : null}

                <p style={styles.date}>{formatDate(item.created_at)}</p>
              </div>
            </div>

            <div style={styles.reactions}>
              <ReactionButton
                active={hasReaction(item, "like")}
                count={item?.reactions?.like || 0}
                disabled={Boolean(reactingId)}
                onClick={() => toggleReaction(item, "like")}
                Icon={Heart}
                label="Like"
                testId={`react-like-${item.id}`}
              />

              <ReactionButton
                active={hasReaction(item, "cheer")}
                count={item?.reactions?.cheer || 0}
                disabled={Boolean(reactingId)}
                onClick={() => toggleReaction(item, "cheer")}
                Icon={HandMetal}
                label="Cheer"
                testId={`react-cheer-${item.id}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReactionButton({ active, count, disabled, onClick, Icon, label, testId }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      style={{
        ...styles.reactionButton,
        ...(active ? styles.reactionButtonActive : {}),
      }}
    >
      <Icon size={16} />
      {label} {count}
    </button>
  );
}

const styles = {
  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  card: {
    padding: 20,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 24,
    boxShadow: "var(--shadow)",
  },
  row: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
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
  actor: {
    margin: "0 0 4px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    fontSize: 14,
  },
  handle: {
    color: "var(--muted)",
    fontWeight: 700,
  },
  title: {
    color: "var(--text)",
    fontSize: 16,
    letterSpacing: "-0.01em",
  },
  detail: {
    margin: "6px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 14,
  },
  date: {
    margin: "8px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 12,
  },
  reactions: {
    display: "flex",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },
  reactionButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 14px",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--muted)",
    fontWeight: 900,
    fontSize: 13,
    cursor: "pointer",
  },
  reactionButtonActive: {
    border: "1px solid rgba(79, 143, 91, 0.45)",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
  },
};
