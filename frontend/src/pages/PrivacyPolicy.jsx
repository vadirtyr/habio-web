// src/pages/PrivacyPolicy.jsx

import React from "react";

export default function PrivacyPolicy() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.hero}>
          <div style={styles.badge}>Privacy & Data</div>

          <h1 style={styles.title}>Privacy Policy</h1>

          <p style={styles.subtitle}>
            Effective Date: May 22, 2026
          </p>
        </div>

        <div style={styles.content}>
          <section style={styles.section}>
            <p>
              Welcome to <strong>OurOrbit</strong>. Your privacy matters to us.
              This Privacy Policy explains what information we collect, how we
              use it, and the choices you have regarding your data when using
              the OurOrbit website, mobile app, and related services.
            </p>
          </section>

          <Section title="1. Information We Collect">
            <SubSection title="Account Information">
              <p>When you create an account, we may collect:</p>

              <ul style={styles.list}>
                <li>Name or username</li>
                <li>Email address</li>
                <li>
                  Passwords stored securely using encrypted and hashed methods
                </li>
              </ul>
            </SubSection>

            <SubSection title="Habit & Productivity Data">
              <p>
                We collect information you voluntarily enter into the app,
                including:
              </p>

              <ul style={styles.list}>
                <li>Habits</li>
                <li>Tasks</li>
                <li>Goals</li>
                <li>Rewards</li>
                <li>Progress tracking</li>
                <li>Streaks and achievements</li>
              </ul>
            </SubSection>

            <SubSection title="Device & Usage Information">
              <p>We may automatically collect:</p>

              <ul style={styles.list}>
                <li>Device type</li>
                <li>Browser type</li>
                <li>IP address</li>
                <li>App version</li>
                <li>Crash reports</li>
                <li>Usage analytics</li>
              </ul>
            </SubSection>

            <SubSection title="Authentication Tokens">
              <p>
                We use secure authentication tokens to keep you signed in and
                protect your account.
              </p>
            </SubSection>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use collected information to:</p>

            <ul style={styles.list}>
              <li>Provide and maintain the OurOrbit service</li>
              <li>Sync your data across devices</li>
              <li>Improve app functionality and performance</li>
              <li>Personalize your experience</li>
              <li>Respond to support requests</li>
              <li>Detect abuse, fraud, or security issues</li>
            </ul>

            <p style={styles.important}>
              We do not sell your personal information.
            </p>
          </Section>

          <Section title="3. Data Storage & Security">
            <p>
              We take reasonable technical and organizational measures to
              protect your information, including:
            </p>

            <ul style={styles.list}>
              <li>Encrypted HTTPS connections</li>
              <li>Secure password hashing</li>
              <li>Authentication protections</li>
              <li>Restricted server access</li>
            </ul>

            <p>
              However, no system can be guaranteed to be completely secure.
            </p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>
              OurOrbit may use trusted third-party providers for:
            </p>

            <ul style={styles.list}>
              <li>Cloud hosting</li>
              <li>Database infrastructure</li>
              <li>Analytics</li>
              <li>Authentication</li>
              <li>Error monitoring</li>
              <li>Email delivery</li>
            </ul>

            <p>
              These providers may process data on our behalf solely to operate
              the service.
            </p>
          </Section>

          <Section title="5. Cookies & Local Storage">
            <p>
              OurOrbit may use cookies or local device storage to:
            </p>

            <ul style={styles.list}>
              <li>Keep you logged in</li>
              <li>Remember preferences</li>
              <li>Improve application performance</li>
            </ul>

            <p>
              You can control cookies through your browser settings.
            </p>
          </Section>

          <Section title="6. Children's Privacy">
            <p>
              OurOrbit is not intended for children under 13 years old. We do
              not knowingly collect personal information from children.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>
              Depending on your location, you may have rights to:
            </p>

            <ul style={styles.list}>
              <li>Access your data</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account</li>
              <li>Request a copy of your data</li>
            </ul>

            <p>
              To request account deletion or data access, contact:
            </p>

            <p style={styles.contact}>
              support@ourorbit.net
            </p>
          </Section>

          <Section title="8. Account Deletion">
            <p>
              You may request deletion of your account and associated data by
              contacting support. We may retain limited information as required
              for legal, security, or operational purposes.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Updated
              versions will be posted on this page with a revised effective
              date.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              If you have questions about this Privacy Policy, contact:
            </p>

            <div style={styles.contactBox}>
              <p style={styles.contactTitle}>OurOrbit Support</p>
              <p style={styles.contactEmail}>
                support@ourorbit.net
              </p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>{title}</h2>
      <div style={styles.sectionContent}>{children}</div>
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div style={styles.subSection}>
      <h3 style={styles.subSectionTitle}>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg)",
    color: "var(--text)",
  },

  container: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "72px 24px",
  },

  hero: {
    marginBottom: 42,
  },

  badge: {
    display: "inline-flex",
    alignItems: "center",
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
    fontSize: 54,
    lineHeight: 1,
    letterSpacing: "-0.06em",
  },

  subtitle: {
    margin: "14px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 15,
  },

  content: {
    display: "flex",
    flexDirection: "column",
    gap: 34,
  },

  section: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 30,
    padding: 28,
    boxShadow: "var(--shadow)",
  },

  sectionTitle: {
    margin: 0,
    color: "var(--text)",
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-0.04em",
  },

  sectionContent: {
    marginTop: 18,
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.75,
    fontSize: 15,
  },

  subSection: {
    marginBottom: 24,
  },

  subSectionTitle: {
    margin: "0 0 10px",
    color: "var(--text)",
    fontSize: 18,
    fontWeight: 900,
  },

  list: {
    paddingLeft: 22,
    marginTop: 14,
    marginBottom: 18,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  important: {
    marginTop: 18,
    color: "var(--text)",
    fontWeight: 900,
  },

  contact: {
    marginTop: 14,
    color: "var(--primary-dark)",
    fontWeight: 900,
  },

  contactBox: {
    marginTop: 18,
    padding: 20,
    borderRadius: 22,
    background: "rgba(79, 143, 91, 0.08)",
    border: "1px solid rgba(79, 143, 91, 0.18)",
  },

  contactTitle: {
    margin: 0,
    color: "var(--text)",
    fontWeight: 900,
    fontSize: 18,
  },

  contactEmail: {
    margin: "8px 0 0",
    color: "var(--primary-dark)",
    fontWeight: 900,
  },
};