import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Leaf, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.ok) {
      toast.success("Welcome back!");
      navigate("/");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.brand}>
          <div style={styles.logo}>
            H
            <Leaf size={16} strokeWidth={3} style={styles.logoLeaf} />
          </div>

          <div>
            <div style={styles.brandName}>Habio</div>
            <div style={styles.brandSub}>Build better days</div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.badge}>Welcome back</div>

          <h1 style={styles.title}>Log in to Habio</h1>
          <p style={styles.subtitle}>
            Keep your streaks alive, finish your tasks, and earn your next
            reward.
          </p>

          <form onSubmit={onSubmit} style={styles.form} data-testid="login-form">
            <Field label="Email" icon={<Mail size={18} strokeWidth={2.5} />}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
                data-testid="login-email-input"
              />
            </Field>

            <Field label="Password" icon={<Lock size={18} strokeWidth={2.5} />}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                data-testid="login-password-input"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.submitButton,
                ...(submitting ? styles.submitButtonDisabled : {}),
              }}
              data-testid="login-submit-btn"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p style={styles.registerText}>
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              style={styles.registerLink}
              data-testid="go-to-register-link"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      <div style={styles.inputWrap}>
        <span style={styles.inputIcon}>{icon}</span>
        {children}
      </div>
    </label>
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
    display: "flex",
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

  registerText: {
    margin: "22px 0 0",
    textAlign: "center",
    color: "var(--muted)",
    fontWeight: 600,
    fontSize: 14,
  },

  registerLink: {
    color: "var(--primary-dark)",
    fontWeight: 900,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};