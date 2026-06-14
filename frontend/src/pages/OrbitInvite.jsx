import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Orbit } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

export default function OrbitInvite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    orbitApi.previewInviteLink(token)
      .then(({ data }) => setPreview(data))
      .catch(err => setError(formatApiError(err.response?.data?.detail) || "This invite is unavailable."));
  }, [token]);

  async function join() {
    setJoining(true);
    try {
      const { data } = await orbitApi.acceptInviteLink(token);
      toast.success(data.already_member ? "You are already a member" : "Welcome to the Orbit");
      navigate(`/orbits/${data.orbit_id}`, { replace: true });
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setJoining(false); }
  }

  const returnTo = `/orbit-invite/${token}`;
  return <div style={styles.page}><div style={styles.card}>
    <div style={styles.icon}><Orbit size={42}/></div>
    <p style={s.eyebrow}>Shared Orbit invitation</p>
    {error && <><h1 style={styles.title}>Invite unavailable</h1><p style={s.muted}>{error}</p></>}
    {!error && !preview && <p style={s.muted}>Loading invitation...</p>}
    {preview && <>
      <h1 style={styles.title}>{preview.orbit.name}</h1>
      <p style={styles.copy}>{preview.orbit.description || "Join this private Shared Orbit and build momentum together."}</p>
      <span style={s.badge}>{preview.orbit.member_count} member{preview.orbit.member_count === 1 ? "" : "s"}</span>
      {!loading && user ? <button style={{...s.button, marginTop:24}} disabled={joining} onClick={join}>{joining ? "Joining..." : "Join Orbit"}</button> : null}
      {!loading && !user ? <div style={{...s.actions, marginTop:24, justifyContent:"center"}}>
        <Link style={{...s.button, textDecoration:"none"}} to={`/login?returnTo=${encodeURIComponent(returnTo)}`}>Log in to join</Link>
        <Link style={{...s.secondaryButton, textDecoration:"none"}} to={`/register?returnTo=${encodeURIComponent(returnTo)}`}>Create account</Link>
      </div> : null}
    </>}
  </div></div>;
}

const styles = {
  page: { minHeight:"100vh", display:"grid", placeItems:"center", padding:24, background:"var(--background)" },
  card: { ...s.card, width:"100%", maxWidth:560, textAlign:"center", padding:36 },
  icon: { width:76, height:76, borderRadius:28, display:"grid", placeItems:"center", margin:"0 auto 20px", color:"var(--primary)", background:"color-mix(in srgb, var(--primary) 12%, var(--surface))" },
  title: { ...s.title, fontSize:38 }, copy: { ...s.muted, margin:"16px 0" },
};
