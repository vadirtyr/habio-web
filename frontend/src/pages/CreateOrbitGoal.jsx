import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

const TYPES = [["habit_completions", "Habit completions"], ["task_completions", "Task completions"], ["streak_days", "Streak days"], ["xp", "XP"], ["check_in", "Simple check-in"]];

export default function CreateOrbitGoal() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("habit_completions");
  const [amount, setAmount] = useState(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await orbitApi.createGoal(orbitId, { title: title.trim(), description: description.trim(), target_type: type, target_amount: Number(amount), start_date: startDate, end_date: endDate || null });
      toast.success("Group goal created");
      navigate(`/orbits/${orbitId}`);
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  }

  return <div style={s.page}><header style={s.header}><div><p style={s.eyebrow}>Shared Orbits</p><h1 style={s.title}>New group goal</h1><p style={s.subtitle}>Every member can contribute progress.</p></div><button style={s.secondaryButton} onClick={() => navigate(`/orbits/${orbitId}`)}>Back</button></header><form style={{...s.card, ...s.form}} onSubmit={submit}><label style={s.label}>Title</label><input style={s.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Complete 50 habits together"/><label style={s.label}>Description</label><textarea style={{...s.input, minHeight:90}} value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional details"/><label style={s.label}>Goal type</label><div style={s.actions}>{TYPES.map(([value,label]) => <button key={value} type="button" onClick={() => setType(value)} style={{...s.secondaryButton, ...(type === value ? {borderColor:"var(--primary)", background:"color-mix(in srgb, var(--primary) 12%, var(--surface))"} : {})}}>{label}</button>)}</div><label style={s.label}>Target amount</label><input style={s.input} type="number" min="1" value={amount} disabled={type === "check_in"} onChange={e => setAmount(e.target.value)}/><div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16}}><div><label style={s.label}>Start date</label><input style={s.input} type="date" value={startDate} onChange={e => setStartDate(e.target.value)}/></div><div><label style={s.label}>End date (optional)</label><input style={s.input} type="date" value={endDate} onChange={e => setEndDate(e.target.value)}/></div></div><button style={{...s.button, marginTop:22}} disabled={saving || !title.trim() || Number(amount) < 1}>{saving ? "Saving..." : "Create goal"}</button></form></div>;
}
