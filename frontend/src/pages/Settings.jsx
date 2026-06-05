import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  KeyRound,
  LifeBuoy,
  LogOut,
  Palette,
  RefreshCcw,
  Shield,
  Trash2,
  UserCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import ConnectGoogleRow from "@/components/ConnectGoogleRow";

export default function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    toast.success("Logged out");
    navigate("/login");
  }

  const displayName = user?.name || "Your account";
  const email = user?.email || "";
  const coinBalance = user?.coin_balance ?? user?.coins ?? 0;
  const level = user?.level_data?.level ?? 1;

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <p style={styles.eyebrow}>OurOrbit</p>
        <h1 style={styles.title}>Settings</h1>
        <p style={styles.subtitle}>
          Manage your account, privacy, onboarding, themes, and session.
        </p>
      </header>

      <section style={styles.profileCard}>
        <div style={styles.avatar}>
          <UserCircle size={34} />
        </div>

        <div style={styles.profileMain}>
          <h2 style={styles.profileName}>{displayName}</h2>
          <p style={styles.profileEmail}>{email}</p>
        </div>

        <div style={styles.stats}>
          <div style={styles.statPill}>Level {level}</div>
          <div style={styles.statPill}>{coinBalance} coins</div>
        </div>
      </section>

      <section style={styles.grid}>
        <SettingsCard
          icon={<KeyRound size={22} />}
          title="Change Password"
          description="Update the password used to access your account."
          to="/change-password"
        />

        <SettingsCard
          icon={<Palette size={22} />}
          title="Theme Store"
          description="Choose owned themes and unlock new visual styles."
          to="/themes"
        />

        <SettingsCard
          icon={<RefreshCcw size={22} />}
          title="Restart Onboarding"
          description="Run the setup flow again and add suggested habits."
          to="/onboarding"
        />

        <SettingsCard
          icon={<Shield size={22} />}
          title="Privacy Policy"
          description="Review how OurOrbit handles your account and app data."
          to="/privacy"
        />

        <SettingsCard
          icon={<LifeBuoy size={22} />}
          title="Support"
          description="Need help? Contact support at support@ourorbit.net."
          href="mailto:support@ourorbit.net"
        />

        <SettingsCard
          danger
          icon={<Trash2 size={22} />}
          title="Delete Account"
          description="Permanently delete your account and associated data."
          to="/delete-account"
        />
      </section>

      <section style={styles.connectionsSection}>
        <h2 style={styles.sectionHeading}>Connected accounts</h2>
        <ConnectGoogleRow />
      </section>

      <section style={styles.footerCard}>
        <div>
          <h2 style={styles.footerTitle}>Session</h2>
          <p style={styles.footerText}>
            Log out of this browser. You can sign back in anytime.
          </p>
        </div>

        <button style={styles.logoutButton} onClick={handleLogout}>
          <LogOut size={18} />
          Log out
        </button>
      </section>
    </div>
  );
}

function SettingsCard({ icon, title, description, to, href, danger = false }) {
  const content = (
    <div style={{ ...styles.card, ...(danger ? styles.dangerCard : {}) }}>
      <div style={{ ...styles.cardIcon, ...(danger ? styles.dangerIcon : {}) }}>
        {icon}
      </div>

      <div style={styles.cardBody}>
        <h2 style={styles.cardTitle}>{title}</h2>
        <p style={styles.cardDescription}>{description}</p>
      </div>

      <ChevronRight size={20} style={styles.chevron} />
    </div>
  );

  if (href) {
    return (
      <a href={href} style={styles.cardLink}>
        {content}
      </a>
    );
  }

  return (
    <Link to={to} style={styles.cardLink}>
      {content}
    </Link>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 22,
  },
  header: {
    maxWidth: 720,
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  title: {
    margin: 0,
    color: "var(--text)",
    fontSize: 48,
    lineHeight: 1,
    letterSpacing: "-0.06em",
  },
  subtitle: {
    margin: "12px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 16,
    lineHeight: 1.5,
  },
  profileCard: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 22,
    borderRadius: 28,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
    flexWrap: "wrap",
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 22,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    color: "white",
    flex: "0 0 auto",
  },
  profileMain: {
    flex: 1,
    minWidth: 220,
  },
  profileName: {
    margin: 0,
    color: "var(--text)",
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: "-0.04em",
  },
  profileEmail: {
    margin: "5px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    overflowWrap: "anywhere",
  },
  stats: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  statPill: {
    padding: "9px 12px",
    borderRadius: 999,
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    fontWeight: 900,
    border: "1px solid rgba(79, 143, 91, 0.18)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 16,
  },
  connectionsSection: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  sectionHeading: {
    margin: 0,
    color: "var(--text)",
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  cardLink: {
    color: "inherit",
    textDecoration: "none",
  },
  card: {
    minHeight: 132,
    height: "100%",
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    padding: 20,
    borderRadius: 26,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
    boxSizing: "border-box",
  },
  dangerCard: {
    borderColor: "rgba(217, 83, 79, 0.35)",
  },
  cardIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    flex: "0 0 auto",
  },
  dangerIcon: {
    background: "rgba(217, 83, 79, 0.12)",
    color: "var(--danger)",
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    margin: 0,
    color: "var(--text)",
    fontSize: 19,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  cardDescription: {
    margin: "8px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.45,
    fontSize: 14,
  },
  chevron: {
    color: "var(--muted)",
    marginTop: 4,
    flex: "0 0 auto",
  },
  footerCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    padding: 22,
    borderRadius: 28,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
    flexWrap: "wrap",
  },
  footerTitle: {
    margin: 0,
    color: "var(--text)",
    fontSize: 20,
    fontWeight: 900,
  },
  footerText: {
    margin: "6px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.45,
  },
  logoutButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
};