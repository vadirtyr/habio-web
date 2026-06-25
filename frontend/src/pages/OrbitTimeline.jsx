import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";
function monthKey(value) { try { return new Date(value).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); } catch { return 'Earlier'; } }
function dateLabel(value) { try { return new Date(value).toLocaleDateString(); } catch { return ''; } }
export default function OrbitTimeline() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [payload, setPayload] = useState(null);
  const [orbit, setOrbit] = useState(null);
  const [busy, setBusy] = useState(null);
  const [loading, setLoading] = useState(true);
  const canManage = orbit?.viewer_role === 'owner' || orbit?.viewer_role === 'admin';
  const load = useCallback(async () => { try { const [{ data: memories }, { data: dashboard }] = await Promise.all([orbitApi.getMemories(orbitId), orbitApi.getDashboard(orbitId)]); setPayload(memories); setOrbit(dashboard.orbit); } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || 'Unable to load timeline'); } finally { setLoading(false); } }, [orbitId]);
  useEffect(() => { load(); }, [load]);
  const items = useMemo(() => payload?.items || [], [payload]);
  const featured = payload?.featured || items.filter((item) => item.pinned);
  const groups = useMemo(() => { const map = new Map(); items.forEach((item) => { const key = monthKey(item.created_at); if (!map.has(key)) map.set(key, []); map.get(key).push(item); }); return Array.from(map.entries()); }, [items]);
  async function toggle(memory) { setBusy(memory.id); try { memory.pinned ? await orbitApi.unpinMemory(orbitId, memory.id) : await orbitApi.pinMemory(orbitId, memory.id); await load(); } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || 'Could not update memory'); } finally { setBusy(null); } }
  if (loading) return <p style={s.muted}>Loading timeline...</p>;
  return <div style={s.page}><header style={s.header}><div><p style={s.eyebrow}>Orbit Timeline</p><h1 style={s.title}>{orbit?.name || 'Timeline'}</h1><p style={s.subtitle}>Meaningful accomplishments and memories, separate from the live activity feed.</p></div><button style={s.secondaryButton} onClick={() => navigate('/orbits/' + orbitId)}>Back to Orbit</button></header>{!items.length ? <section style={{ ...s.card, ...s.empty }}>No memories yet. Milestones, events, completed projects, seasons, and new members will appear here.</section> : <>{!!featured.length && <><h2 style={s.sectionTitle}>Featured Memories</h2><div style={s.cardStack}>{featured.map((memory) => <Memory key={memory.id} memory={memory} canManage={canManage} busy={busy} onToggle={toggle} featured />)}</div></>}<h2 style={s.sectionTitle}>History</h2>{groups.map(([label, memories]) => <section key={label}><p style={s.eyebrow}>{label}</p><div style={s.cardStack}>{memories.map((memory) => <Memory key={memory.id} memory={memory} canManage={canManage} busy={busy} onToggle={toggle} />)}</div></section>)}</>}</div>;
}
function Memory({ memory, canManage, busy, onToggle, featured }) { return <article style={{ ...s.card, borderColor: featured ? 'var(--primary)' : 'var(--border)' }}><div style={s.row}><div><p style={s.eyebrow}>{memory.type?.replaceAll('_', ' ')} - {memory.importance || 'normal'}</p><h3 style={s.name}>{memory.title}</h3><p style={s.muted}>{memory.description}</p><p style={s.muted}>{dateLabel(memory.created_at)} {memory.pinned ? '- Pinned' : ''}</p></div>{canManage && <button style={s.secondaryButton} disabled={busy === memory.id} onClick={() => onToggle(memory)}>{memory.pinned ? 'Unpin' : 'Pin'}</button>}</div></article>; }
