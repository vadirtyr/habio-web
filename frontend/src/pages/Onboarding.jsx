import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Compass,
  Home,
  Rocket,
  School,
  Tent,
  Trophy,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { onboardingApi, orbitApi } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";

const GOALS = [
  { id: "family", title: "Family Accountability", template: "family" },
  { id: "scout", title: "Scout Troop", template: "scout_troop" },
  { id: "accountability", title: "Accountability Group", template: "accountability_circle" },
  { id: "fitness", title: "Fitness Goals", template: "fitness_group" },
  { id: "study", title: "Study Group", template: "study_group" },
  { id: "personal", title: "Personal Growth", template: "blank" },
];

const TEMPLATES = [
  {
    id: "family",
    title: "Family",
    icon: Home,
    placeholder: "Williams Family",
    description: "Shared goals, chores, rewards, and family accountability.",
  },
  {
    id: "scout_troop",
    title: "Scout Troop",
    icon: Tent,
    placeholder: "Troop 123",
    description: "Meetings, campouts, service projects, leadership, and troop accountability.",
  },
  {
    id: "accountability_circle",
    title: "Accountability Circle",
    icon: Users,
    placeholder: "Morning Momentum",
    description: "Weekly check-ins, shared goals, and group accountability.",
  },
  {
    id: "fitness_group",
    title: "Fitness Group",
    icon: Trophy,
    placeholder: "Saturday Striders",
    description: "Workouts, step goals, fitness challenges, and team motivation.",
  },
  {
    id: "study_group",
    title: "Study Group",
    icon: School,
    placeholder: "Exam Prep Crew",
    description: "Study sessions, reading goals, exam prep, and group focus.",
  },
  {
    id: "blank",
    title: "Blank Orbit",
    icon: Compass,
    placeholder: "My Orbit",
    description: "Start with an empty Orbit and customize everything yourself.",
    secondary: true,
  },
];

const SUCCESS_ACTIONS = {
  family: ["Invite family members", "Review starter challenges", "Review starter rewards"],
  scout_troop: ["Invite leaders", "Create first event", "Review patrols"],
  accountability_circle: ["Invite members", "Schedule check-in"],
  fitness_group: ["Invite workout partners", "Review challenges"],
  study_group: ["Invite study group", "Schedule study session"],
  blank: ["Invite a member", "Create your first challenge", "Add an event"],
};

const CHECKLIST = [
  "Create or Join an Orbit",
  "Invite a Member",
  "View a Challenge",
  "View an Event",
  "Complete a Task or Habit",
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { syncAppState } = useAppState();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(null);
  const [mode, setMode] = useState(null);
  const [templateId, setTemplateId] = useState("family");
  const [orbitName, setOrbitName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [orbit, setOrbit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [checklist, setChecklist] = useState({
    create_or_join_orbit: false,
  });

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === templateId) || TEMPLATES[0],
    [templateId]
  );

  const progress = Math.round(((step + 1) / 7) * 100);
  const suggestedActions = SUCCESS_ACTIONS[templateId] || SUCCESS_ACTIONS.blank;

  async function markStep(data) {
    try {
      await onboardingApi.completeStep(data);
    } catch (_err) {}
  }

  function selectGoal(item) {
    setGoal(item.id);
    setTemplateId(item.template);
    markStep({ step: "goal_selected", onboarding_goal: item.id });
  }

  function selectTemplate(id) {
    setTemplateId(id);
    markStep({ step: "template_selected" });
  }

  async function completeOnboarding() {
    await onboardingApi.complete();
    await syncAppState();
  }

  async function createOrbit() {
    if (!orbitName.trim()) {
      toast.error("Give your Orbit a name to continue");
      return;
    }

    setSaving(true);

    try {
      const response = await orbitApi.create({
        name: orbitName.trim(),
        template: templateId,
      });
      const created = response.data?.orbit || response.data;

      setOrbit(created);
      setChecklist({ create_or_join_orbit: true });

      await markStep({
        step: "success",
        checklist_item: "create_or_join_orbit",
      });
      await completeOnboarding();

      toast.success("Your Orbit is ready.");
      setStep(5);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to create Orbit"
      );
    } finally {
      setSaving(false);
    }
  }

  async function joinOrbit() {
    if (!inviteCode.trim()) {
      toast.error("Enter an invite code to continue");
      return;
    }

    setSaving(true);

    try {
      const response = await orbitApi.joinByCode(inviteCode.trim());
      const joined = response.data?.orbit || {
        id: response.data?.orbit_id,
        name: "Your Orbit",
      };

      setOrbit(joined);
      setChecklist({ create_or_join_orbit: true });

      await markStep({
        step: "success",
        checklist_item: "create_or_join_orbit",
      });
      await completeOnboarding();

      toast.success("You joined the Orbit.");
      setStep(5);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to join Orbit"
      );
    } finally {
      setSaving(false);
    }
  }

  function goToOrbit() {
    if (orbit?.id) {
      navigate(`/orbits/${orbit.id}`);
      return;
    }

    navigate("/");
  }

  function renderOption({ active, title, description, Icon = Circle, onClick, secondary }) {
    return (
      <button
        key={title}
        type="button"
        style={{
          ...styles.option,
          ...(active ? styles.optionActive : {}),
          ...(secondary ? styles.optionSecondary : {}),
        }}
        onClick={onClick}
      >
        <span style={styles.optionIcon}>
          <Icon size={22} />
        </span>
        <span style={styles.optionCopy}>
          <strong>{title}</strong>
          {description && <span>{description}</span>}
        </span>
        {active && <CheckCircle2 size={22} />}
      </button>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>Welcome to OurOrbit</p>
        <h1 style={styles.title}>Build better habits together</h1>
        <p style={styles.subtitle}>
          Shared goals, real accountability, and a quick path into your first Orbit.
        </p>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </section>

      <section style={styles.card}>
        {step === 0 && (
          <>
            <div style={styles.iconBubble}>
              <Rocket size={32} />
            </div>
            <h2 style={styles.cardTitle}>Welcome to OurOrbit</h2>
            <p style={styles.cardText}>
              Build better habits together through shared goals and accountability.
            </p>
            <button
              style={styles.primaryButton}
              onClick={() => {
                markStep({ step: "welcome" });
                setStep(1);
              }}
            >
              Get Started
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={styles.cardTitle}>What brings you here?</h2>
            <div style={styles.optionGrid}>
              {GOALS.map((item) =>
                renderOption({
                  active: goal === item.id,
                  title: item.title,
                  Icon: Users,
                  onClick: () => selectGoal(item),
                })
              )}
            </div>
            <button
              style={{ ...styles.primaryButton, ...(goal ? {} : styles.disabled) }}
              disabled={!goal}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={styles.cardTitle}>How would you like to get started?</h2>
            <div style={styles.optionGrid}>
              {renderOption({
                active: mode === "join",
                title: "Join an Existing Orbit",
                description: "Use an invite code from your group.",
                Icon: Users,
                onClick: () => setMode("join"),
              })}
              {renderOption({
                active: mode === "create",
                title: "Create a New Orbit",
                description: "Choose a template and invite people after setup.",
                Icon: Rocket,
                onClick: () => setMode("create"),
              })}
            </div>
            <button
              style={{ ...styles.primaryButton, ...(mode ? {} : styles.disabled) }}
              disabled={!mode}
              onClick={() => {
                markStep({ step: "join_or_create_selected" });
                setStep(mode === "join" ? 5 : 3);
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={styles.cardTitle}>Choose Template</h2>
            <p style={styles.cardText}>
              Templates include starter challenges, rewards, events, and readiness checklists.
            </p>
            <div style={styles.optionGrid}>
              {TEMPLATES.map((template) =>
                renderOption({
                  active: templateId === template.id,
                  title: template.title,
                  description: template.description,
                  Icon: template.icon,
                  secondary: template.secondary,
                  onClick: () => selectTemplate(template.id),
                })
              )}
            </div>
            <button style={styles.primaryButton} onClick={() => setStep(4)}>
              Continue
            </button>
          </>
        )}

        {step === 4 && (
          <>
            <h2 style={styles.cardTitle}>
              {templateId === "scout_troop" ? "Troop Name" : "Orbit Name"}
            </h2>
            <p style={styles.cardText}>Starter content will be added automatically.</p>
            <input
              style={styles.input}
              value={orbitName}
              onChange={(event) => setOrbitName(event.target.value)}
              placeholder={selectedTemplate.placeholder}
            />
            <button
              style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }}
              disabled={saving}
              onClick={createOrbit}
            >
              {saving ? "Creating..." : "Create Orbit"}
            </button>
          </>
        )}

        {step === 5 && mode === "join" && !orbit && (
          <>
            <h2 style={styles.cardTitle}>Enter Invite Code</h2>
            <p style={styles.cardText}>Paste the invite code from your existing Orbit.</p>
            <input
              style={styles.input}
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="Invite code"
            />
            <button
              style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }}
              disabled={saving}
              onClick={joinOrbit}
            >
              {saving ? "Joining..." : "Join Orbit"}
            </button>
          </>
        )}

        {step === 5 && orbit && (
          <>
            <div style={styles.iconBubble}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={styles.cardTitle}>Your Orbit is ready.</h2>
            <p style={styles.cardText}>Here are the best next actions to build momentum.</p>
            <div style={styles.list}>
              {suggestedActions.map((action) => (
                <div key={action} style={styles.listRow}>
                  <CheckCircle2 size={18} />
                  <span>{action}</span>
                </div>
              ))}
            </div>
            <button style={styles.primaryButton} onClick={() => setStep(6)}>
              View Getting Started Checklist
            </button>
          </>
        )}

        {step === 6 && (
          <>
            <h2 style={styles.cardTitle}>Getting Started Checklist</h2>
            <p style={styles.cardText}>
              Starter Badge unlocked. Keep going with these first meaningful actions.
            </p>
            <div style={styles.list}>
              {CHECKLIST.map((item, index) => {
                const done = index === 0 && checklist.create_or_join_orbit;
                return (
                  <div key={item} style={styles.listRow}>
                    {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
            <button style={styles.primaryButton} onClick={goToOrbit}>
              Go to My Orbit
            </button>
            <button style={styles.secondaryButton} onClick={() => navigate("/")}>
              Go to Dashboard
            </button>
          </>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    padding: "28px 18px 56px",
  },
  hero: {
    marginBottom: 22,
  },
  eyebrow: {
    margin: 0,
    color: "#5B6BFF",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    margin: "8px 0",
    fontSize: "clamp(34px, 7vw, 58px)",
    lineHeight: 1,
    color: "#1E1E24",
  },
  subtitle: {
    maxWidth: 620,
    color: "#666A73",
    fontSize: 18,
    lineHeight: 1.5,
  },
  progressTrack: {
    height: 10,
    maxWidth: 520,
    overflow: "hidden",
    border: "2px solid #1E1E24",
    borderRadius: 999,
    background: "#FFFFFF",
    boxShadow: "3px 3px 0 #1E1E24",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #5B6BFF, #2FD0C7)",
    transition: "width 180ms ease",
  },
  card: {
    display: "grid",
    gap: 18,
    padding: 24,
    border: "2px solid #1E1E24",
    borderRadius: 24,
    background: "#FFFFFF",
    boxShadow: "6px 6px 0 #1E1E24",
  },
  iconBubble: {
    width: 62,
    height: 62,
    display: "grid",
    placeItems: "center",
    border: "2px solid #1E1E24",
    borderRadius: 18,
    color: "#1E1E24",
    background: "#EAF8FF",
  },
  cardTitle: {
    margin: 0,
    color: "#1E1E24",
    fontSize: 30,
    lineHeight: 1.1,
  },
  cardText: {
    margin: 0,
    color: "#666A73",
    fontSize: 16,
    lineHeight: 1.5,
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minHeight: 86,
    padding: 16,
    border: "2px solid #D7DAE5",
    borderRadius: 18,
    background: "#FFFFFF",
    color: "#1E1E24",
    cursor: "pointer",
    textAlign: "left",
  },
  optionActive: {
    borderColor: "#1E1E24",
    background: "#F2F5FF",
    boxShadow: "4px 4px 0 #1E1E24",
  },
  optionSecondary: {
    opacity: 0.86,
  },
  optionIcon: {
    width: 42,
    height: 42,
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    borderRadius: 14,
    background: "#EEF2FF",
  },
  optionCopy: {
    display: "grid",
    gap: 4,
    flex: 1,
  },
  input: {
    width: "100%",
    minHeight: 54,
    padding: "0 16px",
    border: "2px solid #1E1E24",
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 700,
    boxSizing: "border-box",
  },
  primaryButton: {
    minHeight: 52,
    padding: "0 22px",
    border: "2px solid #1E1E24",
    borderRadius: 999,
    background: "#5B6BFF",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "4px 4px 0 #1E1E24",
  },
  secondaryButton: {
    minHeight: 48,
    padding: "0 22px",
    border: "2px solid #D7DAE5",
    borderRadius: 999,
    background: "#FFFFFF",
    color: "#1E1E24",
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
  },
  disabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  list: {
    display: "grid",
    gap: 10,
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#1E1E24",
    fontWeight: 800,
  },
};
