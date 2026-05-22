import React from "react";
import { Link } from "react-router-dom";
import { Rocket, Trash2 } from "lucide-react";

export default function DeleteAccount() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            <Rocket size={24} />
          </div>

          <div>
            <div style={styles.brandName}>OurOrbit</div>
            <div style={styles.brandSub}>Account deletion</div>
          </div>
        </div>

        <div style={styles.iconWrap}>
          <Trash2 size={34} strokeWidth={2.5} />
        </div>

        <h1 style={styles.title}>Delete your OurOrbit account</h1>

        <p style={styles.text}>
          You can permanently delete your OurOrbit account and associated data
          from inside the app.
        </p>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>How to delete your account</h2>

          <ol style={styles.list}>
            <li>Log into your OurOrbit account.</li>
            <li>Open Settings.</li>
            <li>Select Delete Account.</li>
            <li>Confirm that you want to permanently delete your account.</li>
          </ol>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>What gets deleted</h2>

          <p style={styles.text}>
            Deleting your account removes your account and associated habit,
            task, reward, progress, achievement, quest, redemption, and
            transaction data.
          </p>
        </div>

        <div style={styles.notice}>
          <strong>Warning:</strong> Account deletion is permanent and cannot be
          undone.
        </div>

        <p style={styles.text}>
          If you cannot access your account, contact support at{" "}
          <a href="mailto:support@ourorbit.net" style={styles.link}>
            support@ourorbit.net
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
    background: "var(--bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    boxSizing: "border-box",
  },

  card: {
    width: "100%",
    maxWidth: 720,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 34,
    boxShadow: "var(--shadow)",
    padding: 36,
    boxSizing: "border-box",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 28,
  },

  logo: {
    width: 58,
    height: 58,
    borderRadius: 22,
    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    color: "white",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
  },

  brandName: {
    color: "var(--text)",
    fontWeight: 900,
    fontSize: 34,
    lineHeight: 1,
    letterSpacing: "-0.06em",
  },

  brandSub: {
    marginTop: 5,
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
    background: "rgba(217, 83, 79, 0.12)",
    color: "var(--danger)",
    border: "1px solid rgba(217, 83, 79, 0.28)",
    marginBottom: 18,
  },

  title: {
    margin: 0,
    color: "var(--text)",
    fontSize: 42,
    lineHeight: 1.05,
    letterSpacing: "-0.06em",
  },

  text: {
    color: "var(--muted)",
    fontWeight: 700,
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
    background: "rgba(242, 184, 75, 0.16)",
    border: "1px solid rgba(242, 184, 75, 0.45)",
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