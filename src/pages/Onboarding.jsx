import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";
import { toast } from "sonner";

const HABIT_CATEGORIES = [
  {
    name: "Health",
    habits: ["Drink water", "Take vitamins", "Stretch", "Eat vegetables"],
  },
  {
    name: "Fitness",
    habits: ["Walk 10 minutes", "Workout", "Do pushups", "Morning mobility"],
  },
  {
    name: "Productivity",
    habits: ["Plan tomorrow", "Clear inbox", "Deep work", "Review tasks"],
  },
  {
    name: "Mindset",
    habits: ["Journal", "Meditate", "Practice gratitude", "Read affirmations"],
  },
  {
    name: "Learning",
    habits: ["Read 10 pages", "Study language", "Practice coding", "Watch lesson"],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { syncAppState } = useAppState();

  const [selectedCategory, setSelectedCategory] = useState(HABIT_CATEGORIES[0]);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [saving, setSaving] = useState(false);

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
            target: 1,
            reward_coins: 10,
          })
        )
      );

      await syncAppState();

      toast.success("Habits created!");
      navigate("/habits");
    } catch (err) {
      toast.error(
        err.response?.data?.detail || err.message || "Failed to finish onboarding"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1 style={styles.title}>Let’s build your first habits</h1>
        <p style={styles.subtitle}>
          Pick a category, choose a few starter habits, and Habio will create
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
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.habitPanel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.panelTitle}>{selectedCategory.name}</h2>
              <p style={styles.panelSubtitle}>Choose habits to add.</p>
            </div>

            <div style={styles.countBadge}>{selectedHabits.length} selected</div>
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
                  {habit}
                </button>
              );
            })}
          </div>

          <div style={styles.footer}>
            <button style={styles.skipButton} onClick={() => navigate("/")}>
              Skip for now
            </button>

            <button
              style={styles.finishButton}
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
    background: "#f8faf7",
    color: "var(--text)",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s ease",
  },

  categoryButtonActive: {
    background: "#eef6ef",
    border: "1px solid rgba(79, 143, 91, 0.18)",
    color: "var(--primary-dark)",
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
    background: "#f9fbf8",
    color: "var(--text)",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
    lineHeight: 1.4,
    transition: "all 0.15s ease",
  },

  habitButtonSelected: {
    background: "#eef6ef",
    border: "1px solid rgba(79, 143, 91, 0.24)",
    color: "var(--primary-dark)",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.12)",
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
    background: "white",
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
};