import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

export default function CreateOrbit() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const { data } = await orbitApi.create({ name: name.trim(), description: description.trim() });
      toast.success("Shared Orbit created");
      navigate(`/orbits/${data.id}`, { replace: true });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setSaving(false); }
  }

  return <div style={s.page}><header style={s.header}><div><p style={s.eyebrow}>Shared Orbits</p><h1 style={s.title}>Create Shared Orbit</h1><p style={s.subtitle}>Private and invite-only, just like the mobile app.</p></div><button style={s.secondaryButton} onClick={() => navigate("/orbits")}>Back</button></header><form style={{...s.card, ...s.form}} onSubmit={submit}><label style={s.label}>Name</label><input style={s.input} maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder="Morning Momentum"/><label style={s.label}>Description</label><textarea style={{...s.input, minHeight:120, resize:"vertical"}} maxLength={500} value={description} onChange={e => setDescription(e.target.value)} placeholder="What will this group work toward?"/><button style={{...s.button, marginTop:22}} disabled={saving || !name.trim()}>{saving ? "Creating..." : "Create Orbit"}</button></form></div>;
}
