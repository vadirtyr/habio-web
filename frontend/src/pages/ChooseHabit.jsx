import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  BookOpen,
  Check,
  Heart,
  Plus,
  Target,
} from "lucide-react";
import { toast } from "sonner";

import { api, formatApiError } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";

const CATEGORIES = [
  {
    key: "health",
    label: "Health",
    Icon: Heart,
    description: "Energy, hydration, sleep, recovery",
    habits: ["Drink water", "Take vitamins", "Stretch for 5 minutes", "Walk for 10 minutes", "Sleep by 10:30 PM"],
  },
  {
    key: "fitness",
    label: "Fitness",
    Icon: Activity,
    description: "Movement and physical momentum",
    habits: ["Do 10 pushups", "Go for a walk", "Complete a workout", "Stretch after waking up", "Track calories"],
  },
  {
    key: "mind",
    label: "Mind",
    Icon: BookOpen,
    description: "Mental clarity and reflection",
    habits: ["Read for 10 minutes", "Journal one sentence", "Meditate for 5 minutes", "Practice gratitude", "No phone for 30 minutes"],
  },
  {
    key: "productivity",
    label: "Focus",
    Icon: Target,
    description: "Execution and forward momentum",
    habits: ["Plan tomorrow", "Clear inbox", "Work on top priority", "Review goals", "Tidy workspace"],
  },
];

export default function ChooseHabit() {
  const navigate = useNavigate();
  const { syncAppState } = useAppState();

  const [categoryKey, setCategoryKey] = useState("health");
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const category = useMemo(
    () => CATEGORIES.find((c) => c.key === categoryKey) || CATEGORIES[0],
    [categoryKey]
  );

  function toggleHabit(name) {
    setSelected((cur) =>
      cur.includes(name) ? cur.filter((h) => h !== name) : [...cur, name]
    );
  }

  async function createHabits() {
    if (selected.length === 0) {
      toast.error("Pick one or more habits to begin building momentum.");
      return;
    }
    setSubmitting(true);
    try {
      await Promise.all(
        selected.map((name) =>
          api.post("/habits", {
            name,
            description: "",
            frequency: "daily",
            difficulty: "easy",
            custom_coins: 5,
            icon: "flame",
            category: category.key,
          })
        )
      );
      await syncAppState();
      toast.success(`Added ${selected.length} habit${selected.length === 1 ? "" : "s"}!`);
      navigate("/habits");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const CategoryIcon = category.Icon;

  return (
    <div style={styles.page} data-testid="choose-habit-page">
      <header style={styles.header}>
        <p style={styles.eyebrow}>Templates</p>
        <h1 style={styles.title}>Build Your Orbit</h1>
        <p style={styles.subtitle}>
          Choose a few habits that feel realistic and sustainable.
        </p>
      </header>

      <div style={styles.hero}>
        <div style={styles.heroIcon}>
          <CategoryIcon size={30} />
        </div>
        <div>
          <h2 style={styles.heroTitle}>{category.label}</h2>
          <p style={styles.heroText}>{category.description}</p>
        </div>
        <span style={styles.heroBadge}>{selected.length} selected</span>
      </div>

      <div style={styles.categoryRow}>
        {CATEGORIES.map((c) => {
          const active = c.key === categoryKey;
          const Icon = c.Icon;
          return (
            <button
              key={c.key}
              style={{ ...styles.categoryChip, ...(active ? styles.categoryChipActive : {}) }}
              onClick={() => setCategoryKey(c.key)}
              data-testid={`category-${c.key}`}
            >
              <Icon size={18} />
              {c.label}
            </button>
          );
        })}
      </div>

      <div style={styles.habitGrid}>
        {category.habits.map((name) => {
          const isSelected = selected.includes(name);
          return (
            <button
              key={name}
              style={{ ...styles.habitButton, ...(isSelected ? styles.habitButtonSelected : {}) }}
              onClick={() => toggleHabit(name)}
              data-testid={`habit-template-${name}`}
            >
              <span style={styles.habitText}>{name}</span>
              {isSelected ? <Check size={20} /> : <Plus size={20} />}
            </button>
          );
        })}
      </div>

      <div style={styles.footer}>
        <button style={styles.skipButton} onClick={() => navigate("/habits")}>
          Skip for now
        </button>
        <button
          style={{ ...styles.primaryButton, ...(submitting || selected.length === 0 ? styles.disabled : {}) }}
          onClick={createHabits}
          disabled={submitting || selected.length === 0}
          data-testid="create-habits-button"
        >
          {submitting
            ? "Building your orbit..."
            : `Start with ${selected.length} habit${selected.length === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: { width: "100%", maxWidth: 880 },
  header: { marginBottom: 22 },
  eyebrow: {
    margin: "0 0 10px",
    color: "var(--primary-dark)",
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontSize: 12,
  },
  title: { margin: 0, fontSize: 44, lineHeight: 1, letterSpacing: "-0.06em", color: "var(--text)" },
  subtitle: { margin: "12px 0 0", color: "var(--muted)", fontWeight: 600, fontSize: 16 },
  hero: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    padding: 22,
    borderRadius: 26,
    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
    color: "white",
    marginBottom: 18,
    flexWrap: "wrap",
  },
  heroIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.18)",
    flex: "0 0 auto",
  },
  heroTitle: { margin: 0, fontSize: 26, letterSpacing: "-0.03em" },
  heroText: { margin: "5px 0 0", fontWeight: 700, opacity: 0.92 },
  heroBadge: {
    marginLeft: "auto",
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.18)",
    fontWeight: 900,
    fontSize: 13,
  },
  categoryRow: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 },
  categoryChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "11px 16px",
    borderRadius: 999,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 800,
    cursor: "pointer",
  },
  categoryChipActive: {
    border: "1px solid rgba(79, 143, 91, 0.4)",
    background: "rgba(79, 143, 91, 0.12)",
    color: "var(--primary-dark)",
  },
  habitGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 12,
    marginBottom: 24,
  },
  habitButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: 18,
    minHeight: 64,
    borderRadius: 20,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 800,
    cursor: "pointer",
    textAlign: "left",
  },
  habitButtonSelected: {
    border: "1px solid rgba(79, 143, 91, 0.45)",
    background: "rgba(79, 143, 91, 0.1)",
    color: "var(--primary-dark)",
  },
  habitText: { fontSize: 15 },
  footer: { display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" },
  skipButton: {
    padding: "13px 20px",
    border: "1px solid var(--border)",
    borderRadius: 999,
    background: "var(--surface)",
    color: "var(--text)",
    fontWeight: 900,
    cursor: "pointer",
  },
  primaryButton: {
    padding: "13px 24px",
    border: "none",
    borderRadius: 999,
    background: "var(--primary)",
    color: "white",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 22px rgba(79, 143, 91, 0.24)",
  },
  disabled: { opacity: 0.6, cursor: "not-allowed" },
};
