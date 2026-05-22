import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "🌿" },
  { label: "Habits", path: "/habits", icon: "✅" },
  { label: "Tasks", path: "/tasks", icon: "📝" },
  { label: "Rewards", path: "/rewards", icon: "🎁" },
  { label: "Quests", path: "/quests", icon: "🧭" },
  { label: "Achievements", path: "/achievements", icon: "🏆" },
  { label: "Themes", path: "/themes", icon: "🎨" },
  { label: "History", path: "/history", icon: "📅" },
  { label: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.brand} onClick={() => navigate("/")}>
            <div style={styles.logo}>
              H<span style={styles.leaf}>●</span>
            </div>

            <div>
              <strong style={styles.brandName}>Habio</strong>
              <p style={styles.brandSub}>Build better days</p>
            </div>
          </div>

          <nav style={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                })}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={styles.footer}>
          <div style={styles.tipCard}>
            <div style={styles.tipBadge}>Today</div>
            <p style={styles.tipText}>
              Small wins compound. Keep your streak alive.
            </p>
          </div>

          <button
            style={styles.onboardingButton}
            onClick={() => navigate("/onboarding")}
          >
            Restart onboarding
          </button>

          <button style={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "280px minmax(0, 1fr)",
    background: "var(--bg)",
    color: "var(--text)",
  },
  sidebar: {
    minHeight: "100vh",
    padding: 22,
    background: "rgba(255, 255, 255, 0.86)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    boxSizing: "border-box",
    backdropFilter: "blur(12px)",
    overflowY: "auto",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 30,
    cursor: "pointer",
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 25,
    boxShadow: "var(--shadow)",
    position: "relative",
  },
  leaf: {
    position: "absolute",
    right: 10,
    top: 9,
    fontSize: 9,
    color: "var(--accent)",
  },
  brandName: {
    fontSize: 24,
    letterSpacing: "-0.04em",
    color: "var(--text)",
  },
  brandSub: {
    margin: "3px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 13,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  navItem: {
    padding: "12px 14px",
    borderRadius: 999,
    color: "var(--text)",
    textDecoration: "none",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 10,
    transition: "background 0.15s ease, transform 0.15s ease",
  },
  navItemActive: {
    background: "#eef6ef",
    color: "var(--primary-dark)",
    boxShadow: "inset 0 0 0 1px rgba(79, 143, 91, 0.18)",
  },
  navIcon: {
    width: 24,
    display: "inline-flex",
    justifyContent: "center",
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 24,
  },
  tipCard: {
    background: "#fff7df",
    border: "1px solid rgba(242, 184, 75, 0.55)",
    borderRadius: 18,
    padding: 14,
  },
  tipBadge: {
    display: "inline-flex",
    background: "var(--accent)",
    color: "var(--text)",
    borderRadius: 999,
    padding: "4px 9px",
    fontSize: 12,
    fontWeight: 900,
    marginBottom: 8,
  },
  tipText: {
    margin: 0,
    color: "var(--primary-dark)",
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.35,
  },
  onboardingButton: {
    padding: "12px 14px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "white",
    color: "var(--primary-dark)",
    fontWeight: 900,
    cursor: "pointer",
  },
  logoutButton: {
    padding: "12px 14px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
  },
  main: {
    padding: "34px clamp(16px, 4vw, 34px)",
    width: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
  },
  content: {
    width: "100%",
    maxWidth: 1180,
    margin: "0 auto",
  },
};