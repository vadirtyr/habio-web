import React from "react";
import { Link } from "react-router-dom";
import { Leaf, Trash2 } from "lucide-react";

export default function DeleteAccount() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            H
            <Leaf size={16} strokeWidth={3} style={styles.logoLeaf} />
          </div>

          <div>
            <div style={styles.brandName}>Habio</div>
            <div style={styles.brandSub}>Account deletion</div>
          </div>
        </div>

        <div style={styles.iconWrap}>
          <Trash2 size={34} strokeWidth={2.5} />
        </div>

        <h1 style={styles.title}>Delete your Habio account</h1>

        <p style={styles.text}>
          You can permanently delete your Habio account and associated data from
          inside the Habio app.
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>How to delete your account</h2>

          <ol style={styles.list}>
            <li>Log into your Habio account.</li>
            <li>Open Settings.</li>
            <li>Select Delete Account.</li>
            <li>Confirm that you want to permanently delete your account.</li>
          </ol>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What gets deleted</h2>

          <p style={styles.text}>
            Deleting your account removes your Habio account and associated
            habit, task, reward, progress, achievement, quest, redemption, and
            transaction data.
          </p>
        </div>

        <div style={styles.notice}>
          <strong>Warning:</strong> Account deletion is permanent and cannot be
          undone.
        </div>

        <p style={styles.text}>
          If you cannot access your account, contact support at{" "}
          <a href="mailto:support@habioapp.co" style={styles.link}>
            support@habioapp.co
          </a>
          .
        </p>

        <div style={styles.footer}>
          <Link to="/privacy" style={styles.footerLink}>
            Privacy Policy
          </Link>

          <Link to="/login" style={styles.footerLink}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(242, 184, 75, 0.22), transparent 34%), var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: 720,
    background: "rgba(255, 255, 255, 0.94)",
    border: "1px solid var(--border)",
    borderRadius: 32,
    boxShadow: "var(--shadow)",
    padding: 36,
    backdropFilter: "blur(12px)",
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 28,
  },

  logo: {
    width: 54,
    height: 54,
    borderRadius: 18,
    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 28,
    boxShadow: "var(--shadow)",
    position: "relative",
  },

  logoLeaf: {
    position: "absolute",
    right: 8,
    top: 8,
    color: "var(--accent)",
  },

  brandName: {
    color: "var(--text)",
    fontWeight: 900,
    fontSize: 30,
    lineHeight: 1,
    letterSpacing: "-0.05em",
  },

  brandSub: {
    marginTop: 4,
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 13,
  },

  iconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    display: "grid",
    placeItems: "center",
    background: "#fff1f1",
    color: "#b42318",
    border: "1px solid #ffd0d0",
    marginBottom: 18,
  },

  title: {
    margin: 0,
    color: "var(--text)",
    fontSize: 38,
    lineHeight: 1.05,
    letterSpacing: "-0.06em",
  },

  text: {
    color: "var(--muted)",
    fontWeight: 600,
    lineHeight: 1.65,
    fontSize: 16,
  },

  section: {
    marginTop: 26,
  },

  sectionTitle: {
    margin: "0 0 10px",
    color: "var(--text)",
    fontSize: 20,
    fontWeight: 900,
  },

  list: {
    margin: 0,
    paddingLeft: 22,
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.8,
  },

  notice: {
    marginTop: 26,
    padding: 16,
    borderRadius: 18,
    background: "#fff7df",
    border: "1px solid rgba(242, 184, 75, 0.55)",
    color: "var(--text)",
    fontWeight: 700,
    lineHeight: 1.5,
  },

  link: {
    color: "var(--primary-dark)",
    fontWeight: 900,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },

  footer: {
    marginTop: 30,
    display: "flex",
    flexWrap: "wrap",
    gap: 14,
  },

  footerLink: {
    color: "var(--primary-dark)",
    fontWeight: 900,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};