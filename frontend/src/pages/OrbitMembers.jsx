import React, { useCallback, useEffect, useState } from "react";
import { Plus, Search, UserCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi, socialApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";
import UserAvatar from "@/components/UserAvatar";

export default function OrbitMembers() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [orbit, setOrbit] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(null);
  const [inviteLink, setInviteLink] = useState("");
  const [linkInvites, setLinkInvites] = useState([]);
  const [emailInvites, setEmailInvites] = useState([]);
  const [emailText, setEmailText] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await orbitApi.get(orbitId);
      setOrbit(data);
      if (data.capabilities?.can_manage_invites) {
        const { data: invites } = await orbitApi.listOrbitInvites(orbitId);
        setLinkInvites(invites.link_invites || []);
        setEmailInvites(invites.email_invites || []);
      } else {
        setLinkInvites([]);
        setEmailInvites([]);
      }
    }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
  }, [orbitId]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try { const { data } = await socialApi.searchUsers(text); setResults(Array.isArray(data) ? data : data?.items || []); }
      catch { setResults([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  async function invite(user) {
    setBusy(user.id);
    try { await orbitApi.inviteMember(orbitId, { user_id: user.id }); toast.success(`Invite sent to ${user.display_name || user.name || user.username}`); setQuery(""); setResults([]); await load(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function createInviteLink() {
    setBusy("invite-link");
    try {
      const { data } = await orbitApi.createInviteLink(orbitId);
      const link = `${window.location.origin}/orbit-invite/${data.token}`;
      setInviteLink(link);
      await load();
      await navigator.clipboard?.writeText(link);
      toast.success("Invite link created and copied");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || err.message); }
    finally { setBusy(null); }
  }

  async function sendEmailInvites() {
    const emails = emailText.split(/[\s,;]+/).map(value => value.trim().toLowerCase()).filter(Boolean);
    if (!emails.length) return toast.error("Enter at least one email address");
    setBusy("email-invites");
    try {
      const { data } = await orbitApi.sendEmailInvites(orbitId, emails);
      setEmailText("");
      await load();
      const sentCount = data.items?.length || 0;
      const errors = data.errors || [];
      if (sentCount) toast.success(`${sentCount} email invitation${sentCount === 1 ? "" : "s"} sent`);
      errors.forEach(item => toast.error(`${item.email}: ${item.detail}`));
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || err.message); }
    finally { setBusy(null); }
  }

  async function copyLinkInvite(invite) {
    const link = `${window.location.origin}/orbit-invite/${invite.token}`;
    try { await navigator.clipboard.writeText(link); toast.success("Invite link copied"); }
    catch { toast.error("Copy failed. Select the link and copy it manually."); }
  }

  async function revokeInvite(invite) {
    if (!window.confirm("Revoke this invitation? It will no longer allow someone to join.")) return;
    setBusy(`invite-${invite.id}`);
    try { await orbitApi.deactivateInvite(orbitId, invite.id); if (inviteLink.endsWith(invite.token)) setInviteLink(""); toast.success("Invite link revoked"); await load(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function copyInviteLink() {
    try { await navigator.clipboard.writeText(inviteLink); toast.success("Invite link copied"); }
    catch { toast.error("Copy failed. Select the link and copy it manually."); }
  }

  async function remove(member) {
    const name = member.user?.display_name || member.user?.name || "this member";
    if (!window.confirm(`Remove ${name} from this Orbit?`)) return;
    setBusy(member.user_id);
    try { await orbitApi.removeMember(orbitId, member.user_id); toast.success("Member removed"); await load(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function changeRole(member) {
    const role = member.role === "admin" ? "member" : "admin";
    setBusy(`role-${member.user_id}`);
    try { await orbitApi.updateMemberRole(orbitId, member.user_id, role); toast.success(`Member is now ${role}`); await load(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function transferOwnership(member) {
    const name = member.user?.display_name || member.user?.name || "this member";
    if (!window.confirm(`Transfer ownership to ${name}? You will become an admin and will no longer control owner-only actions.`)) return;
    setBusy(`owner-${member.user_id}`);
    try { await orbitApi.transferOwnership(orbitId, member.user_id); toast.success(`${name} is now the Orbit owner`); await load(); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  if (!orbit) return <p style={s.muted}>Loading members...</p>;
  const canManage = orbit.viewer_role === "owner" || orbit.viewer_role === "admin";
  const isOwner = orbit.viewer_role === "owner";

  return <div style={s.page}><header style={s.header}><div><p style={s.eyebrow}>Shared Orbit</p><h1 style={s.title}>Members</h1><p style={s.subtitle}>{orbit.member_count} people in {orbit.name}</p></div><button style={s.secondaryButton} onClick={() => navigate(`/orbits/${orbitId}`)}>Back</button></header>
    {canManage && <><div style={{...s.card, marginBottom:14}}><h2 style={{...s.name, fontSize:22}}>Invite by email</h2><p style={s.muted}>Send a private, single-use invitation. Separate multiple addresses with commas.</p><input style={{...s.input, marginTop:14}} value={emailText} onChange={event => setEmailText(event.target.value)} placeholder="person@example.com"/><button style={{...s.button, marginTop:14}} disabled={busy === "email-invites"} onClick={sendEmailInvites}>{busy === "email-invites" ? "Sending..." : "Send invitation"}</button></div>{emailInvites.length > 0 && <><h2 style={s.sectionTitle}>Pending email invitations</h2><div style={s.cardStack}>{emailInvites.map(invite => { const link = `${window.location.origin}/orbit-invite/${invite.token}`; return <div key={invite.id} style={s.card}><strong style={{color:"var(--text)"}}>{invite.email}</strong><p style={s.muted}>Expires {new Date(invite.expires_at).toLocaleDateString()}</p><div style={{...s.actions, marginTop:12}}><button style={s.secondaryButton} onClick={() => navigator.clipboard.writeText(link).then(() => toast.success("Invite link copied"))}>Copy link</button><button style={s.dangerButton} disabled={busy === `invite-${invite.id}`} onClick={() => revokeInvite(invite)}>Revoke</button></div></div>; })}</div></>}</>}
    {canManage && <><div style={{...s.card, marginBottom:14}}><h2 style={{...s.name, fontSize:22}}>Invite link</h2><p style={s.muted}>Create a reusable link for someone to join as a member.</p>{inviteLink && <input readOnly value={inviteLink} style={{...s.input, marginTop:14}} onFocus={event => event.target.select()}/>}<div style={{...s.actions, marginTop:14}}><button style={s.button} disabled={busy === "invite-link"} onClick={inviteLink ? copyInviteLink : createInviteLink}>{inviteLink ? "Copy link" : "Create invite link"}</button></div></div>{linkInvites.length > 0 && <><h2 style={s.sectionTitle}>Active invite links</h2><div style={s.cardStack}>{linkInvites.map(invite => { const link = `${window.location.origin}/orbit-invite/${invite.token}`; return <div key={invite.id} style={s.card}><input readOnly value={link} style={s.input} onFocus={event => event.target.select()}/><p style={s.muted}>{invite.uses_count || 0} use{invite.uses_count === 1 ? "" : "s"}{invite.max_uses ? ` of ${invite.max_uses}` : ""}</p><div style={{...s.actions, marginTop:12}}><button style={s.secondaryButton} onClick={() => copyLinkInvite(invite)}>Copy</button><button style={s.dangerButton} disabled={busy === `invite-${invite.id}`} onClick={() => revokeInvite(invite)}>Revoke</button></div></div>; })}</div></>}<div style={{...s.card, marginTop:14}}><h2 style={{...s.name, fontSize:22}}>Invite someone</h2><div style={{display:"flex", alignItems:"center", gap:10, marginTop:16}}><Search size={19} color="var(--muted)"/><input style={{...s.input, border:0, paddingLeft:0}} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by username or name"/></div>{results.length > 0 && <div style={{...s.cardStack, marginTop:12}}>{results.map(user => <button key={user.id} onClick={() => invite(user)} disabled={busy === user.id} style={{...s.row, border:0, borderTop:"1px solid var(--border)", background:"transparent", padding:"13px 0 0", cursor:"pointer", textAlign:"left"}}><div style={{display:"flex", alignItems:"center", gap:12}}><UserAvatar user={user} size={34}/><div><strong style={{color:"var(--text)"}}>{user.display_name || user.name || user.username}</strong><p style={{...s.muted, marginTop:2}}>@{user.username}</p></div></div><Plus color="var(--primary)"/></button>)}</div>}</div></>}
    <h2 style={s.sectionTitle}>Current members</h2><div style={s.cardStack}>{(orbit.members || []).map(member => <div key={member.user_id} style={{...s.card, ...s.row}}><div style={{display:"flex", alignItems:"center", gap:12}}><UserAvatar user={member.user} size={38}/><div><h3 style={{...s.name, fontSize:17}}>{member.user?.display_name || member.user?.name || "Member"}</h3><span style={{...s.badge, display:"inline-block", marginTop:5, textTransform:"capitalize"}}>{member.role}</span></div></div><div style={{display:"flex", gap:8, flexWrap:"wrap", justifyContent:"flex-end"}}>{isOwner && member.role !== "owner" && <button style={s.secondaryButton} disabled={busy === `owner-${member.user_id}`} onClick={() => transferOwnership(member)}>Make owner</button>}{isOwner && member.role !== "owner" && <button style={s.secondaryButton} disabled={busy === `role-${member.user_id}`} onClick={() => changeRole(member)}>{member.role === "admin" ? "Demote" : "Promote"}</button>}{canManage && member.role !== "owner" && (isOwner || member.role === "member") && <button style={s.dangerButton} disabled={busy === member.user_id} onClick={() => remove(member)}>Remove</button>}</div></div>)}</div>
    {canManage && orbit.pending_invites?.length > 0 && <><h2 style={s.sectionTitle}>Pending invites</h2><div style={s.cardStack}>{orbit.pending_invites.map(invite => <div key={invite.id} style={s.card}><p style={{...s.muted, margin:0}}>{invite.email || invite.invitee_id}</p></div>)}</div></>}
  </div>;
}
