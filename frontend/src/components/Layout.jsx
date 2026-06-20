import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Compass,
  LogOut,
  Rocket,
  Sparkles,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { notificationApi } from "@/lib/api";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/", icon: "🌍" },
  { label: "Habits", path: "/habits", icon: "✅" },
  { label: "Tasks", path: "/tasks", icon: "📝" },
  { label: "Rewards", path: "/rewards", icon: "🎁" },
  { label: "Quests", path: "/quests", icon: "🧭" },
  { label: "Achievements", path: "/achievements", icon: "🏆" },
  { label: "Shared Orbits", path: "/orbits", icon: "🫂" },
  { label: "Friend Feed", path: "/feed", icon: "🛰️" },
  { label: "My Activity", path: "/activity", icon: "📡" },
  { label: "Find People", path: "/people", icon: "👥" },
  { label: "Notifications", path: "/notifications", icon: "🔔", badgeKey: "notifications" },
  { label: "Weekly Recap", path: "/weekly-recap", icon: "📈" },
  { label: "Profile", path: "/profile", icon: "🪐" },
  { label: "Themes", path: "/themes", icon: "🎨" },
  { label: "History", path: "/history", icon: "📅" },
  { label: "Settings", path: "/settings", icon: "⚙️" },
];

export default function Layout({ children }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const [unreadCount, setUnreadCount] = useState(0);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.innerWidth < 980
      : false
  );

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 980);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadUnread() {
      try {
        const { data } = await notificationApi.getUnreadCount();
        if (active) setUnreadCount(data?.count || 0);
      } catch (err) {
        // ignore
      }
    }

    loadUnread();
    const interval = setInterval(loadUnread, 30000);

    function handleRefresh() {
      loadUnread();
    }
    window.addEventListener("habio:notif-refresh", handleRefresh);

    return () => {
      active = false;
      clearInterval(interval);
      window.removeEventListener("habio:notif-refresh", handleRefresh);
    };
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div
      style={{
        ...styles.shell,
        gridTemplateColumns: isMobile
          ? "1fr"
          : "300px minmax(0, 1fr)",
      }}
    >
      <aside
        style={{
          ...styles.sidebar,
          position: isMobile ? "relative" : "sticky",
          minHeight: isMobile ? "auto" : "100vh",
          borderRight: isMobile
            ? "none"
            : "1px solid var(--border)",
          borderBottom: isMobile
            ? "1px solid var(--border)"
            : "none",
          padding: isMobile ? 16 : 22,
        }}
      >
        <div>
          <div
            style={{
              ...styles.brand,
              marginBottom: isMobile ? 20 : 32,
            }}
            onClick={() => navigate("/")}
          >
           <img
              src="/ourorbit-logo.png"
              alt="OurOrbit"
              style={styles.logoImage}
            />

            <div>
              <strong
                style={{
                  ...styles.brandName,
                  fontSize: isMobile ? 24 : 28,
                }}
              >
                OurOrbit
              </strong>

              <p style={styles.brandSub}>
                Small actions. Long-term momentum.
              </p>
            </div>
          </div>

          <nav
            style={{
              ...styles.nav,
              flexDirection: isMobile ? "row" : "column",
              flexWrap: isMobile ? "wrap" : "nowrap",
            }}
          >
            {[...NAV_ITEMS, ...(user?.is_admin ? [{ label: "Orbit Growth", path: "/admin/orbit-growth", icon: "📊" }] : [])].map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                style={({ isActive }) => ({
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  flex: isMobile ? "1 1 auto" : undefined,
                  justifyContent: isMobile
                    ? "center"
                    : "flex-start",
                })}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badgeKey === "notifications" && unreadCount > 0 && (
                  <span style={styles.navBadge} data-testid="nav-unread-badge">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={styles.footer}>
          <div style={styles.tipCard}>
            <div style={styles.tipHeader}>
              <Sparkles size={15} />
              Today
            </div>

            <p style={styles.tipText}>
              Progress compounds faster than motivation. Keep your orbit moving.
            </p>
          </div>

          <button
            style={styles.secondaryButton}
            onClick={() => navigate("/onboarding")}
          >
            <Compass size={16} />
            Restart onboarding
          </button>

          <button style={styles.logoutButton} onClick={handleLogout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main
        style={{
          ...styles.main,
          padding: isMobile
            ? "20px 14px"
            : "34px clamp(16px, 4vw, 34px)",
        }}
      >
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    background: "var(--bg)",
    color: "var(--text)",
  },

  sidebar: {
    background: "rgba(255,255,255,0.52)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    top: 0,
    boxSizing: "border-box",
    backdropFilter: "blur(16px)",
    overflow: "hidden",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    cursor: "pointer",
  },

  logo: {
    borderRadius: 20,
    background:
      "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    color: "white",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 10px 26px rgba(0,0,0,0.16)",
    flex: "0 0 auto",
  },

  brandName: {
    display: "block",
    letterSpacing: "-0.05em",
    color: "var(--text)",
    lineHeight: 1,
  },

  brandSub: {
    margin: "6px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.4,
  },

  nav: {
    display: "flex",
    gap: 8,
  },

  navItem: {
    padding: "13px 16px",
    borderRadius: 20,
    color: "var(--text)",
    textDecoration: "none",
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    gap: 12,
    transition: "all 0.15s ease",
    minWidth: 0,
  },

  navItemActive: {
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    boxShadow:
      "inset 0 0 0 1px rgba(79, 143, 91, 0.18)",
  },

  navIcon: {
    width: 24,
    display: "inline-flex",
    justifyContent: "center",
    fontSize: 16,
    flex: "0 0 auto",
  },

  navBadge: {
    marginLeft: "auto",
    minWidth: 22,
    height: 22,
    padding: "0 6px",
    borderRadius: 999,
    background: "var(--danger)",
    color: "white",
    fontWeight: 900,
    fontSize: 12,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flex: "0 0 auto",
  },

  footer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 24,
  },

  tipCard: {
    background: "rgba(255,255,255,0.55)",
    border: "1px solid var(--border)",
    borderRadius: 22,
    padding: 16,
    boxShadow: "var(--shadow)",
  },

  tipHeader: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    fontWeight: 900,
    fontSize: 12,
    marginBottom: 10,
  },

  tipText: {
    margin: 0,
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1.5,
  },

  secondaryButton: {
    padding: "12px 14px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutButton: {
    padding: "12px 14px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 10px 24px rgba(79, 143, 91, 0.22)",
    },
    logoImage: {
    width: 54,
    height: 54,
    borderRadius: 20,
    objectFit: "cover",
    boxShadow: "0 10px 26px rgba(0,0,0,0.16)",
    flex: "0 0 auto",
    },
  main: {
    width: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
  },

  content: {
    width: "100%",
    maxWidth: 1240,
    margin: "0 auto",
  },
};
