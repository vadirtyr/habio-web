import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Leaf, Mail } from "lucide-react";
import { toast } from "sonner";

import api, { formatApiError } from "@/lib/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Enter your email address.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setSent(true);
      toast.success("Reset link sent if an account exists.");
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <Brand />

        <div style={styles.card}>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={17} />
            Back to login
          </Link>

          <span style={styles.badge}>Password help</span>

          <h1 style={styles.title}>Reset your password</h1>

          <p style={styles.subtitle}>
            Enter your account email and we’ll send you a secure reset link.
          </p>

          {sent ? (
            <div style={styles.successBox}>
              <h2 style={styles.successTitle}>Check your inbox</h2>
              <p style={styles.successText}>
                If an account exists for that email, a reset link has been sent.
                The link expires in 1 hour.
              </p>

              <Link to="/login" style={styles.primaryLink}>
                Return to login
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={styles.form}>
              <label style={styles.field}>
                <span style={styles.label}>Email</span>
                <div style={styles.inputWrap}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={styles.input}
                    autoComplete="email"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  ...styles.submitButton,
                  ...(submitting ? styles.submitButtonDisabled : {}),
                }}
              >
                {submitting ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div style={styles.brand}>
      <div style={styles.logo}>
        H
        <Leaf size={16} style={styles.logoLeaf} />
      </div>
      <div>
        <div style={styles.brandName}>Habio</div>
        <div style={styles.brandSub}>Build better days</div>
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
  shell: {
    width: "100%",
    maxWidth: 440,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 24,
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
  card: {
    background: "rgba(255, 255, 255, 0.92)",
    border: "1px solid var(--border)",
    borderRadius: 32,
    boxShadow: "var(--shadow)",
    padding: 34,
    backdropFilter: "blur(12px)",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    marginBottom: 18,
    color: "var(--muted)",
    fontWeight: 800,
    fontSize: 14,
    textDecoration: "none",
  },
  badge: {
    display: "inline-flex",
    borderRadius: 999,
    background: "#fff7df",
    color: "var(--primary-dark)",
    border: "1px solid rgba(242, 184, 75, 0.5)",
    padding: "7px 11px",
    fontWeight: 900,
    fontSize: 13,
    marginBottom: 16,
  },
  title: {
    margin: 0,
    color: "var(--text)",
    fontSize: 36,
    lineHeight: 1,
    letterSpacing: "-0.06em",
  },
  subtitle: {
    margin: "12px 0 26px",
    color: "var(--muted)",
    fontWeight: 600,
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  field: {
    display: "block",
  },
  label: {
    display: "block",
    marginBottom: 7,
    color: "var(--muted)",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  inputWrap: {
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--muted)",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--border)",
    borderRadius: 18,
    padding: "14px 14px 14px 44px",
    color: "var(--text)",
    background: "white",
    outline: "none",
    fontWeight: 700,
  },
  submitButton: {
    marginTop: 4,
    width: "100%",
    border: "none",
    borderRadius: 999,
    padding: "14px 18px",
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },
  submitButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  successBox: {
    padding: 18,
    borderRadius: 22,
    background: "#eef6ef",
    border: "1px solid rgba(79, 143, 91, 0.18)",
  },
  successTitle: {
    margin: 0,
    color: "var(--text)",
    fontSize: 21,
    fontWeight: 900,
  },
  successText: {
    margin: "8px 0 16px",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.45,
  },
  primaryLink: {
    color: "var(--primary-dark)",
    fontWeight: 900,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};