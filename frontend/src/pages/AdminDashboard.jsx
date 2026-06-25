import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { adminApi, formatApiError } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

const OVERVIEW_SECTIONS = [
  {
    key: "executive_summary",
    title: "Executive Summary",
    description: "A quick pulse check for product health and group adoption.",
    metrics: [
      ["total_users", "Total Users"],
      ["active_users_30d", "Active Users 30d"],
      ["users_in_orbits_percentage", "Users in Orbits", "%"],
      ["active_orbits_30d", "Active Orbits 30d"],
      ["invite_acceptance_rate", "Invite Acceptance", "%"],
      ["d30_retention", "D30 Retention", "%"],
    ],
  },
  {
    key: "user_metrics",
    title: "User Metrics",
    metrics: [
      ["total_users", "Total Users"],
      ["new_users_today", "New Today"],
      ["new_users_7d", "New 7d"],
      ["new_users_30d", "New 30d"],
      ["active_users_7d", "Active 7d"],
      ["active_users_30d", "Active 30d"],
    ],
  },
  {
    key: "orbit_metrics",
    title: "Orbit Metrics",
    metrics: [
      ["total_orbits", "Total Orbits"],
      ["active_orbits_7d", "Active Orbits 7d"],
      ["active_orbits_30d", "Active Orbits 30d"],
      ["users_in_orbits", "Users in Orbits"],
      ["percent_users_in_orbits", "% Users in Orbits", "%"],
      ["average_orbits_per_user", "Avg Orbits / User"],
    ],
  },
  {
    key: "invite_metrics",
    title: "Invite Metrics",
    metrics: [
      ["invites_sent", "Invites Sent"],
      ["invites_sent_7d", "Invites 7d"],
      ["invites_sent_30d", "Invites 30d"],
      ["invites_accepted", "Invites Accepted"],
      ["invite_acceptance_rate", "Acceptance Rate", "%"],
    ],
  },
  {
    key: "activity_metrics",
    title: "Activity Metrics",
    metrics: [
      ["habits_completed", "Habits Completed"],
      ["weekly_target_habit_completions", "Weekly Target Habit Completions"],
      ["tasks_completed", "Tasks Completed"],
      ["projects_completed", "Projects Completed"],
      ["subtasks_completed", "Subtasks Completed"],
      ["challenges_completed", "Challenges Completed"],
      ["milestones_reached", "Milestones Reached"],
      ["seasons_completed", "Seasons Completed"],
      ["verifications_submitted", "Verifications Submitted"],
      ["verifications_approved", "Verifications Approved"],
    ],
  },
  {
    key: "notification_metrics",
    title: "Notification Metrics",
    metrics: [
      ["push_registrations", "Push Registrations"],
      ["notifications_sent", "Notifications Sent"],
      ["unread_notifications", "Unread Notifications"],
    ],
  },
  {
    key: "orbit_progression_metrics",
    title: "Orbit Progression Metrics",
    metrics: [
      ["total_orbit_xp_earned", "Total Orbit XP"],
      ["average_orbit_level", "Average Orbit Level"],
      ["highest_orbit_level", "Highest Orbit Level"],
      ["milestones_unlocked", "Milestones Unlocked"],
      ["achievements_unlocked", "Achievements Unlocked"],
    ],
  },
  {
    key: "timeline_metrics",
    title: "Timeline Metrics",
    metrics: [
      ["memories_created", "Memories Created"],
      ["pinned_memories", "Pinned Memories"],
    ],
  },
];

const TABS = [
  ["overview", "Overview"],
  ["retention", "Retention"],
  ["funnel", "Adoption Funnel"],
  ["templates", "Templates"],
  ["engagement", "Engagement"],
  ["health", "Orbit Health"],
  ["growth", "Growth"],
  ["timeline", "Timeline"],
  ["ai", "AI"],
];

const DEFAULT_FUNNEL_FILTERS = {
  date_range: "last_30_days",
  template: "all",
  orbit_segment: "all",
  onboarding_segment: "all",
};

const ENGAGEMENT_METRICS = [
  ["habits_completed", "Habits Completed"],
  ["weekly_target_habit_completions", "Weekly Target Habit Completions"],
  ["tasks_completed", "Tasks Completed"],
  ["projects_completed", "Projects Completed"],
  ["subtasks_completed", "Subtasks Completed"],
  ["milestones_reached", "Milestones Reached"],
  ["seasons_completed", "Seasons Completed"],
  ["verifications_submitted", "Verifications Submitted"],
  ["verifications_approved", "Verifications Approved"],
];

function formatValue(value, suffix = "") {
  if (value == null || value === "") return `0${suffix}`;
  if (typeof value === "number" && !Number.isInteger(value)) return `${value.toFixed(2)}${suffix}`;
  return `${value}${suffix}`;
}

function formatTrend(value) {
  if (!value) return "stable";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function MetricCard({ label, value, suffix, note, trend }) {
  return (
    <div style={s.card}>
      <p style={styles.metricLabel}>{label}</p>
      <strong style={styles.metricValue}>{formatValue(value, suffix)}</strong>
      {trend ? <span style={styles.trendPill}>Trend: {formatTrend(trend)}</span> : null}
      {note ? <p style={s.muted}>{note}</p> : null}
    </div>
  );
}

function MetricGrid({ items, source }) {
  return (
    <div style={styles.cardGrid}>
      {items.map(([key, label, suffix]) => (
        <MetricCard key={key} label={label} value={source?.[key]} suffix={suffix} />
      ))}
    </div>
  );
}

function MetricSection({ section, data }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <h2 style={s.sectionTitle}>{section.title}</h2>
        {section.description ? <p style={s.subtitle}>{section.description}</p> : null}
      </div>
      <MetricGrid items={section.metrics} source={data?.[section.key] || {}} />
    </section>
  );
}

function Table({ columns, rows, empty }) {
  return (
    <div style={{ ...s.card, overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={styles.th}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.key || row.id || row.template || row.month || row.label || index}>
              {columns.map((column) => (
                <td key={column.key} style={styles.td}>
                  {column.render ? column.render(row) : formatValue(row[column.key], column.suffix || "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? <p style={s.muted}>{empty || "No data yet."}</p> : null}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [funnelFilters, setFunnelFilters] = useState(DEFAULT_FUNNEL_FILTERS);
  const [funnelData, setFunnelData] = useState(null);
  const [funnelLoading, setFunnelLoading] = useState(false);
  const [funnelError, setFunnelError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const response = await adminApi.getOverview();
        if (active) setData(response.data);
      } catch (err) {
        const message = formatApiError(err.response?.data?.detail) || "Could not load admin dashboard";
        if (active) setError(message);
        toast.error(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "funnel") return undefined;
    let active = true;

    async function loadFunnel() {
      try {
        setFunnelLoading(true);
        setFunnelError("");
        const response = await adminApi.getAdoptionFunnel(funnelFilters);
        if (active) setFunnelData(response.data);
      } catch (err) {
        const message = formatApiError(err.response?.data?.detail) || "Could not load adoption funnel metrics";
        if (active) setFunnelError(message);
        toast.error(message);
      } finally {
        if (active) setFunnelLoading(false);
      }
    }

    loadFunnel();

    return () => {
      active = false;
    };
  }, [activeTab, funnelFilters]);

  const advanced = data?.advanced_analytics || {};
  const templateRows = useMemo(() => data?.template_metrics?.orbits_by_template || [], [data]);
  const assumptions = data?.assumptions || [];

  function renderOverview() {
    return (
      <>
        {OVERVIEW_SECTIONS.map((section) => (
          <MetricSection key={section.key} section={section} data={data} />
        ))}
        <section style={styles.section}>
          <h2 style={s.sectionTitle}>Template Counts</h2>
          <Table
            columns={[{ key: "label", label: "Template" }, { key: "count", label: "Orbits" }]}
            rows={templateRows}
          />
        </section>
      </>
    );
  }

  function renderRetention() {
    const retention = advanced.retention_dashboard || {};
    return (
      <>
        <section style={styles.section}>
          <h2 style={s.sectionTitle}>Retention Dashboard</h2>
          <div style={styles.cardGrid}>
            {(retention.items || []).map((item) => (
              <MetricCard
                key={item.label}
                label={item.label}
                value={item.percentage}
                suffix="%"
                trend={item.trend}
                note={`${item.retained_count || 0} retained of ${item.eligible_count || 0} eligible`}
              />
            ))}
          </div>
        </section>
        <section style={styles.section}>
          <h2 style={s.sectionTitle}>Retention by Template</h2>
          <Table
            columns={[
              { key: "label", label: "Template" },
              { key: "orbits_created", label: "Orbits" },
              { key: "active_orbits", label: "Active 30d" },
              { key: "retention_rate", label: "Retention", suffix: "%" },
            ]}
            rows={retention.by_template || []}
          />
        </section>
        <section style={styles.section}>
          <h2 style={s.sectionTitle}>Retention by Onboarding Completion</h2>
          <Table
            columns={[
              { key: "label", label: "Group" },
              { key: "retained_count", label: "Active 30d" },
              { key: "eligible_count", label: "Eligible" },
              { key: "percentage", label: "Retention", suffix: "%" },
            ]}
            rows={retention.by_onboarding_completion || []}
          />
        </section>
      </>
    );
  }

  function updateFunnelFilter(key, value) {
    setFunnelFilters((current) => ({ ...current, [key]: value }));
  }

  function renderSelect(label, key, options) {
    return (
      <label style={styles.filterLabel}>
        <span>{label}</span>
        <select
          style={styles.select}
          value={funnelFilters[key]}
          onChange={(event) => updateFunnelFilter(key, event.target.value)}
        >
          {(options || []).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    );
  }

  function renderFunnel() {
    const fallbackOptions = {
      date_ranges: [
        { value: "last_7_days", label: "Last 7 days" },
        { value: "last_30_days", label: "Last 30 days" },
        { value: "last_90_days", label: "Last 90 days" },
        { value: "all_time", label: "All time" },
      ],
      templates: [{ value: "all", label: "All templates" }],
      orbit_segments: [
        { value: "all", label: "All users" },
        { value: "orbit_users", label: "Orbit users" },
        { value: "non_orbit_users", label: "Non-Orbit users" },
      ],
      onboarding_segments: [
        { value: "all", label: "All onboarding states" },
        { value: "completed", label: "Completed onboarding" },
        { value: "not_completed", label: "Did not complete onboarding" },
      ],
    };
    const options = funnelData?.filter_options || fallbackOptions;
    const insights = funnelData?.insights || {};
    const funnelAssumptions = funnelData?.assumptions || [];

    return (
      <>
        <section style={styles.section}>
          <h2 style={s.sectionTitle}>Adoption Funnel</h2>
          <p style={s.subtitle}>Measure pilot adoption from signup through meaningful Orbit engagement.</p>
          <div style={{ ...s.card, marginTop: 14 }}>
            <div style={styles.filterGrid}>
              {renderSelect("Signup Window", "date_range", options.date_ranges)}
              {renderSelect("Template", "template", options.templates)}
              {renderSelect("Orbit Segment", "orbit_segment", options.orbit_segments)}
              {renderSelect("Onboarding", "onboarding_segment", options.onboarding_segments)}
            </div>
          </div>
        </section>

        {funnelLoading ? (
          <section style={s.card}><p style={s.muted}>Loading adoption funnel...</p></section>
        ) : null}

        {!funnelLoading && funnelError ? (
          <section style={s.card}><p style={s.muted}>{funnelError}</p></section>
        ) : null}

        {!funnelLoading && funnelData ? (
          <>
            <section style={styles.section}>
              <h2 style={s.sectionTitle}>Pilot Insights</h2>
              <div style={styles.cardGrid}>
                <MetricCard
                  label="Biggest Drop-off"
                  value={insights.biggest_dropoff_stage?.label || "None"}
                  note={`${insights.biggest_dropoff_stage?.prior_dropoff_rate || 0}% drop-off from prior stage`}
                />
                <MetricCard
                  label="Highest Converting Template"
                  value={insights.highest_converting_template?.label || "None"}
                  note={`${insights.highest_converting_template?.activation_rate_7d || 0}% 7-day activation`}
                />
                <MetricCard
                  label="Lowest Converting Template"
                  value={insights.lowest_converting_template?.label || "None"}
                  note={`${insights.lowest_converting_template?.activation_rate_7d || 0}% 7-day activation`}
                />
                <MetricCard
                  label="Best 7-Day Activation"
                  value={insights.best_7_day_activation_template?.label || "None"}
                  note={`${insights.best_7_day_activation_template?.active_after_7_days || 0} active users`}
                />
              </div>
            </section>

            <section style={styles.section}>
              <h2 style={s.sectionTitle}>Funnel Stages</h2>
              <Table
                columns={[
                  { key: "label", label: "Stage" },
                  { key: "count", label: "Users" },
                  { key: "percent_of_registered", label: "% of Registered", suffix: "%" },
                  { key: "prior_conversion_rate", label: "Prior Conversion", suffix: "%" },
                  { key: "prior_dropoff_rate", label: "Prior Drop-off", suffix: "%" },
                ]}
                rows={funnelData.stages || []}
              />
            </section>

            <section style={styles.section}>
              <h2 style={s.sectionTitle}>Template Segments</h2>
              <Table
                columns={[
                  { key: "label", label: "Template" },
                  { key: "registered_users", label: "Users" },
                  { key: "completed_onboarding", label: "Completed Onboarding" },
                  { key: "active_after_7_days", label: "Active 7d" },
                  { key: "activation_rate_7d", label: "7d Activation", suffix: "%" },
                ]}
                rows={funnelData.segments?.templates || []}
              />
            </section>

            {funnelAssumptions.length ? (
              <section style={styles.section}>
                <h2 style={s.sectionTitle}>Funnel Notes</h2>
                <div style={s.card}>
                  <ul style={styles.notesList}>
                    {funnelAssumptions.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </section>
            ) : null}
          </>
        ) : null}
      </>
    );
  }

  function renderTemplates() {
    const templates = advanced.template_analytics || {};
    return (
      <>
        <section style={styles.section}>
          <h2 style={s.sectionTitle}>Template Analytics</h2>
          <div style={styles.cardGrid}>
            <MetricCard label="Most Successful Template" value={templates.most_successful_template?.label || "None"} note={`${templates.most_successful_template?.retention_rate || 0}% retained`} />
            <MetricCard label="Least-Used Template" value={templates.least_used_template?.label || "None"} note={`${templates.least_used_template?.orbits_created || 0} Orbits`} />
          </div>
        </section>
        <section style={styles.section}>
          <Table
            columns={[
              { key: "label", label: "Template" },
              { key: "orbits_created", label: "Orbits Created" },
              { key: "active_orbits", label: "Active Orbits" },
              { key: "average_members", label: "Avg Members" },
              { key: "retention_rate", label: "Retention", suffix: "%" },
            ]}
            rows={templates.items || []}
          />
        </section>
      </>
    );
  }

  function renderEngagement() {
    return (
      <>
        <section style={styles.section}>
          <h2 style={s.sectionTitle}>Last 7 Days</h2>
          <MetricGrid items={ENGAGEMENT_METRICS} source={advanced.orbit_engagement?.last_7_days || {}} />
        </section>
        <section style={styles.section}>
          <h2 style={s.sectionTitle}>Last 30 Days</h2>
          <MetricGrid items={ENGAGEMENT_METRICS} source={advanced.orbit_engagement?.last_30_days || {}} />
        </section>
      </>
    );
  }

  function renderHealth() {
    const health = advanced.orbit_health || {};
    return (
      <section style={styles.section}>
        <h2 style={s.sectionTitle}>Orbit Health Dashboard</h2>
        <div style={styles.cardGrid}>
          <MetricCard label="Average Health Score" value={health.average_health_score} />
          <MetricCard label="Healthiest Orbit" value={health.healthiest_orbit?.orbit_name || "None"} note={`${health.healthiest_orbit?.health_score || 0}/100`} />
          <MetricCard label="Most Active Orbit" value={health.most_active_orbit?.orbit_name || "None"} note={`${health.most_active_orbit?.activity_count_30d || 0} actions in 30d`} />
          <MetricCard label="Highest Orbit Level" value={health.highest_orbit_level?.orbit_name || "None"} note={`Level ${health.highest_orbit_level?.level || 0}`} />
          <MetricCard label="Highest Orbit XP" value={health.highest_orbit_xp?.orbit_name || "None"} note={`${health.highest_orbit_xp?.xp || 0} XP`} />
        </div>
      </section>
    );
  }

  function renderGrowth() {
    return (
      <section style={styles.section}>
        <h2 style={s.sectionTitle}>Growth Dashboard</h2>
        <Table
          columns={[
            { key: "month", label: "Month" },
            { key: "new_users", label: "New Users" },
            { key: "new_orbits", label: "New Orbits" },
            { key: "invite_acceptance_rate", label: "Invite Acceptance", suffix: "%" },
            { key: "users_in_orbits_percentage", label: "Users in Orbits", suffix: "%" },
          ]}
          rows={advanced.growth_dashboard?.monthly || []}
        />
      </section>
    );
  }

  function renderTimeline() {
    const timeline = advanced.memory_timeline || {};
    return (
      <section style={styles.section}>
        <h2 style={s.sectionTitle}>Memory / Timeline Dashboard</h2>
        <div style={styles.cardGrid}>
          <MetricCard label="Memories Created" value={timeline.memories_created} />
          <MetricCard label="Pinned Memories" value={timeline.pinned_memories} />
          <MetricCard label="Most Active Orbit by Memories" value={timeline.most_active_orbit_by_memories?.orbit_name || "None"} note={`${timeline.most_active_orbit_by_memories?.memory_count || 0} memories`} />
          <MetricCard label="Most Common Memory Type" value={timeline.most_common_memory_type?.type || "None"} note={`${timeline.most_common_memory_type?.count || 0} memories`} />
        </div>
      </section>
    );
  }

  function renderAI() {
    const ai = advanced.ai_dashboard || {};
    return (
      <section style={styles.section}>
        <h2 style={s.sectionTitle}>AI Dashboard</h2>
        <div style={styles.cardGrid}>
          <MetricCard label="AI Orbit Coach Usage" value={ai.ai_orbit_coach_usage} />
          <MetricCard label="AI Recap Generation Count" value={ai.recap_generation_count} />
          <MetricCard label="Proof Verification AI Usage" value={ai.proof_verification_usage} />
          <MetricCard label="AI Feature Adoption Rate" value={ai.ai_feature_adoption_rate} suffix="%" />
          <MetricCard label="AI Feature Events" value={ai.ai_feature_events} />
        </div>
      </section>
    );
  }

  function renderActiveTab() {
    switch (activeTab) {
      case "retention": return renderRetention();
      case "funnel": return renderFunnel();
      case "templates": return renderTemplates();
      case "engagement": return renderEngagement();
      case "health": return renderHealth();
      case "growth": return renderGrowth();
      case "timeline": return renderTimeline();
      case "ai": return renderAI();
      default: return renderOverview();
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>Owner / Admin</p>
          <h1 style={s.title}>Admin Dashboard</h1>
          <p style={s.subtitle}>
            Read-only aggregate visibility into OurOrbit growth, engagement, templates, retention, and platform health.
          </p>
        </div>
      </header>

      {loading ? (
        <section style={s.card}>
          <p style={s.muted}>Loading admin metrics...</p>
        </section>
      ) : null}

      {!loading && error ? (
        <section style={s.card}>
          <h2 style={styles.errorTitle}>Admin access required</h2>
          <p style={s.muted}>{error}</p>
        </section>
      ) : null}

      {!loading && data ? (
        <>
          <nav style={styles.tabs} aria-label="Admin analytics dashboards">
            {TABS.map(([key, label]) => (
              <button
                key={key}
                type="button"
                style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }}
                onClick={() => setActiveTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>

          {renderActiveTab()}

          {assumptions.length ? (
            <section style={styles.section}>
              <h2 style={s.sectionTitle}>Metric Notes</h2>
              <div style={s.card}>
                <ul style={styles.notesList}>
                  {assumptions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

const styles = {
  section: { marginTop: 26 },
  sectionHeader: { marginBottom: 12 },
  tabs: { display: "flex", gap: 10, flexWrap: "wrap", margin: "8px 0 24px" },
  tab: {
    border: "1px solid var(--border)",
    borderRadius: 999,
    padding: "10px 14px",
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
  },
  tabActive: {
    background: "var(--primary)",
    color: "white",
    borderColor: "var(--primary)",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 14,
  },
  filterLabel: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    color: "var(--muted)",
    fontWeight: 900,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  select: {
    border: "1px solid var(--border)",
    borderRadius: 14,
    padding: "11px 12px",
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 800,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: 14,
  },
  metricLabel: {
    margin: "0 0 8px",
    color: "var(--muted)",
    fontWeight: 850,
    fontSize: 13,
    lineHeight: 1.35,
  },
  metricValue: {
    display: "block",
    color: "var(--text)",
    fontSize: 30,
    lineHeight: 1.05,
    letterSpacing: "-0.04em",
    overflowWrap: "anywhere",
  },
  trendPill: {
    display: "inline-flex",
    marginTop: 12,
    padding: "5px 9px",
    borderRadius: 999,
    background: "color-mix(in srgb, var(--primary) 12%, transparent)",
    color: "var(--primary-dark)",
    fontWeight: 900,
    fontSize: 12,
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 560 },
  th: {
    textAlign: "left",
    padding: "10px 12px",
    color: "var(--muted)",
    borderBottom: "1px solid var(--border)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid var(--border)",
    color: "var(--text)",
    fontWeight: 750,
  },
  notesList: {
    margin: 0,
    paddingLeft: 20,
    color: "var(--muted)",
    fontWeight: 650,
    lineHeight: 1.6,
  },
  errorTitle: { margin: 0, color: "var(--text)", fontSize: 22 },
};
