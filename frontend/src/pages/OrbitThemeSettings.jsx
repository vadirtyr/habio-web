import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";
export default function OrbitThemeSettings() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [orbit, setOrbit] = useState(null);
  const [themes, setThemes] = useState([]);
  const [selected, setSelected] = useState('default');
  const [saving, setSaving] = useState(false);
  const load = useCallback(async () => { try { const [{ data: dashboard }, { data: themeData }] = await Promise.all([orbitApi.getDashboard(orbitId), orbitApi.listThemes()]); setOrbit(dashboard.orbit); setSelected(dashboard.orbit?.theme_id || 'default'); setThemes(themeData.items || []); } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || 'Unable to load themes'); } }, [orbitId]);
  useEffect(() => { load(); }, [load]);
  async function save() { setSaving(true); try { await orbitApi.updateTheme(orbitId, selected); toast.success('Orbit theme saved'); navigate('/orbits/' + orbitId); } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || 'Could not save theme'); } finally { setSaving(false); } }
  const canManage = orbit?.viewer_role === 'owner' || orbit?.viewer_role === 'admin';
  return <div style={s.page}><header style={s.header}><div><p style={s.eyebrow}>Theme & Banner</p><h1 style={s.title}>{orbit?.name || 'Orbit'} Theme</h1><p style={s.subtitle}>Choose a built-in visual identity for this Orbit.</p></div><button style={s.secondaryButton} onClick={() => navigate('/orbits/' + orbitId)}>Back</button></header>{!canManage && <section style={s.card}>Only Orbit owners and admins can change themes.</section>}<div style={styles.grid}>{themes.map((theme) => <button key={theme.id} style={{ ...s.card, ...styles.card, borderColor: selected === theme.id ? 'var(--primary)' : 'var(--border)' }} onClick={() => setSelected(theme.id)} disabled={!canManage}><div style={{ ...styles.preview, background: theme.gradient || theme.background || 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}><strong>{theme.name || theme.id}</strong></div><p style={s.muted}>{theme.description || theme.id}</p>{selected === theme.id && <span style={s.badge}>Selected</span>}</button>)}</div>{canManage && <button style={{ ...s.button, marginTop: 18 }} disabled={saving} onClick={save}>{saving ? 'Saving...' : 'Save Theme'}</button>}</div>;
}
const styles = { grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }, card: { textAlign: 'left', cursor: 'pointer' }, preview: { minHeight: 110, borderRadius: 22, padding: 18, color: 'white', display: 'flex', alignItems: 'end', marginBottom: 12 } };
