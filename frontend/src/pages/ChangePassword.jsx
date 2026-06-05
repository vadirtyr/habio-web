import React, { useState } from "react";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import api from "@/lib/api";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please complete all fields.");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast.success("Password updated.");

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err?.response?.data?.detail || "Unable to change password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <button style={styles.backButton} onClick={() => navigate("/settings")}>
          <ArrowLeft size={17} />
          Back to settings
        </button>

        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <ShieldCheck size={28} />
          </div>

          <p style={styles.eyebrow}>Security</p>

          <h1 style={styles.title}>Change password</h1>

          <p style={styles.subtitle}>
            Update your password to keep your OurOrbit account secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <PasswordField
            label="Current password"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Enter current password"
            autoComplete="current-password"
          />

          <PasswordField
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />

          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            placeholder="Repeat new password"
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.button,
              ...(submitting ? styles.buttonDisabled : {}),
            }}
          >
            {submitting ? "Updating password..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PasswordField({ label, value, onChange, placeholder, autoComplete }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>

      <div style={styles.inputWrap}>
        <Lock size={18} style={styles.inputIcon} />

        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={styles.input}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      </div>
    </label>
  );
}

const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 20,
  },

  card: {
    width: "100%",
    maxWidth: 620,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 34,
    padding: 32,
    boxShadow: "var(--shadow)",
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    border: "none",
    background: "transparent",
    color: "var(--muted)",
    fontWeight: 900,
    cursor: "pointer",
    padding: 0,
    marginBottom: 24,
  },

  header: {
    marginBottom: 28,
  },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    color: "white",
    display: "grid",
    placeItems: "center",
    marginBottom: 18,
  },

  eyebrow: {
    margin: "0 0 8px",
    color: "var(--primary-dark)",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },

  title: {
    margin: 0,
    fontSize: 44,
    lineHeight: 1,
    letterSpacing: "-0.06em",
    color: "var(--text)",
  },

  subtitle: {
    margin: "14px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.6,
    maxWidth: 480,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
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
    height: 54,
    boxSizing: "border-box",
    borderRadius: 20,
    border: "1px solid var(--border)",
    padding: "0 16px 0 46px",
    fontSize: 16,
    outline: "none",
    background: "rgba(255,255,255,0.72)",
    color: "var(--text)",
    fontWeight: 700,
  },

  button: {
    marginTop: 8,
    height: 56,
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(79, 143, 91, 0.24)",
  },

  buttonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
};