import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Award,
  BadgeCheck,
  CalendarCheck,
  Coins,
  Flame,
  Globe,
  Lock,
  Palette,
  Pencil,
  Sparkles,
  Star,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { profileApi, formatApiError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const { data } = await profileApi.getMe();
      setProfile(data);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div style={styles.page}>
        <p style={styles.status}>Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={styles.page}>
        <p style={styles.status}>Profile unavailable.</p>
      </div>
    );
  }

  const level = profile.level_data?.level || 1;
  const joinedYear = profile.created_at
    ? new Date(profile.created_at).getFullYear()
    : "—";
  const featured = profile.featured_achievement;
  const isPublic = profile.is_public;
  const isGoogleLinked = Array.isArray(user?.auth_providers)
    ? user.auth_providers.includes("google")
    : false;

  return (
    <div style={styles.page} data-testid="profile-page">
      <header style={styles.header}>
        <p style={styles.eyebrow}>OurOrbit</p>
        <h1 style={styles.title}>Profile</h1>
        <p style={styles.subtitle}>Your public orbit identity.</p>
      </header>

      <section style={styles.heroCard}>
        <div style={styles.avatar}>
          <User size={52} />
        </div>

        <h2 style={styles.displayName}>{profile.display_name || "Explorer"}</h2>
        <p style={styles.username}>
          {profile.username ? `@${profile.username}` : "No username set"}
        </p>
        <p style={styles.bio}>
          {profile.bio || "Add a short bio to personalize your orbit."}
        </p>

        <div style={styles.badgeRow}>
          <Badge Icon={Sparkles} label={`Level ${level}`} />
          <Badge Icon={Flame} label={`${profile.streak_days || 0} Day Streak`} />
          <Badge Icon={isPublic ? Globe : Lock} label={isPublic ? "Public" : "Private"} />
          {isGoogleLinked && (
            <span style={styles.googleBadge} data-testid="google-linked-badge">
              <BadgeCheck size={15} />
              Linked with Google
            </span>
          )}
        </div>

        <button
          style={styles.editButton}
          onClick={() => navigate("/profile/edit")}
          data-testid="edit-profile-button"
        >
          <Pencil size={17} />
          Edit Profile
        </button>
      </section>

      <section style={styles.statsGrid}>
        <Stat Icon={Star} label="XP" value={profile.level_data?.progress ?? profile.level_data?.current_xp ?? 0} />
        <Stat Icon={Coins} label="Coins" value={profile.coin_balance || 0} />
        <Stat Icon={Palette} label="Theme" value={profile.selected_theme || "light"} />
        <Stat Icon={Trophy} label="Wins" value={profile.achievement_count || 0} />
        <Stat Icon={CalendarCheck} label="Joined" value={joinedYear} />
        <Stat
          Icon={Users}
          label="Followers"
          value={profile.followers_count || 0}
          onClick={() =>
            navigate(`/users/${profile.id}/followers?username=${profile.username || ""}`)
          }
        />
        <Stat
          Icon={Award}
          label="Following"
          value={profile.following_count || 0}
          onClick={() =>
            navigate(`/users/${profile.id}/following?username=${profile.username || ""}`)
          }
        />
        <Stat Icon={isPublic ? Globe : Lock} label="Visibility" value={isPublic ? "Public" : "Private"} />
      </section>

      <section style={styles.featuredCard}>
        <h3 style={styles.featuredHeading}>Featured Achievement</h3>
        <div style={styles.featuredInner}>
          <div style={styles.featuredIcon}>
            <Trophy size={30} />
          </div>
          <div>
            <strong style={styles.featuredTitle}>
              {featured?.name || "No achievement featured yet"}
            </strong>
            <p style={styles.featuredText}>
              {featured?.description ||
                "Complete habits, tasks, and quests to earn your first featured win."}
            </p>
            {featured?.earned_at && (
              <p style={styles.featuredEarned}>
                Earned {new Date(featured.earned_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function Badge({ Icon, label }) {
  return (
    <span style={styles.badge}>
      <Icon size={15} />
      {label}
    </span>
  );
}

function Stat({ Icon, label, value, onClick }) {
  return (
    <div
      style={{ ...styles.statCard, ...(onClick ? styles.statClickable : {}) }}
      onClick={onClick}
      data-testid={`profile-stat-${label.toLowerCase()}`}
    >
      <Icon size={24} style={{ color: "var(--primary-dark)" }} />
      <strong style={styles.statValue}>{value}</strong>
      <span style={styles.statLabel}>{label}</span>
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
  title: { margin: 0, fontSize: 44, lineHeight: 1, letterSpacing: "-0.06em", color: "var(--text)" },
  subtitle: { margin: "12px 0 0", color: "var(--muted)", fontWeight: 600, fontSize: 16 },
  status: { color: "var(--muted)", fontWeight: 700 },
  heroCard: {
    padding: 30,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 30,
    boxShadow: "var(--shadow)",
    textAlign: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 104,
    height: 104,
    margin: "0 auto 16px",
    borderRadius: 999,
    display: "grid",
    placeItems: "center",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
  },
  displayName: { margin: 0, fontSize: 30, color: "var(--text)", letterSpacing: "-0.04em" },
  username: { margin: "6px 0 0", color: "var(--muted)", fontWeight: 800 },
  bio: { margin: "14px auto 0", maxWidth: 460, color: "var(--muted)", fontWeight: 700, lineHeight: 1.55 },
  badgeRow: { display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 18 },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 13px",
    borderRadius: 999,
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    fontWeight: 900,
    fontSize: 13,
    border: "1px solid rgba(79, 143, 91, 0.18)",
  },
  googleBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 13px",
    borderRadius: 999,
    background: "#eef4ff",
    color: "#2f6fed",
    fontWeight: 900,
    fontSize: 13,
    border: "1px solid rgba(47, 111, 237, 0.22)",
  },
  editButton: {
    marginTop: 22,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "13px 22px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 14,
    marginBottom: 18,
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
    textAlign: "center",
  },
  statClickable: { cursor: "pointer" },
  statValue: { fontSize: 26, color: "var(--primary-dark)", lineHeight: 1, textTransform: "capitalize" },
  statLabel: { color: "var(--muted)", fontWeight: 900, fontSize: 12, textTransform: "uppercase" },
  featuredCard: {
    padding: 24,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 28,
    boxShadow: "var(--shadow)",
  },
  featuredHeading: { margin: "0 0 16px", color: "var(--text)", fontSize: 20 },
  featuredInner: { display: "flex", gap: 16, alignItems: "center" },
  featuredIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    background: "#fff7df",
    color: "var(--primary-dark)",
    border: "1px solid rgba(242, 184, 75, 0.55)",
    flex: "0 0 auto",
  },
  featuredTitle: { color: "var(--text)", fontSize: 17 },
  featuredText: { margin: "6px 0 0", color: "var(--muted)", fontWeight: 700, lineHeight: 1.5, fontSize: 14 },
  featuredEarned: { margin: "8px 0 0", color: "var(--primary-dark)", fontWeight: 800, fontSize: 13 },
};
