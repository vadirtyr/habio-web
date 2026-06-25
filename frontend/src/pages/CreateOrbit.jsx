import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

const TEMPLATES = [
  {
    id: "family",
    icon: "👨‍👩‍👧‍👦",
    name: "Family",
    description: "Shared goals, chores, rewards, and family accountability.",
    nameSuggestion: "Williams Family",
    highlights: ["Starter challenges", "Shared rewards", "Family events"],
  },
  {
    id: "scout_troop",
    icon: "🏕",
    name: "Scout Troop",
    description: "Meetings, campouts, service projects, leadership, and troop accountability.",
    nameSuggestion: "Troop 123",
    highlights: ["Camp readiness", "Service projects", "Troop challenges"],
  },
  {
    id: "accountability_circle",
    icon: "🎯",
    name: "Accountability Circle",
    description: "Weekly check-ins, shared goals, and group accountability.",
    nameSuggestion: "Weekly Accountability Circle",
    highlights: ["Weekly check-ins", "Shared goals", "Consistency challenges"],
  },
  {
    id: "fitness_group",
    icon: "🏃",
    name: "Fitness Group",
    description: "Workouts, step goals, fitness challenges, and team motivation.",
    nameSuggestion: "Morning Fitness Group",
    highlights: ["Workout challenges", "Step goals", "Team motivation"],
  },
  {
    id: "study_group",
    icon: "📚",
    name: "Study Group",
    description: "Study sessions, reading goals, exam prep, and group focus.",
    nameSuggestion: "Exam Prep Study Group",
    highlights: ["Study sessions", "Reading goals", "Exam prep"],
  },
  {
    id: "couples",
    icon: "💕",
    name: "Couples",
    description: "Strengthen your relationship with shared goals, date nights, gratitude, and milestones.",
    nameSuggestion: "Our Shared Orbit",
    highlights: ["Date nights", "Daily gratitude", "Shared milestones"],
  },
  {
    id: "blank",
    icon: "✨",
    name: "Blank Orbit",
    description: "Start with an empty Orbit and customize everything yourself.",
    nameSuggestion: "My Orbit",
    highlights: ["Private invite-only Orbit", "Add your own habits, tasks, and goals"],
  },
];

const BLANK_TEMPLATE_ID = "blank";
const STARTER_TEMPLATE_COUNT = TEMPLATES.filter(template => template.id !== BLANK_TEMPLATE_ID).length;

export default function CreateOrbit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTemplate = TEMPLATES.find((template) => template.id === searchParams.get("template")) || TEMPLATES[0];
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(initialTemplate);
  const [name, setName] = useState(initialTemplate.nameSuggestion);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const isFamily = selected.id === "family";
  const isScoutTroop = selected.id === "scout_troop";
  const isAccountabilityCircle = selected.id === "accountability_circle";
  const isFitnessGroup = selected.id === "fitness_group";
  const isStudyGroup = selected.id === "study_group";
  const isCouples = selected.id === "couples";
  const createLabel = saving
    ? "Creating..."
    : isFamily
      ? "Create Family Orbit"
      : isScoutTroop
        ? "Create Scout Troop"
        : isAccountabilityCircle
          ? "Create Accountability Circle"
          : isFitnessGroup
            ? "Create Fitness Group"
            : isStudyGroup
              ? "Create Study Group"
              : isCouples
                ? "Create Couples Orbit"
                : "Create Blank Orbit";
  const namePlaceholder = isFamily
    ? "Williams Family"
    : isScoutTroop
      ? "Troop 123"
      : isAccountabilityCircle
        ? "Weekly Accountability Circle"
        : isFitnessGroup
          ? "Morning Fitness Group"
          : isStudyGroup
            ? "Exam Prep Study Group"
            : isCouples
              ? "Our Shared Orbit"
              : "My Orbit";
  const progressText = `Step ${step + 1} of 3`;
  const nextLabel = selected.id === BLANK_TEMPLATE_ID ? "Continue with Blank Orbit" : `Continue with ${selected.name}`;

  function chooseTemplate(template) {
    setSelected(template);
    if (!name.trim() || TEMPLATES.some((item) => item.nameSuggestion === name)) {
      setName(template.nameSuggestion);
    }
  }

  function goToNameStep() {
    if (!name.trim()) setName(selected.nameSuggestion);
    setStep(1);
  }

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { data } = await orbitApi.create({
        name: name.trim(),
        description: selected.id === "blank" ? description.trim() : "",
        template: selected.id,
      });
      toast.success(isFamily ? "Family Orbit created" : isScoutTroop ? "Scout Troop created" : isAccountabilityCircle ? "Accountability Circle created" : isFitnessGroup ? "Fitness Group created" : isStudyGroup ? "Study Group created" : isCouples ? "Couples Orbit created" : "Blank Orbit created");
      navigate(`/orbits/${data.id}`, { replace: true });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  }

  return <div style={s.page}>
    <header style={s.header}><div><p style={s.eyebrow}>Shared Orbits</p><h1 style={s.title}>Create an Orbit</h1><p style={s.subtitle}>Build better habits together with templates for families, troops, fitness groups, study groups, and accountability circles.</p></div><button style={s.secondaryButton} onClick={() => navigate("/orbits")}>Back</button></header>

    <p style={s.eyebrow}>{progressText}</p>

    {step === 0 && <>
      <h2 style={s.sectionTitle}>Choose Template</h2>
      <p style={s.muted}>Choose a template to start with recommended challenges, rewards, events, and readiness checklists.</p>
      <p style={styles.templateCount}>{STARTER_TEMPLATE_COUNT} recommended templates, plus a blank custom Orbit.</p>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:14, marginTop:18}}>
        {TEMPLATES.map(template => {
          const isBlank = template.id === BLANK_TEMPLATE_ID;
          const isSelected = selected.id === template.id;
          return <button key={template.id} type="button" onClick={() => chooseTemplate(template)} style={{...s.card, textAlign:"left", cursor:"pointer", borderColor:isSelected ? "var(--primary)" : "var(--border)", background:isSelected ? "color-mix(in srgb, var(--primary) 8%, var(--card))" : "var(--card)", opacity:isBlank ? 0.92 : 1}}>
          <div style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"center"}}>
            <h3 style={{...s.name, display:"flex", alignItems:"center", gap:10}}><span>{template.icon}</span><span>{template.name}{isBlank && <small style={styles.customOption}>Custom option</small>}</span></h3>
            {isSelected && <span style={s.badge}>Selected</span>}
          </div>
          <p style={s.muted}>{template.description}</p>
          {isBlank ? <p style={s.muted}>Start empty if you already know exactly what your group needs.</p> : <p style={{...s.muted, color:"var(--primary)"}}>Recommended starter content will be added automatically. You can customize everything later.</p>}
          <div style={{...s.actions, marginTop:12}}>
            {template.highlights.map(item => <span key={item} style={s.badge}>{item}</span>)}
          </div>
        </button>;
        })}
      </div>
      <div style={{...s.actions, marginTop:18}}>
        <button type="button" style={s.button} onClick={goToNameStep}>{nextLabel}</button>
      </div>
    </>}

    {step === 1 && <form style={{...s.card, ...s.form, marginTop:18}} onSubmit={(event) => { event.preventDefault(); if (name.trim()) setStep(2); }}>
      <h2 style={s.sectionTitle}>Name Your Orbit</h2>
      <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
        <div style={{fontSize:32}}>{selected.icon}</div>
        <div>
          <h3 style={s.name}>{selected.name}</h3>
          <p style={s.muted}>{selected.description}</p>
          {selected.id !== "blank" && <p style={{...s.muted, color:"var(--primary)"}}>Starter content will be added automatically without overwhelming your group. You can edit or delete it later.</p>}
        </div>
      </div>
      <label style={s.label}>Name</label><input style={s.input} maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder={namePlaceholder}/>
      {selected.id === "blank" && <><label style={s.label}>Description</label><textarea style={{...s.input, minHeight:120, resize:"vertical"}} maxLength={500} value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this group work toward?"/></>}
      <div style={{...s.actions, marginTop:22}}>
        <button type="button" style={s.secondaryButton} onClick={() => setStep(0)}>Back</button>
        <button style={s.button} disabled={!name.trim()}>Next</button>
      </div>
    </form>}

    {step === 2 && <form style={{...s.card, ...s.form, marginTop:18}} onSubmit={submit}>
      <h2 style={s.sectionTitle}>Create Orbit</h2>
      <div style={{display:"flex", gap:14, alignItems:"flex-start"}}>
        <div style={{fontSize:32}}>{selected.icon}</div>
        <div>
          <h3 style={s.name}>{name.trim()}</h3>
          <p style={s.muted}>{selected.name}</p>
          {selected.id !== "blank" && <p style={{...s.muted, color:"var(--primary)"}}>Starter content will be added automatically. Customize from there as your group finds its rhythm.</p>}
          {selected.id === "blank" && description.trim() && <p style={s.muted}>{description.trim()}</p>}
        </div>
      </div>
      <div style={{...s.actions, marginTop:22}}>
        <button type="button" style={s.secondaryButton} onClick={() => setStep(1)} disabled={saving}>Back</button>
        <button style={s.button} disabled={saving || !name.trim()}>{createLabel}</button>
      </div>
    </form>}
  </div>;
}

const styles = {
  templateCount: { ...s.muted, marginTop: 8 },
  customOption: { display: "block", marginTop: 4, color: "var(--muted)", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" },
};
