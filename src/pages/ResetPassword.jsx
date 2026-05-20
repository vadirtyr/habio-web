import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, KeyRound, Leaf, Lock } from "lucide-react";
import { toast } from "sonner";

import api, { formatApiError } from "@/lib/api";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

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

      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
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

          <span style={styles.badge}>
            <KeyRound size={15} />
            Secure reset
          </span>

          <h1 style={styles.title}>Create a new password</h1>

          <p style={styles.subtitle}>
            Choose a new password for your account. Your reset link expires
            after 1 hour.
          </p>

          {!token ? (
            <div style={styles.errorBox}>
              <h2 style={styles.errorTitle}>Invalid reset link</h2>
              <p style={styles.errorText}>
                This link is missing a reset token. Request a new password reset
                email and try again.
              </p>

              <Link to="/forgot-password" style={styles.primaryLink}>
                Request new link
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
                {submitting ? "Resetting..." : "Reset password"}
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
    alignItems: "center",
    gap: 6,
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
  errorBox: {
    padding: 18,
    borderRadius: 22,
    background: "#fff1f1",
    border: "1px solid #ffd0d0",
  },
  errorTitle: {
    margin: 0,
    color: "#b42318",
    fontSize: 21,
    fontWeight: 900,
  },
  errorText: {
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