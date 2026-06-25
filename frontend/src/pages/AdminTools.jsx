import React, { useEffect, useState } from "react";
import { toast } from "sonner";

import { adminApi, formatApiError } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

const TABS = [
  ["users", "User Lookup"],
  ["orbits", "Orbit Lookup"],
  ["support", "Support Queue"],
  ["moderation", "Moderation"],
  ["flags", "Feature Flags"],
];

function valueOrDash(value) {
  return value == null || value === "" ? "-" : value;
}

function fmtDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function Table({ columns, rows, empty, onRowClick }) {
  return (
    <div style={{ ...s.card, overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>{columns.map((column) => <th key={column.key} style={styles.th}>{column.label}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id || row.key || index}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? styles.clickRow : undefined}
            >
              {columns.map((column) => (
                <td key={column.key} style={styles.td}>{column.render ? column.render(row) : valueOrDash(row[column.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length ? <p style={s.muted}>{empty || "No records found."}</p> : null}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>
      <strong style={styles.fieldValue}>{valueOrDash(value)}</strong>
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return <input style={s.input} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />;
}

function Select({ value, onChange, children }) {
  return <select style={styles.select} value={value} onChange={(event) => onChange(event.target.value)}>{children}</select>;
}

export default function AdminTools() {
  const [activeTab, setActiveTab] = useState("users");
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [orbitQuery, setOrbitQuery] = useState("");
  const [orbitTemplate, setOrbitTemplate] = useState("all");
  const [orbits, setOrbits] = useState([]);
  const [selectedOrbit, setSelectedOrbit] = useState(null);
  const [supportFilters, setSupportFilters] = useState({ status: "all", category: "all", priority: "all" });
  const [tickets, setTickets] = useState([]);
  const [reportFilters, setReportFilters] = useState({ status: "all", target_type: "all" });
  const [reports, setReports] = useState([]);
  const [flags, setFlags] = useState([]);
  const [flagForm, setFlagForm] = useState({ key: "", name: "", description: "", enabled: false, rollout_percentage: 100 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function run(action, fallback) {
    try {
      setLoading(true);
      setError("");
      return await action();
    } catch (err) {
      const message = formatApiError(err.response?.data?.detail) || fallback || "Admin tool request failed";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function searchUsers(query = userQuery) {
    const response = await run(() => adminApi.searchUsers(query), "Could not search users");
    if (response) setUsers(response.data?.items || []);
  }

  async function loadUser(userId) {
    const response = await run(() => adminApi.getUserSummary(userId), "Could not load user summary");
    if (response) setSelectedUser(response.data);
  }

  async function searchOrbits() {
    const response = await run(() => adminApi.searchOrbits({ q: orbitQuery, template: orbitTemplate }), "Could not search Orbits");
    if (response) setOrbits(response.data?.items || []);
  }

  async function loadOrbit(orbitId) {
    const response = await run(() => adminApi.getOrbitSummary(orbitId), "Could not load Orbit summary");
    if (response) setSelectedOrbit(response.data);
  }

  async function loadTickets() {
    const response = await run(() => adminApi.listSupportTickets(supportFilters), "Could not load support tickets");
    if (response) setTickets(response.data?.items || []);
  }

  async function updateTicket(ticket, data) {
    const response = await run(() => adminApi.updateSupportTicket(ticket.id, data), "Could not update ticket");
    if (response) {
      toast.success("Ticket updated");
      loadTickets();
    }
  }

  async function loadReports() {
    const response = await run(() => adminApi.listModerationReports(reportFilters), "Could not load moderation reports");
    if (response) setReports(response.data?.items || []);
  }

  async function updateReport(report, data) {
    const response = await run(() => adminApi.updateModerationReport(report.id, data), "Could not update report");
    if (response) {
      toast.success("Report updated");
      loadReports();
    }
  }

  async function loadFlags() {
    const response = await run(() => adminApi.listFeatureFlags(), "Could not load feature flags");
    if (response) setFlags(response.data?.items || []);
  }

  async function createFlag() {
    const response = await run(() => adminApi.createFeatureFlag(flagForm), "Could not create feature flag");
    if (response) {
      toast.success("Feature flag created");
      setFlagForm({ key: "", name: "", description: "", enabled: false, rollout_percentage: 100 });
      loadFlags();
    }
  }

  async function updateFlag(flag, data) {
    const response = await run(() => adminApi.updateFeatureFlag(flag.key, data), "Could not update feature flag");
    if (response) {
      toast.success("Feature flag updated");
      loadFlags();
    }
  }

  function copy(text, label = "Copied") {
    navigator.clipboard?.writeText(text || "");
    toast.success(label);
  }

  useEffect(() => {
    if (activeTab === "users" && !users.length) searchUsers("");
    if (activeTab === "orbits" && !orbits.length) searchOrbits();
    if (activeTab === "support") loadTickets();
    if (activeTab === "moderation") loadReports();
    if (activeTab === "flags") loadFlags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  function renderUsers() {
    const summary = selectedUser;
    return (
      <>
        <section style={s.card}>
          <h2 style={s.sectionTitle}>User Lookup</h2>
          <div style={styles.searchRow}>
            <TextInput value={userQuery} onChange={setUserQuery} placeholder="Search name, username, email, or user id" />
            <button style={s.button} onClick={() => searchUsers()}>Search</button>
          </div>
        </section>
        <section style={styles.sectionGrid}>
          <Table
            columns={[
              { key: "display_name", label: "Name" },
              { key: "username", label: "Username" },
              { key: "email", label: "Email" },
              { key: "created_at", label: "Created", render: (row) => fmtDate(row.created_at) },
            ]}
            rows={users}
            onRowClick={(row) => loadUser(row.id)}
            empty="No users found."
          />
          {summary ? (
            <div style={s.card}>
              <h3 style={styles.panelTitle}>User Summary</h3>
              <Field label="Display Name" value={summary.user?.display_name} />
              <Field label="Username" value={summary.user?.username} />
              <Field label="Email" value={summary.user?.email} />
              <Field label="Created" value={fmtDate(summary.user?.created_at)} />
              <Field label="Last Active" value={fmtDate(summary.user?.last_active_at)} />
              <Field label="Onboarding" value={summary.user?.onboarding_completed ? "Completed" : "Not completed"} />
              <Field label="Orbit Count" value={summary.orbit_count} />
              <Field label="Habits / Tasks / Projects" value={`${summary.counts?.habits || 0} / ${summary.counts?.tasks || 0} / ${summary.counts?.projects || 0}`} />
              <Field label="Verifications" value={`${summary.counts?.verifications || 0} submitted, ${summary.counts?.verifications_approved || 0} approved`} />
              <Field label="Notifications" value={`${summary.notification_status?.push_registrations || 0} push registrations, ${summary.notification_status?.unread_notifications || 0} unread`} />
              <button style={s.secondaryButton} onClick={() => copy(summary.user?.id, "User id copied")}>Copy user id</button>
              <h4 style={styles.subhead}>Owned Orbits</h4>
              {(summary.owned_orbits || []).map((orbit) => <p key={orbit.id} style={s.muted}>{orbit.name} · {orbit.template}</p>)}
              <h4 style={styles.subhead}>Joined Orbits</h4>
              {(summary.joined_orbits || []).map((orbit) => <p key={orbit.id} style={s.muted}>{orbit.name} · {orbit.template}</p>)}
            </div>
          ) : null}
        </section>
      </>
    );
  }

  function renderOrbits() {
    const summary = selectedOrbit;
    return (
      <>
        <section style={s.card}>
          <h2 style={s.sectionTitle}>Orbit Lookup</h2>
          <div style={styles.searchRow}>
            <TextInput value={orbitQuery} onChange={setOrbitQuery} placeholder="Search Orbit name, id, or owner" />
            <Select value={orbitTemplate} onChange={setOrbitTemplate}>
              {['all','blank','family','scout_troop','couples','accountability_circle','fitness_group','study_group'].map((item) => <option key={item} value={item}>{item === 'all' ? 'All templates' : item}</option>)}
            </Select>
            <button style={s.button} onClick={searchOrbits}>Search</button>
          </div>
        </section>
        <section style={styles.sectionGrid}>
          <Table
            columns={[
              { key: "name", label: "Orbit" },
              { key: "template", label: "Template" },
              { key: "level", label: "Level" },
              { key: "created_at", label: "Created", render: (row) => fmtDate(row.created_at) },
            ]}
            rows={orbits}
            onRowClick={(row) => loadOrbit(row.id)}
            empty="No Orbits found."
          />
          {summary ? (
            <div style={s.card}>
              <h3 style={styles.panelTitle}>Orbit Summary</h3>
              <Field label="Name" value={summary.orbit?.name} />
              <Field label="Template" value={summary.orbit?.template} />
              <Field label="Created" value={fmtDate(summary.orbit?.created_at)} />
              <Field label="Last Active" value={fmtDate(summary.orbit?.last_active_at)} />
              <Field label="Health" value={summary.orbit?.health_score} />
              <Field label="Level / XP" value={`${summary.orbit?.level || 1} / ${summary.orbit?.xp || 0}`} />
              <Field label="Members" value={summary.member_count} />
              <Field label="Projects / Milestones / Seasons" value={`${summary.counts?.active_projects || 0} / ${summary.counts?.milestones || 0} / ${summary.counts?.seasons || 0}`} />
              <Field label="Pending Verifications" value={summary.counts?.verification_pending} />
              <Field label="Invites" value={`${summary.invite_stats?.total || 0} total, ${summary.invite_stats?.accepted || 0} accepted`} />
              <button style={s.secondaryButton} onClick={() => copy(summary.orbit?.id, "Orbit id copied")}>Copy Orbit id</button>
              <h4 style={styles.subhead}>Members</h4>
              {(summary.members || []).slice(0, 12).map((member) => <p key={`${member.user_id}-${member.role}`} style={s.muted}>{member.user?.display_name || member.user_id} · {member.role || 'member'}</p>)}
              <h4 style={styles.subhead}>Recent Activity</h4>
              {(summary.recent_activity || []).map((item) => <p key={`${item.type}-${item.created_at}`} style={s.muted}>{item.type || 'activity'} · {fmtDate(item.created_at)}</p>)}
            </div>
          ) : null}
        </section>
      </>
    );
  }

  function renderSupport() {
    return (
      <>
        <section style={s.card}>
          <h2 style={s.sectionTitle}>Support Queue</h2>
          <p style={s.muted}>Admin-side ticket structure is ready. User-facing support submission is still a follow-up.</p>
          <div style={styles.filterRow}>
            <Select value={supportFilters.status} onChange={(status) => setSupportFilters({ ...supportFilters, status })}>{['all','open','in_progress','resolved','closed'].map((item) => <option key={item} value={item}>{item}</option>)}</Select>
            <Select value={supportFilters.priority} onChange={(priority) => setSupportFilters({ ...supportFilters, priority })}>{['all','low','normal','high','urgent'].map((item) => <option key={item} value={item}>{item}</option>)}</Select>
            <button style={s.button} onClick={loadTickets}>Apply</button>
          </div>
        </section>
        <Table
          columns={[
            { key: "subject", label: "Subject" },
            { key: "category", label: "Category" },
            { key: "priority", label: "Priority" },
            { key: "status", label: "Status" },
            { key: "created_at", label: "Created", render: (row) => fmtDate(row.created_at) },
            { key: "actions", label: "Actions", render: (row) => <TicketActions ticket={row} onUpdate={updateTicket} /> },
          ]}
          rows={tickets}
          empty="No support tickets yet."
        />
      </>
    );
  }

  function renderModeration() {
    return (
      <>
        <section style={s.card}>
          <h2 style={s.sectionTitle}>Moderation</h2>
          <p style={s.muted}>Report review foundation only. No bans, deletions, or punitive actions are included.</p>
          <div style={styles.filterRow}>
            <Select value={reportFilters.status} onChange={(status) => setReportFilters({ ...reportFilters, status })}>{['all','open','reviewed','dismissed','action_taken'].map((item) => <option key={item} value={item}>{item}</option>)}</Select>
            <button style={s.button} onClick={loadReports}>Apply</button>
          </div>
        </section>
        <Table
          columns={[
            { key: "target_type", label: "Target" },
            { key: "reason", label: "Reason" },
            { key: "status", label: "Status" },
            { key: "created_at", label: "Created", render: (row) => fmtDate(row.created_at) },
            { key: "actions", label: "Actions", render: (row) => <ReportActions report={row} onUpdate={updateReport} /> },
          ]}
          rows={reports}
          empty="No moderation reports yet."
        />
      </>
    );
  }

  function renderFlags() {
    return (
      <>
        <section style={s.card}>
          <h2 style={s.sectionTitle}>Feature Flags</h2>
          <div style={styles.flagForm}>
            <TextInput value={flagForm.key} onChange={(key) => setFlagForm({ ...flagForm, key })} placeholder="flag_key" />
            <TextInput value={flagForm.name} onChange={(name) => setFlagForm({ ...flagForm, name })} placeholder="Display name" />
            <TextInput value={flagForm.description} onChange={(description) => setFlagForm({ ...flagForm, description })} placeholder="Description" />
            <TextInput value={String(flagForm.rollout_percentage)} onChange={(rollout_percentage) => setFlagForm({ ...flagForm, rollout_percentage })} placeholder="Rollout %" />
            <label style={styles.checkbox}><input type="checkbox" checked={flagForm.enabled} onChange={(event) => setFlagForm({ ...flagForm, enabled: event.target.checked })} /> Enabled</label>
            <button style={s.button} onClick={createFlag}>Create Flag</button>
          </div>
        </section>
        <Table
          columns={[
            { key: "key", label: "Key" },
            { key: "name", label: "Name" },
            { key: "enabled", label: "Enabled", render: (row) => row.enabled ? 'Yes' : 'No' },
            { key: "rollout_percentage", label: "Rollout", render: (row) => `${row.rollout_percentage ?? 100}%` },
            { key: "description", label: "Description" },
            { key: "actions", label: "Actions", render: (row) => <button style={s.secondaryButton} onClick={() => updateFlag(row, { enabled: !row.enabled })}>{row.enabled ? 'Disable' : 'Enable'}</button> },
          ]}
          rows={flags}
          empty="No feature flags yet."
        />
      </>
    );
  }

  function renderActiveTab() {
    if (activeTab === "orbits") return renderOrbits();
    if (activeTab === "support") return renderSupport();
    if (activeTab === "moderation") return renderModeration();
    if (activeTab === "flags") return renderFlags();
    return renderUsers();
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>Owner / Admin</p>
          <h1 style={s.title}>Admin Tools</h1>
          <p style={s.subtitle}>Safe support and troubleshooting tools. No destructive actions are included in this MVP.</p>
        </div>
      </header>
      <nav style={styles.tabs} aria-label="Admin tools">
        {TABS.map(([key, label]) => <button key={key} style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }} onClick={() => setActiveTab(key)}>{label}</button>)}
      </nav>
      {loading ? <section style={s.card}><p style={s.muted}>Loading...</p></section> : null}
      {error ? <section style={s.card}><p style={s.muted}>{error}</p></section> : null}
      {renderActiveTab()}
    </div>
  );
}

function TicketActions({ ticket, onUpdate }) {
  const [status, setStatus] = useState(ticket.status || "open");
  const [note, setNote] = useState("");
  return (
    <div style={styles.inlineActions}>
      <Select value={status} onChange={setStatus}>{['open','in_progress','resolved','closed'].map((item) => <option key={item} value={item}>{item}</option>)}</Select>
      <input style={styles.smallInput} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Admin note" />
      <button style={s.secondaryButton} onClick={() => onUpdate(ticket, { status, admin_note: note })}>Save</button>
    </div>
  );
}

function ReportActions({ report, onUpdate }) {
  const [status, setStatus] = useState(report.status || "open");
  const [note, setNote] = useState("");
  return (
    <div style={styles.inlineActions}>
      <Select value={status} onChange={setStatus}>{['open','reviewed','dismissed','action_taken'].map((item) => <option key={item} value={item}>{item}</option>)}</Select>
      <input style={styles.smallInput} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Admin note" />
      <button style={s.secondaryButton} onClick={() => onUpdate(report, { status, admin_note: note })}>Save</button>
    </div>
  );
}

const styles = {
  tabs: { display: "flex", gap: 10, flexWrap: "wrap", margin: "8px 0 24px" },
  tab: { border: "1px solid var(--border)", borderRadius: 999, padding: "10px 14px", background: "var(--surface)", color: "var(--text)", fontWeight: 900, cursor: "pointer" },
  tabActive: { background: "var(--primary)", color: "white", borderColor: "var(--primary)" },
  searchRow: { display: "grid", gridTemplateColumns: "minmax(220px, 1fr) auto auto", gap: 12, alignItems: "center" },
  filterRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16 },
  sectionGrid: { display: "grid", gridTemplateColumns: "minmax(0, 1.15fr) minmax(280px, 0.85fr)", gap: 16, marginTop: 16 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 640 },
  th: { textAlign: "left", padding: "10px 12px", color: "var(--muted)", borderBottom: "1px solid var(--border)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" },
  td: { padding: "12px", borderBottom: "1px solid var(--border)", color: "var(--text)", fontWeight: 750, verticalAlign: "top" },
  clickRow: { cursor: "pointer" },
  panelTitle: { margin: "0 0 16px", color: "var(--text)", fontSize: 22 },
  field: { display: "grid", gridTemplateColumns: "130px minmax(0, 1fr)", gap: 10, padding: "8px 0", borderBottom: "1px solid var(--border)" },
  fieldLabel: { color: "var(--muted)", fontWeight: 850 },
  fieldValue: { color: "var(--text)", overflowWrap: "anywhere" },
  subhead: { margin: "18px 0 8px", color: "var(--text)" },
  select: { border: "1px solid var(--border)", borderRadius: 14, padding: "11px 12px", background: "var(--surface)", color: "var(--text)", fontWeight: 800 },
  inlineActions: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" },
  smallInput: { border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", background: "var(--surface)", color: "var(--text)", minWidth: 150 },
  flagForm: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, alignItems: "center" },
  checkbox: { display: "flex", gap: 8, alignItems: "center", color: "var(--text)", fontWeight: 850 },
};
