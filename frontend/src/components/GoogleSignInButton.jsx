import React from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

export default function GoogleSignInButton({ redirectTo = "/" }) {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // If no client id is configured, hide the button entirely so the rest of
  // the auth form keeps working.
  if (!GOOGLE_CLIENT_ID) return null;

  async function handleSuccess(credentialResponse) {
    const idToken = credentialResponse?.credential;

    if (!idToken) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }

    const res = await loginWithGoogle(idToken);

    if (res.ok) {
      toast.success("Signed in with Google");
      navigate(redirectTo);
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div style={styles.wrap} data-testid="google-signin">
      <div style={styles.divider}>
        <span style={styles.line} />
        <span style={styles.dividerText}>or</span>
        <span style={styles.line} />
      </div>

      <div style={styles.buttonRow}>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => toast.error("Google sign-in was cancelled or failed.")}
          theme="outline"
          size="large"
          shape="pill"
          width="320"
          text="continue_with"
        />
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    marginTop: 20,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
  },
  line: {
    flex: 1,
    height: 1,
    background: "var(--border)",
  },
  dividerText: {
    color: "var(--muted)",
    fontWeight: 800,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "center",
  },
};
