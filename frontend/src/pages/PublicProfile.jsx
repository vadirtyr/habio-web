import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Award, Clock, Star, User, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";

import { profileApi, socialApi, formatApiError } from "@/lib/api";

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [me, setMe] = useState(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const isMe = me?.id && profile?.id === me.id;

  async function load() {
    if (!username) return;
    try {
      setLoading(true);
      const [profileRes, meRes] = await Promise.all([
        profileApi.getPublicProfile(username),
        profileApi.getMe(),
      ]);
      const data = profileRes.data;
      const myProfile = meRes.data;
      setProfile(data);
      setMe(myProfile);
      setFollowing(
        Array.isArray(myProfile?.following) &&
          myProfile.following.includes(data.id)
      );
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  async function toggleFollow() {
    if (!profile?.id || submitting) return;
    const wasFollowing = following;
    setSubmitting(true);
    setFollowing(!wasFollowing);
    setProfile((cur) =>
      cur
        ? {
            ...cur,
            followers_count: Math.max(
              0,
              (cur.followers_count || 0) + (wasFollowing ? -1 : 1)
            ),
          }
        : cur
    );

    try {
      if (wasFollowing) {
        await socialApi.unfollowUser(profile.id);
      } else {
        await socialApi.followUser(profile.id);
      }
    } catch (err) {
      setFollowing(wasFollowing);
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.status}>Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.page}>
        <p style={styles.status}>Profile not found.</p>
      </div>
    );
  }

  return (
    <div style={styles.page} data-testid="public-profile-page">
      <header style={styles.header}>
        <p style={styles.eyebrow}>Profile</p>
        <h1 style={styles.title}>@{profile.username || username}</h1>
      </header>

      <section style={styles.heroCard}>
        <div style={styles.avatar}>
          <User size={46} />
        </div>

        <h2 style={styles.displayName}>{profile.display_name || profile.username}</h2>
        <p style={styles.username}>@{profile.username}</p>
        {profile.bio ? <p style={styles.bio}>{profile.bio}</p> : null}

        {isMe ? (
          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/profile/edit")}
          >
            Edit Profile
          </button>
        ) : (
          <button
            style={following ? styles.secondaryButton : styles.primaryButton}
            onClick={toggleFollow}
            disabled={submitting}
            data-testid="follow-button"
          >
            {submitting ? "Working..." : following ? "Following" : "Follow"}
          </button>
        )}
      </section>

      <section style={styles.statsGrid}>
        <Stat Icon={Star} label="Level" value={profile.level_data?.level || 1} />
        <Stat Icon={Award} label="Achievements" value={profile.achievement_count || 0} />
        <Stat
          Icon={Users}
          label="Followers"
          value={profile.followers_count || 0}
          onClick={() =>
            navigate(`/users/${profile.id}/followers?username=${profile.username || ""}`)
          }
        />
        <Stat
          Icon={UserCheck}
          label="Following"
          value={profile.following_count || 0}
          onClick={() =>
            navigate(`/users/${profile.id}/following?username=${profile.username || ""}`)
          }
        />
      </section>

      {profile.featured_achievement ? (
        <section style={styles.featuredCard}>
          <div style={styles.featuredHeader}>
            <Award size={18} />
            Latest Achievement
          </div>
          <strong style={styles.featuredTitle}>
            {profile.featured_achievement.name}
          </strong>
          <p style={styles.featuredText}>
            {profile.featured_achievement.description}
          </p>
        </section>
      ) : null}

      <button
        style={styles.activityButton}
        onClick={() =>
          navigate(`/users/${profile.id}/activity?username=${profile.username || ""}`)
        }
        data-testid="view-activity-button"
      >
        <Clock size={18} />
        View Activity
      </button>
    </div>
  );
}

function Stat({ Icon, label, value, onClick }) {
  return (
    <div
      style={{ ...styles.statCard, ...(onClick ? { cursor: "pointer" } : {}) }}
      onClick={onClick}
      data-testid={`public-stat-${label.toLowerCase()}`}
    >
      <Icon size={22} style={{ color: "var(--primary-dark)" }} />
      <strong style={styles.statValue}>{value}</strong>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

const styles = {
  page: { width: "100%", maxWidth: 720 },
  header: { marginBottom: 22 },
  eyebrow: {
    margin: "0 0 10px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  title: { margin: 0, fontSize: 40, lineHeight: 1, letterSpacing: "-0.05em", color: "var(--text)" },
  status: { color: "var(--muted)", fontWeight: 700 },
  heroCard: {
    padding: 28,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
    textAlign: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 92,
    height: 92,
    margin: "0 auto 14px",
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
  },
  displayName: { margin: 0, fontSize: 26, color: "var(--text)", letterSpacing: "-0.03em" },
  username: { margin: "6px 0 0", color: "var(--muted)", fontWeight: 800 },
  bio: { margin: "14px auto 0", maxWidth: 440, color: "var(--muted)", fontWeight: 700, lineHeight: 1.55 },
  primaryButton: {
    marginTop: 20,
    padding: "13px 30px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },
  secondaryButton: {
    marginTop: 20,
    padding: "13px 30px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 14,
    marginBottom: 16,
  },
  statCard: {
    padding: 20,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 22,
    boxShadow: "var(--shadow)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  statValue: { fontSize: 24, color: "var(--primary-dark)", lineHeight: 1 },
  statLabel: { color: "var(--muted)", fontWeight: 900, fontSize: 12, textTransform: "uppercase" },
  featuredCard: {
    padding: 22,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 24,
    boxShadow: "var(--shadow)",
    marginBottom: 16,
  },
  featuredHeader: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: "0.06em",
    marginBottom: 10,
  },
  featuredTitle: { color: "var(--text)", fontSize: 18 },
  featuredText: { margin: "8px 0 0", color: "var(--muted)", fontWeight: 700, lineHeight: 1.5 },
  activityButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "13px 22px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
  },
};
