import React, { useMemo, useState } from "react";
import { CheckCircle2, Rocket, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";

const HABIT_CATEGORIES = [
  {
    name: "Health",
    icon: "🌿",
    habits: ["Drink water", "Take vitamins", "Stretch", "Eat vegetables"],
  },
  {
    name: "Fitness",
    icon: "💪",
    habits: ["Walk 10 minutes", "Workout", "Do pushups", "Morning mobility"],
  },
  {
    name: "Productivity",
    icon: "🎯",
    habits: ["Plan tomorrow", "Clear inbox", "Deep work", "Review tasks"],
  },
  {
    name: "Mindset",
    icon: "🧘",
    habits: ["Journal", "Meditate", "Practice gratitude", "Read affirmations"],
  },
  {
    name: "Learning",
    icon: "📚",
    habits: ["Read 10 pages", "Study language", "Practice coding", "Watch lesson"],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { syncAppState } = useAppState();

  const [selectedCategory, setSelectedCategory] = useState(HABIT_CATEGORIES[0]);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);

  const selectedCountText = useMemo(() => {
    if (selectedHabits.length === 1) return "1 habit selected";
    return `${selectedHabits.length} habits selected`;
  }, [selectedHabits.length]);

  function toggleHabit(habitName) {
    setSelectedHabits((prev) =>
      prev.includes(habitName)
        ? prev.filter((item) => item !== habitName)
        : [...prev, habitName]
    );
  }

  async function handleFinish() {
    if (selectedHabits.length === 0) {
      toast.error("Choose at least one habit to get started");
      return;
    }

    setSaving(true);

    try {
      await Promise.all(
        selectedHabits.map((habitName) =>
          api.post("/habits", {
            name: habitName,
            category:
              HABIT_CATEGORIES.find((cat) => cat.habits.includes(habitName))
                ?.name || "Habit",
            frequency: "daily",
            difficulty: "medium",
            custom_coins: 10,
            icon: "sparkles",
          })
        )
      );

      await api.post("/onboarding/complete");

      await syncAppState();

      toast.success("Your orbit is ready!");
      setComplete(true);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to finish onboarding"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    setSaving(true);

    try {
      await api.post("/onboarding/complete");
      await syncAppState();
      navigate("/");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to finish onboarding"
      );
    } finally {
      setSaving(false);
    }
  }

  if (complete) {
    return (
      <div style={styles.completePage}>
        <div style={styles.completeCard}>
          <div style={styles.completeIcon}>
            <Rocket size={42} />
          </div>

          <p style={styles.eyebrow}>Setup complete</p>

          <h1 style={styles.completeTitle}>Your orbit is ready</h1>

          <p style={styles.completeSubtitle}>
            You created {selectedHabits.length} starter{" "}
            {selectedHabits.length === 1 ? "habit" : "habits"}. Start small,
            keep showing up, and let the streaks do their work.
          </p>

          <div style={styles.selectedSummary}>
            {selectedHabits.map((habit) => (
              <span key={habit} style={styles.summaryPill}>
                <CheckCircle2 size={15} />
                {habit}
              </span>
            ))}
          </div>

          <button
            style={styles.finishButton}
            onClick={() => navigate("/")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <p style={styles.eyebrow}>Welcome to OurOrbit</p>
        <h1 style={styles.title}>Let’s build your first habits</h1>
        <p style={styles.subtitle}>
          Pick a category, choose a few starter habits, and OurOrbit will create
          them for you.
        </p>
      </div>

      <div style={styles.layout}>
        <div style={styles.categoryPanel}>
          <h2 style={styles.panelTitle}>Categories</h2>

          <div style={styles.categoryList}>
            {HABIT_CATEGORIES.map((category) => {
              const active = selectedCategory.name === category.name;

              return (
                <button
                  key={category.name}
                  style={{
                    ...styles.categoryButton,
                    ...(active ? styles.categoryButtonActive : {}),
                  }}
                  onClick={() => setSelectedCategory(category)}
                >
                  <span style={styles.categoryIcon}>{category.icon}</span>
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.habitPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>
                {selectedCategory.icon} {selectedCategory.name}
              </h2>
              <p style={styles.panelSubtitle}>Choose habits to add.</p>
            </div>

            <div style={styles.countBadge}>{selectedCountText}</div>
          </div>

          <div style={styles.habitGrid}>
            {selectedCategory.habits.map((habit) => {
              const selected = selectedHabits.includes(habit);

              return (
                <button
                  key={habit}
                  style={{
                    ...styles.habitButton,
                    ...(selected ? styles.habitButtonSelected : {}),
                  }}
                  onClick={() => toggleHabit(habit)}
                >
                  <span>{habit}</span>
                  {selected && <CheckCircle2 size={20} />}
                </button>
              );
            })}
          </div>

          {selectedHabits.length > 0 && (
            <div style={styles.selectedBox}>
              <div style={styles.selectedBoxTitle}>
                <Sparkles size={17} />
                Selected starter habits
              </div>

              <div style={styles.selectedPills}>
                {selectedHabits.map((habit) => (
                  <button
                    key={habit}
                    style={styles.selectedPill}
                    onClick={() => toggleHabit(habit)}
                  >
                    {habit} ×
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={styles.footer}>
            <button
              style={styles.skipButton}
              onClick={handleSkip}
              disabled={saving}
            >
              Skip for now
            </button>

            <button
              style={{
                ...styles.finishButton,
                ...(saving ? styles.buttonDisabled : {}),
              }}
              onClick={handleFinish}
              disabled={saving}
            >
              {saving ? "Creating..." : "Finish Setup"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
  },
  hero: {
    marginBottom: 30,
  },
  eyebrow: {
    margin: "0 0 10px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  title: {
    margin: 0,
    fontSize: 48,
    lineHeight: 1,
    letterSpacing: "-0.06em",
    color: "var(--text)",
    maxWidth: 720,
  },
  subtitle: {
    margin: "14px 0 0",
    color: "var(--muted)",
    fontWeight: 600,
    fontSize: 17,
    lineHeight: 1.6,
    maxWidth: 760,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "280px 1fr",
    gap: 22,
    alignItems: "start",
  },
  categoryPanel: {
    padding: 22,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 30,
    boxShadow: "var(--shadow)",
    position: "sticky",
    top: 24,
  },
  habitPanel: {
    padding: 24,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 30,
    boxShadow: "var(--shadow)",
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 22,
    flexWrap: "wrap",
  },
  panelTitle: {
    margin: 0,
    fontSize: 28,
    letterSpacing: "-0.04em",
    color: "var(--text)",
  },
  panelSubtitle: {
    margin: "7px 0 0",
    color: "var(--muted)",
    fontWeight: 700,
    fontSize: 14,
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginTop: 18,
  },
  categoryButton: {
    padding: "14px 16px",
    border: "1px solid transparent",
    borderRadius: 18,
    background: "rgba(255,255,255,0.55)",
    color: "var(--text)",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  categoryButtonActive: {
    background: "#eef6ef",
    border: "1px solid rgba(79, 143, 91, 0.18)",
    color: "var(--primary-dark)",
  },
  categoryIcon: {
    fontSize: 20,
  },
  countBadge: {
    padding: "8px 13px",
    borderRadius: 999,
    background: "#fff7df",
    color: "var(--primary-dark)",
    border: "1px solid rgba(242, 184, 75, 0.45)",
    fontWeight: 900,
    whiteSpace: "nowrap",
    fontSize: 13,
  },
  habitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: 14,
  },
  habitButton: {
    padding: 18,
    minHeight: 88,
    border: "1px solid rgba(79, 143, 91, 0.08)",
    borderRadius: 22,
    background: "rgba(255,255,255,0.55)",
    color: "var(--text)",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
    lineHeight: 1.4,
    transition: "all 0.15s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  habitButtonSelected: {
    background: "#eef6ef",
    border: "1px solid rgba(79, 143, 91, 0.24)",
    color: "var(--primary-dark)",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.12)",
  },
  selectedBox: {
    marginTop: 24,
    padding: 18,
    borderRadius: 24,
    background: "#fff7df",
    border: "1px solid rgba(242, 184, 75, 0.45)",
  },
  selectedBoxTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--primary-dark)",
    fontWeight: 900,
    marginBottom: 12,
  },
  selectedPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  selectedPill: {
    border: "1px solid rgba(79, 143, 91, 0.18)",
    borderRadius: 999,
    background: "white",
    color: "var(--primary-dark)",
    padding: "8px 11px",
    fontWeight: 900,
    cursor: "pointer",
  },
  footer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 28,
    flexWrap: "wrap",
  },
  skipButton: {
    padding: "13px 18px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
  },
  finishButton: {
    padding: "13px 22px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },
  buttonDisabled: {
    opacity: 0.65,
    cursor: "not-allowed",
  },
  completePage: {
    minHeight: "70vh",
    display: "grid",
    placeItems: "center",
  },
  completeCard: {
    width: "100%",
    maxWidth: 640,
    textAlign: "center",
    padding: 34,
    borderRadius: 34,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
  },
  completeIcon: {
    width: 82,
    height: 82,
    margin: "0 auto 18px",
    borderRadius: 28,
    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    color: "white",
    display: "grid",
    placeItems: "center",
  },
  completeTitle: {
    margin: 0,
    color: "var(--text)",
    fontSize: 44,
    letterSpacing: "-0.06em",
    lineHeight: 1,
  },
  completeSubtitle: {
    margin: "14px auto 22px",
    maxWidth: 520,
    color: "var(--muted)",
    fontWeight: 700,
    lineHeight: 1.55,
  },
  selectedSummary: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  summaryPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 12px",
    borderRadius: 999,
    background: "#eef6ef",
    color: "var(--primary-dark)",
    fontWeight: 900,
  },
};
