import React, { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function ChangePassword() {
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

    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
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
        err?.response?.data?.detail ||
          "Unable to change password."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <p style={styles.eyebrow}>Security</p>

          <h1 style={styles.title}>Change password</h1>

          <p style={styles.subtitle}>
            Update your password to keep your Habio account secure.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Current password</label>

            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter current password"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>New password</label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter new password"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm new password</label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={styles.input}
              placeholder="Confirm new password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Updating..." : "Update password"}
          </button>
        </form>
      </div>
    </div>
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
    maxWidth: 560,
    background: "white",
    border: "1px solid var(--border)",
    borderRadius: 28,
    padding: 28,
    boxShadow: "var(--shadow)",
  },
  header: {
    marginBottom: 24,
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "var(--primary-dark)",
    fontSize: 13,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  title: {
    margin: 0,
    fontSize: 36,
    lineHeight: 1,
    letterSpacing: "-0.05em",
    color: "var(--text)",
  },
  subtitle: {
    margin: "12px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.5,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontWeight: 800,
    color: "var(--text)",
  },
  input: {
    height: 52,
    borderRadius: 16,
    border: "1px solid var(--border)",
    padding: "0 16px",
    fontSize: 16,
    outline: "none",
    background: "white",
    color: "var(--text)",
  },
  button: {
    marginTop: 8,
    height: 54,
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    fontSize: 16,
    cursor: "pointer",
  },
};