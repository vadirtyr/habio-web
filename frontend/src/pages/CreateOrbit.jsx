import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

const TEMPLATES = [
  {
    id: "family",
    name: "Family",
    description: "Shared goals, chores, rewards, and family accountability.",
    nameSuggestion: "Williams Family",
    highlights: ["Starter challenges", "Shared rewards", "Family events"],
  },
  {
    id: "blank",
    name: "Blank Orbit",
    description: "Start with an empty Orbit and customize everything yourself.",
    nameSuggestion: "",
    highlights: ["Private invite-only Orbit", "Add your own habits, tasks, and goals"],
  },
];

export default function CreateOrbit() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(TEMPLATES[0]);
  const [name, setName] = useState(TEMPLATES[0].nameSuggestion);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  function chooseTemplate(template) {
    setSelected(template);
    if (!name.trim() || TEMPLATES.some((item) => item.nameSuggestion === name)) {
      setName(template.nameSuggestion);
    }
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
      toast.success(selected.id === "family" ? "Family Orbit created" : "Blank Orbit created");
      navigate(`/orbits/${data.id}`, { replace: true });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  }

  return <div style={s.page}>
    <header style={s.header}><div><p style={s.eyebrow}>Shared Orbits</p><h1 style={s.title}>Create Shared Orbit</h1><p style={s.subtitle}>Start fresh or use a ready-made structure for your group.</p></div><button style={s.secondaryButton} onClick={() => navigate("/orbits")}>Back</button></header>

    <h2 style={s.sectionTitle}>Choose Template</h2>
    <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:14}}>
      {TEMPLATES.map(template => <button key={template.id} type="button" onClick={() => chooseTemplate(template)} style={{...s.card, textAlign:"left", cursor:"pointer", borderColor:selected.id === template.id ? "var(--primary)" : "var(--border)"}}>
        <div style={{display:"flex", justifyContent:"space-between", gap:12, alignItems:"center"}}>
          <h3 style={s.name}>{template.name}</h3>
          {selected.id === template.id && <span style={s.badge}>Selected</span>}
        </div>
        <p style={s.muted}>{template.description}</p>
        <div style={{...s.actions, marginTop:12}}>
          {template.highlights.map(item => <span key={item} style={s.badge}>{item}</span>)}
        </div>
      </button>)}
    </div>

    {selected.id === "family" && <div style={{...s.card, marginTop:18}}>
      <h2 style={s.name}>Family Orbit starter pack</h2>
      <p style={s.muted}>Creates starter challenges, shared reward ideas, family events, and readiness checklist examples so the Orbit is useful right away.</p>
    </div>}

    <form style={{...s.card, ...s.form, marginTop:18}} onSubmit={submit}>
      <label style={s.label}>Name</label><input style={s.input} maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder={selected.id === "family" ? "Williams Family" : "Morning Momentum"}/>
      {selected.id === "blank" && <><label style={s.label}>Description</label><textarea style={{...s.input, minHeight:120, resize:"vertical"}} maxLength={500} value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this group work toward?"/></>}
      <button style={{...s.button, marginTop:22}} disabled={saving || !name.trim()}>{saving ? "Creating..." : selected.id === "family" ? "Create Family Orbit" : "Create Blank Orbit"}</button>
    </form>
  </div>;
}
