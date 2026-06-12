import React, { useCallback, useEffect, useState } from "react";
import { Target } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

const TYPE_LABELS = { habit_completions: "habit completions", task_completions: "task completions", streak_days: "streak days", xp: "XP", check_in: "check-ins" };

export default function OrbitDetail() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [orbit, setOrbit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try { const { data } = await orbitApi.get(orbitId); setOrbit(data); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setLoading(false); }
  }, [orbitId]);
  useEffect(() => { load(); }, [load]);

  async function contribute(goal) {
    setBusy(goal.id);
    try { await orbitApi.contribute(orbitId, goal.id); await load(); toast.success("Progress added"); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function leaveOrDelete() {
    const owner = orbit.viewer_role === "owner";
    if (!window.confirm(owner ? "Delete this Shared Orbit for every member?" : "Leave this Shared Orbit?")) return;
    try { owner ? await orbitApi.remove(orbitId) : await orbitApi.leave(orbitId); toast.success(owner ? "Orbit deleted" : "Orbit left"); navigate("/orbits", { replace: true }); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  }

  if (loading) return <p style={s.muted}>Loading Orbit...</p>;
  if (!orbit) return <div style={{...s.card, ...s.empty}}>This Shared Orbit is unavailable.</div>;

  return <div style={s.page}><header style={s.header}><div><p style={s.eyebrow}>Shared Orbit</p><h1 style={s.title}>{orbit.name}</h1><p style={s.subtitle}>{orbit.description || "A private Shared Orbit."}</p></div><div style={s.actions}><button style={s.secondaryButton} onClick={() => navigate(`/orbits/${orbitId}/members`)}>Members</button><button style={s.button} onClick={() => navigate(`/orbits/${orbitId}/goals/new`)}>New goal</button></div></header>
    <div style={s.card}><p style={{...s.muted, margin:0, fontSize:12, textTransform:"uppercase", letterSpacing:"0.1em"}}>Invite code</p><strong style={{display:"block", marginTop:7, fontSize:28, letterSpacing:"0.08em", color:"var(--text)"}}>{orbit.invite_code}</strong></div>
    <h2 style={s.sectionTitle}>Group goals</h2>{orbit.goals?.length ? <div style={s.cardStack}>{orbit.goals.map(goal => { const percent = Math.min(100, Math.round(((goal.progress || 0) / goal.target_amount) * 100)); return <div key={goal.id} style={s.card}><div style={s.row}><h3 style={s.name}>{goal.title}</h3><span style={s.badge}>{goal.status}</span></div>{goal.description && <p style={s.muted}>{goal.description}</p>}<div style={s.progressTrack}><div style={{height:"100%", width:`${percent}%`, background:"var(--primary)", borderRadius:999}}/></div><div style={{...s.row, marginTop:10}}><p style={{...s.muted, margin:0}}>{goal.progress || 0} / {goal.target_amount} {TYPE_LABELS[goal.target_type] || goal.target_type}</p>{goal.status !== "completed" && <button style={s.secondaryButton} disabled={busy === goal.id} onClick={() => contribute(goal)}>{busy === goal.id ? "Adding..." : goal.target_type === "check_in" ? "Check in" : "Add 1"}</button>}</div></div>; })}</div> : <div style={{...s.card, ...s.empty}}><Target size={40}/><h3 style={{color:"var(--text)"}}>No group goals</h3><p>Create the first shared target for this Orbit.</p></div>}
    <h2 style={s.sectionTitle}>Group activity</h2>{orbit.activity?.length ? <div style={s.cardStack}>{orbit.activity.map(item => <div key={item.id} style={s.card}><p style={{margin:0, color:"var(--text)", fontWeight:700}}>{item.message}</p><p style={s.muted}>{new Date(item.created_at).toLocaleString()}</p></div>)}</div> : <p style={s.muted}>Activity will appear as members build momentum.</p>}
    <button style={{...s.dangerButton, marginTop:34}} onClick={leaveOrDelete}>{orbit.viewer_role === "owner" ? "Delete Orbit" : "Leave Orbit"}</button>
  </div>;
}
