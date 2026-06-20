import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { adminApi, formatApiError } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

const GLOBAL_METRICS = [
  ["total_orbits", "Total Orbits"],
  ["orbits_created_7d", "Created 7d"],
  ["orbits_created_30d", "Created 30d"],
  ["total_orbit_members", "Total Members"],
  ["average_members_per_orbit", "Avg Members / Orbit"],
  ["total_invites_sent", "Invites Sent"],
  ["invites_sent_7d", "Invites 7d"],
  ["invites_sent_30d", "Invites 30d"],
  ["total_invites_accepted", "Invites Accepted"],
  ["invite_acceptance_rate", "Acceptance Rate", "%"],
  ["orbits_with_2_plus_members", "Orbits 2+ Members"],
  ["orbits_with_3_plus_members", "Orbits 3+ Members"],
  ["percent_orbits_with_2_plus_members", "% Orbits 2+", "%"],
  ["percent_orbits_with_3_plus_members", "% Orbits 3+", "%"],
];

const USER_RETENTION_METRICS = [
  ["registered_30d", "Registered 30d"],
  ["active_7d", "Active 7d"],
  ["active_30d", "Active 30d"],
  ["eligible_for_30d_retention", "Eligible 30d"],
  ["retained_30d", "Retained 30d"],
  ["retention_rate_30d", "Retention Rate", "%"],
];

const ORBIT_RETENTION_METRICS = [
  ["eligible_for_30d_retention", "Eligible Orbits"],
  ["retained_30d", "Retained Orbits"],
  ["retention_rate_30d", "Orbit Retention", "%"],
];

const ORBIT_USER_METRICS = [
  ["orbit_users", "Orbit Users"],
  ["orbit_users_active_30d", "Orbit Users Active"],
  ["orbit_user_active_rate_30d", "Orbit User Active Rate", "%"],
  ["non_orbit_users", "Non-Orbit Users"],
  ["non_orbit_users_active_30d", "Non-Orbit Active"],
  ["non_orbit_user_active_rate_30d", "Non-Orbit Active Rate", "%"],
];

function formatTemplate(template) {
  return String(template || "blank")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatValue(value, suffix = "") {
  if (value == null) return `0${suffix}`;
  return `${value}${suffix}`;
}

export default function OrbitGrowthAnalytics() {
  const [data, setData] = useState(null);
  const [adoption, setAdoption] = useState(null);
  const [retention, setRetention] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const [growthResponse, adoptionResponse, retentionResponse] = await Promise.all([
          adminApi.getOrbitGrowth(),
          adminApi.getTemplateAdoption(),
          adminApi.getRetention30d(),
        ]);
        if (active) {
          setData(growthResponse.data);
          setAdoption(adoptionResponse.data);
          setRetention(retentionResponse.data);
        }
      } catch (err) {
        toast.error(formatApiError(err.response?.data?.detail) || "Could not load Orbit growth metrics");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  const global = data?.global || {};
  const templates = useMemo(() => data?.templates || [], [data]);
  const adoptionItems = useMemo(() => adoption?.items || [], [adoption]);
  const retentionUsers = retention?.users || {};
  const retentionOrbits = retention?.orbits || {};
  const retentionTemplates = useMemo(() => retention?.templates || [], [retention]);
  const orbitUserComparison = retention?.orbit_user_comparison || {};
  const assumptions = retention?.assumptions || [];

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>Admin Analytics</p>
          <h1 style={s.title}>Orbit Growth</h1>
          <p style={s.subtitle}>
            Track whether people are creating Orbits, inviting members, and converting invites into active groups.
          </p>
        </div>
      </header>

      {loading ? <section style={s.card}><p style={s.muted}>Loading Orbit growth metrics...</p></section> : null}

      {!loading && data ? (
        <>
          <section style={styles.cardGrid}>
            {GLOBAL_METRICS.map(([key, label, suffix]) => (
              <div key={key} style={s.card}>
                <p style={styles.metricLabel}>{label}</p>
                <strong style={styles.metricValue}>{formatValue(global[key], suffix)}</strong>
              </div>
            ))}
          </section>

          <h2 style={s.sectionTitle}>Template Metrics</h2>
          <section style={{ ...s.card, overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Template</th>
                  <th style={styles.th}>Orbits</th>
                  <th style={styles.th}>Created 30d</th>
                  <th style={styles.th}>Avg Members</th>
                  <th style={styles.th}>Invites Sent</th>
                  <th style={styles.th}>Accepted</th>
                  <th style={styles.th}>Acceptance</th>
                  <th style={styles.th}>2+ Members</th>
                  <th style={styles.th}>3+ Members</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((row) => (
                  <tr key={row.template}>
                    <td style={styles.td}>{formatTemplate(row.template)}</td>
                    <td style={styles.td}>{row.total_orbits}</td>
                    <td style={styles.td}>{row.orbits_created_30d}</td>
                    <td style={styles.td}>{row.average_members_per_orbit}</td>
                    <td style={styles.td}>{row.invites_sent}</td>
                    <td style={styles.td}>{row.invites_accepted}</td>
                    <td style={styles.td}>{row.invite_acceptance_rate}%</td>
                    <td style={styles.td}>{row.orbits_with_2_plus_members}</td>
                    <td style={styles.td}>{row.orbits_with_3_plus_members}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!templates.length ? <p style={s.muted}>No Orbit template data yet.</p> : null}
          </section>

          <h2 style={s.sectionTitle}>Template Adoption</h2>
          <p style={s.subtitle}>
            Template adoption shows which Orbit types are being created and whether they are driving group activity.
          </p>
          <section style={{ ...s.card, overflowX: "auto", marginTop: 14 }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Template</th>
                  <th style={styles.th}>Orbits</th>
                  <th style={styles.th}>Created 7d</th>
                  <th style={styles.th}>Created 30d</th>
                  <th style={styles.th}>Members</th>
                  <th style={styles.th}>Avg Members</th>
                  <th style={styles.th}>2+</th>
                  <th style={styles.th}>3+</th>
                  <th style={styles.th}>Invites</th>
                  <th style={styles.th}>Accepted</th>
                  <th style={styles.th}>Accept %</th>
                  <th style={styles.th}>Events</th>
                  <th style={styles.th}>Readiness</th>
                  <th style={styles.th}>Challenges</th>
                  <th style={styles.th}>Rewards</th>
                  <th style={styles.th}>Activity</th>
                  <th style={styles.th}>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {adoptionItems.map((row) => (
                  <tr key={row.template}>
                    <td style={styles.td}>{row.label || formatTemplate(row.template)}</td>
                    <td style={styles.td}>{row.total_orbits}</td>
                    <td style={styles.td}>{row.orbits_created_7d}</td>
                    <td style={styles.td}>{row.orbits_created_30d}</td>
                    <td style={styles.td}>{row.total_members}</td>
                    <td style={styles.td}>{row.average_members_per_orbit}</td>
                    <td style={styles.td}>{row.orbits_with_2_plus_members}</td>
                    <td style={styles.td}>{row.orbits_with_3_plus_members}</td>
                    <td style={styles.td}>{row.invites_sent}</td>
                    <td style={styles.td}>{row.invites_accepted}</td>
                    <td style={styles.td}>{row.invite_acceptance_rate}%</td>
                    <td style={styles.td}>{row.events_created}</td>
                    <td style={styles.td}>{row.readiness_items_created}</td>
                    <td style={styles.td}>{row.challenges_created}</td>
                    <td style={styles.td}>{row.rewards_created}</td>
                    <td style={styles.td}>{row.activity_count}</td>
                    <td style={styles.td}>
                      {row.last_activity_at
                        ? new Date(row.last_activity_at).toLocaleDateString()
                        : "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!adoptionItems.length ? <p style={s.muted}>No template adoption data yet.</p> : null}
          </section>

          <h2 style={s.sectionTitle}>30-Day Retention</h2>
          <p style={s.subtitle}>
            See whether users and Orbits are coming back after signup or group creation.
          </p>

          <h3 style={styles.subheading}>User Retention</h3>
          <section style={styles.cardGrid}>
            {USER_RETENTION_METRICS.map(([key, label, suffix]) => (
              <div key={key} style={s.card}>
                <p style={styles.metricLabel}>{label}</p>
                <strong style={styles.metricValue}>{formatValue(retentionUsers[key], suffix)}</strong>
              </div>
            ))}
          </section>

          <h3 style={styles.subheading}>Orbit Retention</h3>
          <section style={styles.cardGrid}>
            {ORBIT_RETENTION_METRICS.map(([key, label, suffix]) => (
              <div key={key} style={s.card}>
                <p style={styles.metricLabel}>{label}</p>
                <strong style={styles.metricValue}>{formatValue(retentionOrbits[key], suffix)}</strong>
              </div>
            ))}
          </section>

          <h3 style={styles.subheading}>Orbit Users vs Non-Orbit Users</h3>
          <section style={styles.cardGrid}>
            {ORBIT_USER_METRICS.map(([key, label, suffix]) => (
              <div key={key} style={s.card}>
                <p style={styles.metricLabel}>{label}</p>
                <strong style={styles.metricValue}>{formatValue(orbitUserComparison[key], suffix)}</strong>
              </div>
            ))}
          </section>

          <h3 style={styles.subheading}>Template Retention</h3>
          <section style={{ ...s.card, overflowX: "auto", marginTop: 14 }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Template</th>
                  <th style={styles.th}>Eligible Orbits</th>
                  <th style={styles.th}>Retained Orbits</th>
                  <th style={styles.th}>Retention Rate</th>
                </tr>
              </thead>
              <tbody>
                {retentionTemplates.map((row) => (
                  <tr key={row.template}>
                    <td style={styles.td}>{row.label || formatTemplate(row.template)}</td>
                    <td style={styles.td}>{row.eligible_orbits}</td>
                    <td style={styles.td}>{row.retained_orbits}</td>
                    <td style={styles.td}>{row.retention_rate_30d}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!retentionTemplates.length ? <p style={s.muted}>No retention data yet.</p> : null}
          </section>

          {assumptions.length ? (
            <section style={{ ...s.card, marginTop: 14 }}>
              <p style={styles.metricLabel}>Retention Assumptions</p>
              <ul style={styles.assumptionList}>
                {assumptions.map((item) => (
                  <li key={item} style={s.muted}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const styles = {
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 14,
  },
  metricLabel: {
    margin: 0,
    color: "var(--muted)",
    fontWeight: 800,
    fontSize: 13,
  },
  metricValue: {
    display: "block",
    marginTop: 8,
    color: "var(--text)",
    fontSize: 30,
    lineHeight: 1,
  },
  subheading: {
    margin: "24px 0 12px",
    color: "var(--text)",
    fontSize: 18,
  },
  assumptionList: {
    margin: "10px 0 0",
    paddingLeft: 20,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 860,
  },
  th: {
    padding: "10px 8px",
    textAlign: "left",
    borderBottom: "1px solid var(--border)",
    color: "var(--muted)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  td: {
    padding: "12px 8px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text)",
    fontWeight: 700,
  },
};
