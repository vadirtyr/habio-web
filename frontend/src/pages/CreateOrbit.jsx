import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

export default function CreateOrbit() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("manual");
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    orbitApi.listTemplates()
      .then(({ data }) => setTemplates(data.items || []))
      .catch((err) => toast.error(formatApiError(err.response?.data?.detail) || "Unable to load templates"));
  }, []);

  function chooseTemplate(template) {
    setMode("template");
    setSelected(template);
    setName(template.name_suggestion);
  }

  async function submit(e) {
    e.preventDefault();
    if (!name.trim() || (mode === "template" && !selected)) return;
    setSaving(true);
    try {
      const { data } = mode === "template"
        ? await orbitApi.createFromTemplate({ template_id: selected.id, name: name.trim() })
        : await orbitApi.create({ name: name.trim(), description: description.trim() });
      toast.success(mode === "template" ? "Orbit created from template" : "Shared Orbit created");
      navigate(`/orbits/${data.id}`, { replace: true });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  }

  return <div style={s.page}>
    <header style={s.header}><div><p style={s.eyebrow}>Shared Orbits</p><h1 style={s.title}>Create Shared Orbit</h1><p style={s.subtitle}>Start fresh or use a ready-made structure for your group.</p></div><button style={s.secondaryButton} onClick={() => navigate("/orbits")}>Back</button></header>

    <div style={{...s.actions, marginBottom:20}}>
      <button type="button" style={mode === "manual" ? s.button : s.secondaryButton} onClick={() => { setMode("manual"); setSelected(null); }}>Create manually</button>
      <button type="button" style={mode === "template" ? s.button : s.secondaryButton} onClick={() => setMode("template")}>Start from template</button>
    </div>

    {mode === "template" && <>
      <h2 style={s.sectionTitle}>Choose a template</h2>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:14}}>
        {templates.map(template => <button key={template.id} type="button" onClick={() => chooseTemplate(template)} style={{...s.card, textAlign:"left", cursor:"pointer", borderColor:selected?.id === template.id ? "var(--primary)" : "var(--border)"}}>
          <h3 style={s.name}>{template.name}</h3><p style={s.muted}>{template.description}</p>
        </button>)}
      </div>
    </>}

    {selected && <div style={{...s.card, marginTop:18}}>
      <h2 style={s.name}>Template preview</h2>
      <p style={s.muted}><strong>Shared habits:</strong> {selected.habits.join(", ")}</p>
      <p style={s.muted}><strong>Shared tasks:</strong> {selected.tasks.join(", ")}</p>
      {selected.challenge && <p style={s.muted}><strong>Starter challenge:</strong> {selected.challenge.title}</p>}
      {selected.recommended_rewards?.length > 0 && <p style={s.muted}><strong>Reward ideas:</strong> {selected.recommended_rewards.join(", ")}</p>}
    </div>}

    <form style={{...s.card, ...s.form, marginTop:18}} onSubmit={submit}>
      <label style={s.label}>Name</label><input style={s.input} maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Morning Momentum"/>
      {mode === "manual" && <><label style={s.label}>Description</label><textarea style={{...s.input, minHeight:120, resize:"vertical"}} maxLength={500} value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this group work toward?"/></>}
      <button style={{...s.button, marginTop:22}} disabled={saving || !name.trim() || (mode === "template" && !selected)}>{saving ? "Creating..." : mode === "template" ? "Create from template" : "Create Orbit"}</button>
    </form>
  </div>;
}
