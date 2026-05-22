import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  KeyRound,
  Lock,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import api, { formatApiError } from "@/lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(
    () => searchParams.get("token") || "",
    [searchParams]
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    if (!token) {
      toast.error("Missing reset token.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/auth/reset-password", {
        token,
        new_password: newPassword,
      });

      toast.success("Password reset successfully.");
      navigate("/login");
    } catch (err) {
      toast.error(formatApiError(err?.response?.data?.detail));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow} />

      <div style={styles.shell}>
        <Brand />

        <div style={styles.card}>
          <Link to="/login" style={styles.backLink}>
            <ArrowLeft size={17} />
            Back to login
          </Link>

          <div style={styles.badge}>
            <ShieldCheck size={14} />
            Secure reset
          </div>

          <h1 style={styles.title}>Create a new password</h1>

          <p style={styles.subtitle}>
            Choose a new password for your account. Reset links expire after 1
            hour for security.
          </p>

          {!token ? (
            <div style={styles.errorBox}>
              <div style={styles.errorIcon}>
                <KeyRound size={20} />
              </div>

              <h2 style={styles.errorTitle}>Invalid reset link</h2>

              <p style={styles.errorText}>
                This reset link is missing or invalid. Request a new password
                reset email and try again.
              </p>

              <Link to="/forgot-password" style={styles.primaryLink}>
                Request a new reset link
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} style={styles.form}>
              <label style={styles.field}>
                <span style={styles.label}>New password</span>

                <div style={styles.inputWrap}>
                  <Lock size={18} style={styles.inputIcon} />

                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    style={styles.input}
                    autoComplete="new-password"
                  />
                </div>
              </label>

              <label style={styles.field}>
                <span style={styles.label}>Confirm password</span>

                <div style={styles.inputWrap}>
                  <Lock size={18} style={styles.inputIcon} />

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password"
                    style={styles.input}
                    autoComplete="new-password"
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
                {submitting ? "Resetting password..." : "Reset password"}
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
        <Rocket size={24} />
      </div>

      <div>
        <div style={styles.brandName}>OurOrbit</div>

        <div style={styles.brandSub}>
          Small actions. Long-term momentum.
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
    position: "relative",
    overflow: "hidden",
  },

  backgroundGlow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(242, 184, 75, 0.20), transparent 30%), radial-gradient(circle at bottom right, rgba(79, 143, 91, 0.12), transparent 32%)",
    pointerEvents: "none",
  },

  shell: {
    width: "100%",
    maxWidth: 460,
    position: "relative",
    zIndex: 1,
  },

  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginBottom: 26,
  },

  logo: {
    width: 58,
    height: 58,
    borderRadius: 22,
    background:
      "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    color: "white",
    display: "grid",
    placeItems: "center",
    boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
    flex: "0 0 auto",
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
    lineHeight: 1.4,
  },

  card: {
    background: "rgba(255,255,255,0.72)",
    border: "1px solid var(--border)",
    borderRadius: 34,
    boxShadow: "var(--shadow)",
    padding: 34,
    backdropFilter: "blur(16px)",
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
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    background: "#fff7df",
    color: "var(--primary-dark)",
    border: "1px solid rgba(242, 184, 75, 0.5)",
    padding: "7px 12px",
    fontWeight: 900,
    fontSize: 13,
    marginBottom: 18,
  },

  title: {
    margin: 0,
    color: "var(--text)",
    fontSize: 42,
    lineHeight: 1,
    letterSpacing: "-0.06em",
  },

  subtitle: {
    margin: "14px 0 28px",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.6,
    fontSize: 15,
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
    marginBottom: 8,
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
    left: 15,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--muted)",
    pointerEvents: "none",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid var(--border)",
    borderRadius: 20,
    padding: "15px 15px 15px 46px",
    color: "var(--text)",
    background: "rgba(255,255,255,0.92)",
    outline: "none",
    fontWeight: 700,
    fontSize: 15,
  },

  submitButton: {
    marginTop: 6,
    width: "100%",
    border: "none",
    borderRadius: 999,
    padding: "15px 18px",
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 15,
    boxShadow: "0 10px 24px rgba(79, 143, 91, 0.24)",
  },

  submitButtonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },

  errorBox: {
    padding: 24,
    borderRadius: 24,
    background: "rgba(217, 83, 79, 0.08)",
    border: "1px solid rgba(217, 83, 79, 0.22)",
    textAlign: "center",
  },

  errorIcon: {
    width: 54,
    height: 54,
    margin: "0 auto 14px",
    borderRadius: 18,
    background: "rgba(217, 83, 79, 0.12)",
    color: "var(--danger)",
    display: "grid",
    placeItems: "center",
  },

  errorTitle: {
    margin: 0,
    color: "var(--danger)",
    fontSize: 24,
    fontWeight: 900,
    letterSpacing: "-0.04em",
  },

  errorText: {
    margin: "10px 0 18px",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.6,
    fontSize: 14,
  },

  primaryLink: {
    color: "var(--primary-dark)",
    fontWeight: 900,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};