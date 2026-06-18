import React, { useCallback, useEffect, useState } from "react";
import { ChevronRight, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

const itemsOf = (data) => Array.isArray(data) ? data : data?.items || [];

export default function Orbits() {
  const navigate = useNavigate();
  const [orbits, setOrbits] = useState([]);
  const [invites, setInvites] = useState([]);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [orbitResponse, inviteResponse] = await Promise.all([orbitApi.list(), orbitApi.listInvites()]);
      setOrbits(itemsOf(orbitResponse.data));
      setInvites(itemsOf(inviteResponse.data));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Unable to load Shared Orbits");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function respond(invite, accept) {
    setBusy(invite.id);
    try {
      const { data } = accept ? await orbitApi.acceptInvite(invite.id) : await orbitApi.declineInvite(invite.id);
      await load();
      toast.success(accept ? "Orbit invite accepted" : "Invite declined");
      if (accept && data?.orbit_id) navigate(`/orbits/${data.orbit_id}`);
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function join(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy("join");
    try {
      const { data } = await orbitApi.joinByCode(code.trim());
      setCode("");
      toast.success("Joined Shared Orbit");
      navigate(`/orbits/${data.orbit_id}`);
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  return <div style={s.page}>
    <header style={s.header}><div><p style={s.eyebrow}>Together</p><h1 style={s.title}>Shared Orbits</h1><p style={s.subtitle}>Build better habits together. Shared goals, real accountability.</p></div><button style={s.button} onClick={() => navigate("/orbits/new")}>Create Orbit</button></header>

    {invites.length > 0 && <><h2 style={s.sectionTitle}>Pending invites</h2><div style={s.cardStack}>{invites.map(invite => <div key={invite.id} style={s.card}><div style={s.row}><div><h3 style={s.name}>{invite.orbit?.name || "Shared Orbit"}</h3><p style={s.muted}>Invited by {invite.inviter?.display_name || invite.inviter?.name || "a member"}</p></div><div style={s.actions}><button style={s.button} disabled={busy === invite.id} onClick={() => respond(invite, true)}>Accept</button><button style={s.secondaryButton} disabled={busy === invite.id} onClick={() => respond(invite, false)}>Decline</button></div></div></div>)}</div></>}

    <form style={{...s.card, marginTop: 26}} onSubmit={join}><h2 style={{...s.name, fontSize: 22}}>Have an invite code?</h2><div style={{display:"flex", gap:10, marginTop:16, flexWrap:"wrap"}}><input style={{...s.input, flex:"1 1 260px"}} value={code} onChange={e => setCode(e.target.value)} placeholder="Enter invite code"/><button style={s.button} disabled={!code.trim() || busy === "join"}>{busy === "join" ? "Joining..." : "Join Orbit"}</button></div></form>

    <h2 style={s.sectionTitle}>Your Orbits</h2>
    {loading ? <p style={s.muted}>Loading Shared Orbits...</p> : orbits.length === 0 ? <div style={{...s.card, ...s.empty}}><Users size={42}/><h3 style={{color:"var(--text)"}}>Create your first Orbit</h3><p>Create an Orbit for your family, troop, fitness group, study group, or accountability circle. Start with a template and customize from there.</p></div> : <div style={s.cardStack}>{orbits.map(orbit => <button key={orbit.id} onClick={() => navigate(`/orbits/${orbit.id}`)} style={{...s.card, ...s.row, width:"100%", textAlign:"left", cursor:"pointer"}}><div><h3 style={s.name}>{orbit.name}</h3><p style={s.muted}>{orbit.member_count} member{orbit.member_count === 1 ? "" : "s"} · {orbit.viewer_role}</p></div><ChevronRight color="var(--muted)"/></button>)}</div>}
  </div>;
}
