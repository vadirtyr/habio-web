import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi, projectApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";
export default function Projects() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orbitId = params.get('orbitId') || '';
  const [projects, setProjects] = useState([]);
  const [orbits, setOrbits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOrbit, setSelectedOrbit] = useState(orbitId);
  const [subtasks, setSubtasks] = useState('');
  const [xpReward, setXpReward] = useState('0');
  const [coinReward, setCoinReward] = useState('0');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { try { const [{ data: projectData }, { data: orbitData }] = await Promise.all([projectApi.list(orbitId || undefined), orbitApi.list().catch(() => ({ data: { items: [] } }))]); setProjects(projectData.items || []); setOrbits(orbitData.items || []); } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || 'Unable to load projects'); } finally { setLoading(false); } }, [orbitId]);
  useEffect(() => { load(); }, [load]);
  async function create(e) { e.preventDefault(); if (!title.trim()) return; try { const body = { title: title.trim(), description: description.trim(), orbit_id: selectedOrbit || null, xp_reward: Number(xpReward) || 0, coin_reward: Number(coinReward) || 0, subtasks: subtasks.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => ({ title: line, xp_reward: 0, coin_reward: 0 })) }; await projectApi.create(body); setTitle(''); setDescription(''); setSubtasks(''); setShowForm(false); await load(); toast.success('Project created'); } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || 'Could not create project'); } }
  if (loading) return <p style={s.muted}>Loading projects...</p>;
  return <div style={s.page}><header style={s.header}><div><p style={s.eyebrow}>Projects</p><h1 style={s.title}>{orbitId ? 'Orbit Projects' : 'Projects'}</h1><p style={s.subtitle}>Large goals with subtasks, assignees, XP, coins, and progress.</p></div><button style={s.button} onClick={() => setShowForm((value) => !value)}>New Project</button></header>{showForm && <form style={{ ...s.card, ...s.form, marginBottom: 20 }} onSubmit={create}><label style={s.label}>Title</label><input style={s.input} value={title} onChange={(e) => setTitle(e.target.value)} /><label style={s.label}>Description</label><textarea style={{ ...s.input, minHeight: 90 }} value={description} onChange={(e) => setDescription(e.target.value)} /><label style={s.label}>Orbit optional</label><select style={s.input} value={selectedOrbit} onChange={(e) => setSelectedOrbit(e.target.value)}><option value="">Personal project</option>{orbits.map((orbit) => <option key={orbit.id} value={orbit.id}>{orbit.name}</option>)}</select><label style={s.label}>Subtasks, one per line</label><textarea style={{ ...s.input, minHeight: 120 }} value={subtasks} onChange={(e) => setSubtasks(e.target.value)} /><div style={styles.two}><div><label style={s.label}>XP reward</label><input style={s.input} type="number" min="0" value={xpReward} onChange={(e) => setXpReward(e.target.value)} /></div><div><label style={s.label}>Coin reward</label><input style={s.input} type="number" min="0" value={coinReward} onChange={(e) => setCoinReward(e.target.value)} /></div></div><button style={{ ...s.button, marginTop: 18 }}>Create</button></form>}{projects.length ? <div style={s.cardStack}>{projects.map((project) => <button key={project.id} style={{ ...s.card, textAlign: 'left', cursor: 'pointer' }} onClick={() => navigate('/projects/' + project.id)}><div style={s.row}><div><h3 style={s.name}>{project.title}</h3><p style={s.muted}>{project.orbit_id ? 'Orbit project' : 'Personal project'} - {project.completed_subtasks || 0}/{project.total_subtasks || 0} subtasks</p></div><span style={s.badge}>{project.completion_percent || 0}%</span></div><div style={s.progressTrack}><div style={{ height: '100%', width: (project.completion_percent || 0) + '%', background: 'var(--primary)' }} /></div></button>)}</div> : <section style={{ ...s.card, ...s.empty }}>No projects yet.</section>}</div>;
}
const styles = { two: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 } };
