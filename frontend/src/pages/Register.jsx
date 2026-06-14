import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { toast } from "sonner";

import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const destination = returnTo?.startsWith("/") ? returnTo : "/onboarding";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSubmitting(true);

    const res = await register(email, password, name);

    setSubmitting(false);

    if (res.ok) {
      toast.success("Welcome to OurOrbit");
      navigate(destination);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.backgroundGlow} />

      <div style={styles.shell}>
        <div style={styles.brand}>
          <img
            src="/ourorbit-logo.png"
            alt="OurOrbit"
            style={styles.logo}
            data-testid="brand-logo"
          />

          <div>
            <div style={styles.brandName}>OurOrbit</div>
            <div style={styles.brandSub}>
              Small actions. Long-term momentum.
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.badge}>
            <Sparkles size={14} />
            Start fresh
          </div>

          <h1 style={styles.title}>Create your account</h1>

          <p style={styles.subtitle}>
            Build habits, complete goals, unlock themes, and create momentum one
            day at a time.
          </p>

          <form
            onSubmit={onSubmit}
            style={styles.form}
            data-testid="register-form"
          >
            <Field label="Name" icon={<User size={18} strokeWidth={2.5} />}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={styles.input}
                data-testid="register-name-input"
              />
            </Field>

            <Field label="Email" icon={<Mail size={18} strokeWidth={2.5} />}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={styles.input}
                data-testid="register-email-input"
              />
            </Field>

            <Field label="Password" icon={<Lock size={18} strokeWidth={2.5} />}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={styles.input}
                data-testid="register-password-input"
              />
            </Field>

            <button
              type="submit"
              disabled={submitting}
              style={{
                ...styles.submitButton,
                ...(submitting ? styles.submitButtonDisabled : {}),
              }}
              data-testid="register-submit-btn"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <GoogleSignInButton redirectTo={destination} />

          <div style={styles.footer}>
            <p style={styles.loginText}>
              Already have an account?{" "}
              <Link
                to={`/login${returnTo ? `?returnTo=${encodeURIComponent(destination)}` : ""}`}
                style={styles.loginLink}
                data-testid="go-to-login-link"
              >
                Log in
              </Link>
            </p>

            <p style={styles.legal}>
              By creating an account, you agree to the{" "}
              <Link to="/privacy" style={styles.legalLink}>
                Privacy Policy
              </Link>
              .
            </p>
          </div>
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
    objectFit: "cover",
    boxShadow: "0 12px 28px rgba(0,0,0,0.16)",
    flex: "0 0 auto",
    display: "block",
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
    display: "flex",
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

  footer: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
  },

  loginText: {
    margin: 0,
    textAlign: "center",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 14,
  },

  loginLink: {
    color: "var(--primary-dark)",
    fontWeight: 900,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },

  legal: {
    margin: 0,
    color: "var(--muted)",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 1.5,
  },

  legalLink: {
    color: "var(--primary-dark)",
    fontWeight: 800,
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};
