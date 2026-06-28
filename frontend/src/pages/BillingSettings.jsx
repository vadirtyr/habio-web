import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Lock, RefreshCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { billingApi, formatApiError } from "@/lib/api";

const PLAN_ORDER = ["free", "plus", "family", "group"];

const PLAN_COPY = {
  free: {
    name: "Free",
    price: "$0",
    audience: "For getting started",
    description:
      "Core habit, task, project, reward, and Orbit accountability features.",
    features: [
      "Basic habits, tasks, and projects",
      "Basic Orbits and templates",
      "Rewards, milestones, and verification basics",
      "Wear OS basics",
    ],
  },
  plus: {
    name: "Plus",
    price: "Coming soon",
    audience: "For personal growth",
    description:
      "Advanced AI coaching, predictive insights, premium customization, and deeper personal progress tools.",
    features: [
      "Advanced AI coaching",
      "Predictive insights",
      "Advanced analytics",
      "Premium themes and templates",
    ],
  },
  family: {
    name: "Family",
    price: "Coming soon",
    audience: "For households",
    description:
      "Family-focused dashboards, shared rewards, parent visibility, and family accountability tools.",
    features: [
      "Family dashboard",
      "Shared rewards",
      "Parent visibility",
      "Family accountability tools",
    ],
  },
  group: {
    name: "Group",
    price: "Coming soon",
    audience: "For teams and organizations",
    description:
      "Leader tools, group analytics, exports, and advanced management for troops, teams, and organizations.",
    features: [
      "Leader dashboard",
      "Group analytics",
      "Report exports",
      "Advanced group management",
    ],
  },
};

const FEATURE_GROUPS = [
  {
    title: "Core",
    features: [
      "basic_habits",
      "basic_tasks",
      "basic_projects",
      "basic_orbits",
      "basic_templates",
      "rewards",
      "milestones",
      "verification_basics",
      "wear_os_basics",
    ],
  },
  {
    title: "AI",
    features: [
      "advanced_ai_coach",
      "unlimited_ai_messages",
      "predictive_insights",
      "advanced_analytics",
    ],
  },
  {
    title: "Family",
    features: ["family_dashboard", "shared_rewards", "parent_visibility"],
  },
  {
    title: "Group/Admin",
    features: ["group_admin_tools", "leader_dashboard", "export_reports"],
  },
  {
    title: "Customization",
    features: ["premium_themes", "premium_templates"],
  },
];

const FEATURE_LABELS = {
  advanced_ai_coach: "Advanced AI coach",
  unlimited_ai_messages: "Unlimited AI messages",
  predictive_insights: "Predictive insights",
  advanced_analytics: "Advanced analytics",
  premium_themes: "Premium themes",
  premium_templates: "Premium templates",
  group_admin_tools: "Group admin tools",
  export_reports: "Export reports",
  family_dashboard: "Family dashboard",
  leader_dashboard: "Leader dashboard",
  basic_habits: "Basic habits",
  basic_tasks: "Basic tasks",
  basic_projects: "Basic projects",
  basic_orbits: "Basic Orbits",
  basic_templates: "Basic templates",
  rewards: "Rewards",
  milestones: "Milestones",
  verification_basics: "Verification basics",
  wear_os_basics: "Wear OS basics",
  shared_rewards: "Shared rewards",
  parent_visibility: "Parent visibility",
};

const REQUIRED_PLAN = {
  advanced_ai_coach: "Plus",
  unlimited_ai_messages: "Plus",
  predictive_insights: "Plus",
  advanced_analytics: "Plus",
  premium_themes: "Plus",
  premium_templates: "Plus",
  family_dashboard: "Family",
  shared_rewards: "Family",
  parent_visibility: "Family",
  group_admin_tools: "Group",
  leader_dashboard: "Group",
  export_reports: "Group",
};

export default function BillingSettings() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [billing, setBilling] = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mockBusy, setMockBusy] = useState("");

  const currentPlan = billing?.user?.plan || user?.plan || "free";
  const currentStatus = billing?.user?.subscription_status || "none";
  const flags = billing?.flags || billing?.feature_flags || {};
  const canShowMockControls =
    flags.billing_mock_mode && (user?.is_admin || process.env.NODE_ENV !== "production");

  const loadBilling = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [plansResponse, meResponse, entitlementsResponse] = await Promise.all([
        billingApi.getPlans(),
        billingApi.getMe(),
        billingApi.getEntitlements(),
      ]);

      setPlans(plansResponse.data?.plans || []);
      setBilling(meResponse.data || {});
      setEntitlements(entitlementsResponse.data || {});
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail) || "Unable to load billing.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBilling();
  }, [loadBilling]);

  const mergedPlans = useMemo(() => {
    const byId = new Map((plans || []).map((plan) => [plan.id || plan.key, plan]));

    return PLAN_ORDER.map((planId) => ({
      id: planId,
      ...(byId.get(planId) || {}),
      ...PLAN_COPY[planId],
    }));
  }, [plans]);

  async function handleMockUpgrade(planId) {
    setMockBusy(planId);
    try {
      await billingApi.mockUpgrade({ plan: planId });
      toast.success(`Mock upgraded to ${PLAN_COPY[planId]?.name || planId}`);
      await loadBilling();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setMockBusy("");
    }
  }

  async function handleMockCancel() {
    setMockBusy("cancel");
    try {
      await billingApi.mockCancel();
      toast.success("Mock subscription canceled");
      await loadBilling();
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setMockBusy("");
    }
  }

  function showLockedFeature(featureKey) {
    const label = featureLabel(featureKey);
    const requiredPlan = REQUIRED_PLAN[featureKey] || "a future plan";

    toast.message(`${label} is coming soon`, {
      description: `Your current plan is ${planLabel(currentPlan)}. ${label} is planned for ${requiredPlan}. Existing core features remain available.`,
    });
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <p style={styles.eyebrow}>Subscription</p>
        <h1 style={styles.title}>Plan & Billing</h1>
        <p style={styles.subtitle}>
          Review your current plan, future plan options, and enabled features.
          Payments are not enabled yet.
        </p>
      </header>

      {error ? (
        <section style={styles.stateCard}>
          <h2 style={styles.stateTitle}>Unable to load</h2>
          <p style={styles.muted}>{error}</p>
          <button style={styles.secondaryButton} onClick={loadBilling}>
            <RefreshCcw size={16} /> Retry
          </button>
        </section>
      ) : null}

      {loading ? (
        <section style={styles.stateCard}>
          <h2 style={styles.stateTitle}>Loading plan details</h2>
          <p style={styles.muted}>Checking your subscription and entitlements.</p>
        </section>
      ) : (
        <>
          <section style={styles.summaryCard}>
            <div>
              <p style={styles.label}>Current plan</p>
              <h2 style={styles.summaryTitle}>{planLabel(currentPlan)}</h2>
              <p style={styles.muted}>Status: {statusLabel(currentStatus)}</p>
              {dateLine(billing?.user) ? <p style={styles.muted}>{dateLine(billing.user)}</p> : null}
            </div>
            <span style={styles.badge}>Billing coming soon</span>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Compare plans</h2>
              <p style={styles.sectionText}>Upgrade buttons stay disabled until real billing is ready.</p>
            </div>
            <div style={styles.planGrid}>
              {mergedPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isCurrent={plan.id === currentPlan}
                  canShowMockControls={canShowMockControls}
                  mockBusy={mockBusy}
                  onMockUpgrade={handleMockUpgrade}
                />
              ))}
            </div>
          </section>

          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Enabled features</h2>
              <p style={styles.sectionText}>Premium features are shown as coming soon, not hard-blocked.</p>
            </div>
            <EntitlementGroups
              entitlements={entitlements?.features || entitlements?.entitlements || {}}
              showRawKeys={!!user?.is_admin || process.env.NODE_ENV !== "production"}
              onLockedFeature={showLockedFeature}
            />
          </section>

          {canShowMockControls ? (
            <section style={styles.testingCard}>
              <div>
                <h2 style={styles.sectionTitle}>Testing controls</h2>
                <p style={styles.sectionText}>
                  Mock controls are visible only in billing mock mode for admin/dev testing.
                </p>
              </div>
              <div style={styles.mockActions}>
                {PLAN_ORDER.filter((planId) => planId !== currentPlan).map((planId) => (
                  <button
                    key={planId}
                    style={styles.secondaryButton}
                    disabled={!!mockBusy}
                    onClick={() => handleMockUpgrade(planId)}
                  >
                    {mockBusy === planId ? "Updating..." : `Mock ${planLabel(planId)}`}
                  </button>
                ))}
                {currentPlan !== "free" ? (
                  <button
                    style={styles.warningButton}
                    disabled={!!mockBusy}
                    onClick={handleMockCancel}
                  >
                    {mockBusy === "cancel" ? "Canceling..." : "Mock Cancel"}
                  </button>
                ) : null}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function PlanCard({ plan, isCurrent, canShowMockControls, mockBusy, onMockUpgrade }) {
  const actionLabel = isCurrent
    ? "Current Plan"
    : plan.id === "group"
      ? "Contact Us Later"
      : "Coming Soon";

  return (
    <article style={{ ...styles.planCard, ...(isCurrent ? styles.currentPlanCard : {}) }}>
      <div style={styles.planTopRow}>
        <div>
          <h3 style={styles.planName}>{plan.name}</h3>
          <p style={styles.planAudience}>{plan.audience}</p>
        </div>
        {isCurrent ? <span style={styles.currentBadge}>Current</span> : null}
      </div>
      <p style={styles.planPrice}>{plan.price}</p>
      <p style={styles.planDescription}>{plan.description}</p>
      <ul style={styles.featureList}>
        {(plan.features || []).map((feature) => (
          <li key={feature} style={styles.featureItem}>
            <CheckCircle2 size={16} /> {featureLabel(feature)}
          </li>
        ))}
      </ul>
      <button style={isCurrent ? styles.currentButton : styles.disabledButton} disabled>
        {actionLabel}
      </button>
      {canShowMockControls && !isCurrent ? (
        <button
          style={styles.mockButton}
          disabled={!!mockBusy}
          onClick={() => onMockUpgrade(plan.id)}
        >
          {mockBusy === plan.id ? "Updating..." : `Mock upgrade to ${plan.name}`}
        </button>
      ) : null}
    </article>
  );
}

function EntitlementGroups({ entitlements, showRawKeys, onLockedFeature }) {
  return (
    <div style={styles.entitlementGrid}>
      {FEATURE_GROUPS.map((group) => (
        <article key={group.title} style={styles.entitlementCard}>
          <h3 style={styles.entitlementTitle}>{group.title}</h3>
          <div style={styles.entitlementList}>
            {group.features.map((featureKey) => {
              const enabled = Boolean(entitlements?.[featureKey]);
              return (
                <button
                  key={featureKey}
                  type="button"
                  style={{
                    ...styles.entitlementRow,
                    ...(enabled ? styles.enabledEntitlement : styles.lockedEntitlement),
                  }}
                  onClick={() => {
                    if (!enabled) onLockedFeature(featureKey);
                  }}
                >
                  {enabled ? <ShieldCheck size={16} /> : <Lock size={16} />}
                  <span>{featureLabel(featureKey)}</span>
                  {showRawKeys ? <code style={styles.featureKey}>{featureKey}</code> : null}
                </button>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}

function dateLine(userBilling) {
  if (userBilling?.trial_ends_at) return `Trial ends ${formatDate(userBilling.trial_ends_at)}`;
  if (userBilling?.subscription_expires_at) {
    return `Expires ${formatDate(userBilling.subscription_expires_at)}`;
  }
  return "";
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function planLabel(plan) {
  return PLAN_COPY[plan]?.name || "Free";
}

function statusLabel(status) {
  return String(status || "none")
    .replace(/_/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
}

function featureLabel(featureKey) {
  return FEATURE_LABELS[featureKey] || String(featureKey).replace(/_/g, " ");
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  header: {
    maxWidth: 780,
  },
  eyebrow: {
    margin: "0 0 8px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  title: {
    margin: 0,
    color: "var(--text)",
    fontSize: 46,
    lineHeight: 1,
    letterSpacing: "-0.05em",
  },
  subtitle: {
    margin: "12px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.5,
  },
  summaryCard: {
    display: "flex",
    justifyContent: "space-between",
    gap: 18,
    alignItems: "flex-start",
    flexWrap: "wrap",
    padding: 24,
    borderRadius: 28,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
  label: {
    margin: "0 0 8px",
    color: "var(--muted)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: 12,
  },
  summaryTitle: {
    margin: 0,
    color: "var(--text)",
    fontSize: 28,
    fontWeight: 900,
  },
  muted: {
    margin: "8px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.45,
  },
  badge: {
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
    fontWeight: 900,
    border: "1px solid rgba(79, 143, 91, 0.2)",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "end",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    color: "var(--text)",
    fontSize: 23,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  sectionText: {
    margin: 0,
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.45,
  },
  planGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: 16,
  },
  planCard: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    minHeight: 430,
    padding: 22,
    borderRadius: 26,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
  currentPlanCard: {
    borderColor: "rgba(79, 143, 91, 0.55)",
  },
  planTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  planName: {
    margin: 0,
    color: "var(--text)",
    fontSize: 24,
    fontWeight: 900,
  },
  planAudience: {
    margin: "5px 0 0",
    color: "var(--muted)",
    fontWeight: 800,
  },
  currentBadge: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    whiteSpace: "nowrap",
  },
  planPrice: {
    margin: 0,
    color: "var(--primary-dark)",
    fontSize: 24,
    fontWeight: 900,
  },
  planDescription: {
    margin: 0,
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.45,
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    margin: 0,
    padding: 0,
    listStyle: "none",
    flex: 1,
  },
  featureItem: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    color: "var(--text)",
    fontWeight: 750,
    lineHeight: 1.35,
  },
  currentButton: {
    border: "none",
    borderRadius: 999,
    padding: "12px 14px",
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
  },
  disabledButton: {
    border: "1px solid var(--border)",
    borderRadius: 999,
    padding: "12px 14px",
    background: "rgba(30, 30, 36, 0.06)",
    color: "var(--muted)",
    fontWeight: 900,
  },
  mockButton: {
    border: "1px solid rgba(79, 143, 91, 0.35)",
    borderRadius: 999,
    padding: "10px 12px",
    background: "rgba(79, 143, 91, 0.1)",
    color: "var(--primary-dark)",
    fontWeight: 900,
    cursor: "pointer",
  },
  entitlementGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 16,
  },
  entitlementCard: {
    padding: 18,
    borderRadius: 24,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
  entitlementTitle: {
    margin: "0 0 12px",
    color: "var(--text)",
    fontSize: 18,
    fontWeight: 900,
  },
  entitlementList: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
  },
  entitlementRow: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 9,
    borderRadius: 16,
    padding: "10px 12px",
    border: "1px solid transparent",
    textAlign: "left",
    fontWeight: 850,
  },
  enabledEntitlement: {
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
  },
  lockedEntitlement: {
    background: "rgba(30, 30, 36, 0.04)",
    color: "var(--muted)",
    cursor: "pointer",
  },
  featureKey: {
    marginLeft: "auto",
    fontSize: 11,
    color: "var(--muted)",
  },
  testingCard: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    padding: 22,
    borderRadius: 26,
    background: "rgba(255, 193, 7, 0.12)",
    border: "1px solid rgba(255, 193, 7, 0.38)",
  },
  mockActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  secondaryButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid var(--border)",
    borderRadius: 999,
    padding: "11px 14px",
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
  },
  warningButton: {
    border: "1px solid rgba(217, 83, 79, 0.35)",
    borderRadius: 999,
    padding: "11px 14px",
    background: "rgba(217, 83, 79, 0.12)",
    color: "var(--danger)",
    fontWeight: 900,
    cursor: "pointer",
  },
  stateCard: {
    padding: 24,
    borderRadius: 26,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
  stateTitle: {
    margin: 0,
    color: "var(--text)",
    fontSize: 22,
    fontWeight: 900,
  },
};