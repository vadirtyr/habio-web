import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function GoogleGlyph() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

export default function ConnectGoogleRow() {
  const { user, connectGoogle } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const isLinked = Array.isArray(user?.auth_providers)
    ? user.auth_providers.includes("google")
    : false;

  async function handleSuccess(credentialResponse) {
    const idToken = credentialResponse?.credential;

    if (!idToken) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }

    setSubmitting(true);
    const res = await connectGoogle(idToken);
    setSubmitting(false);

    if (res.ok) {
      toast.success("Google account connected");
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div style={styles.card} data-testid="connect-google-row">
      <div style={styles.iconWrap}>
        <GoogleGlyph />
      </div>

      <div style={styles.body}>
        <h2 style={styles.title}>Google</h2>
        <p style={styles.description}>
          {isLinked
            ? "Your Google account is connected. You can sign in with Google."
            : "Connect Google to sign in with one tap next time."}
        </p>
      </div>

      {isLinked ? (
        <span style={styles.connectedPill} data-testid="google-connected-pill">
          <BadgeCheck size={16} />
          Connected
        </span>
      ) : !GOOGLE_CLIENT_ID ? (
        <span style={styles.unavailable}>Not configured</span>
      ) : (
        <div
          style={{
            ...styles.buttonWrap,
            opacity: submitting ? 0.6 : 1,
            pointerEvents: submitting ? "none" : "auto",
          }}
          data-testid="connect-google-button"
        >
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => toast.error("Google connection was cancelled or failed.")}
            theme="outline"
            size="medium"
            shape="pill"
            text="signin"
          />
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: 20,
    borderRadius: 26,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
    boxSizing: "border-box",
    flexWrap: "wrap",
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 16,
    display: "grid",
    placeItems: "center",
    background: "#f3f6ff",
    border: "1px solid rgba(47, 111, 237, 0.16)",
    flex: "0 0 auto",
  },
  body: {
    flex: 1,
    minWidth: 200,
  },
  title: {
    margin: 0,
    color: "var(--text)",
    fontSize: 19,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  description: {
    margin: "8px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.45,
    fontSize: 14,
  },
  connectedPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 14px",
    borderRadius: 999,
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    fontWeight: 900,
    fontSize: 13,
    border: "1px solid rgba(79, 143, 91, 0.2)",
    flex: "0 0 auto",
  },
  unavailable: {
    color: "var(--muted)",
    fontWeight: 800,
    fontSize: 13,
    flex: "0 0 auto",
  },
  buttonWrap: {
    flex: "0 0 auto",
  },
};
