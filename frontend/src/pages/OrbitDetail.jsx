import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  Flame,
  Orbit,
  Target,
  TrendingUp,
  UserCircle,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { formatApiError, orbitApi, uploadApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";
import UserAvatar from "@/components/UserAvatar";

const TYPE_LABELS = {
  habit_completions: "habit completions",
  task_completions: "task completions",
  streak_days: "streak days",
  xp: "XP",
  check_in: "check-ins",
};
const PROOF_CONTENT_TYPES = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
};

export default function OrbitDetail() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [orbitRecaps, setOrbitRecaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [createType, setCreateType] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [requiresProof, setRequiresProof] = useState(false);
  const [proofTarget, setProofTarget] = useState(null);
  const [proofText, setProofText] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await orbitApi.getDashboard(orbitId);
      setDashboard(data);
      const { data: recapData } = await orbitApi.listWeeklyRecaps(orbitId);
      setOrbitRecaps(Array.isArray(recapData?.items) ? recapData.items : []);
    } catch (err) {
      toast.error(
        formatApiError(err.response?.data?.detail) ||
          "Unable to load this Shared Orbit"
      );
    } finally {
      setLoading(false);
    }
  }, [orbitId]);

  useEffect(() => {
    load();
  }, [load]);

  async function contribute(goal) {
    setBusy(goal.id);
    try {
      await orbitApi.contribute(orbitId, goal.id);
      await load();
      toast.success("Progress added");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setBusy(null);
    }
  }

  async function generateOrbitAIRecap() {
    setBusy("orbit-ai-recap");
    try {
      await orbitApi.generateAIWeeklyRecap(orbitId);
      await load();
      toast.success("Orbit AI recap ready");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "AI recap unavailable");
    } finally {
      setBusy(null);
    }
  }

  async function createSharedItem(e) {
    e.preventDefault();
    if (!itemName.trim()) return;
    setBusy(`create-${createType}`);
    try {
      const data = { name: itemName.trim(), description: itemDescription.trim(), requires_proof: requiresProof };
      if (createType === "habit") await orbitApi.createHabit(orbitId, data);
      else await orbitApi.createTask(orbitId, data);
      setCreateType(null);
      setItemName("");
      setItemDescription("");
      setRequiresProof(false);
      await load();
      toast.success("Shared item created");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function completeSharedItem(type, item) {
    if (item.requires_proof) {
      setProofTarget({ type, item });
      setProofText("");
      setProofFile(null);
      return;
    }
    setBusy(`${type}-${item.id}`);
    try {
      if (type === "habit") await orbitApi.completeHabit(orbitId, item.id);
      else await orbitApi.completeTask(orbitId, item.id);
      await load();
      toast.success("Completed");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function submitProof(e) {
    e.preventDefault();
    if (!proofText.trim() && !proofFile) return;
    const { type, item } = proofTarget;
    setBusy(`proof-${item.id}`);
    try {
      let proofImageKey = null;
      if (proofFile) {
        const extension = proofFile.name.split(".").pop()?.toLowerCase();
        const contentType = proofFile.type || PROOF_CONTENT_TYPES[extension];
        if (!contentType) throw new Error("Choose a JPEG, PNG, WebP, or HEIC image.");
        const { data: upload } = await uploadApi.createUploadUrl({
          upload_type: "proof_image",
          filename: proofFile.name,
          content_type: contentType,
        });
        const uploadResponse = await fetch(upload.upload_url, {
          method: "PUT",
          headers: upload.headers,
          body: proofFile,
        });
        if (!uploadResponse.ok) throw new Error("Image upload failed. Please try again.");
        proofImageKey = upload.key;
      }
      const data = { proof_text: proofText.trim(), proof_image_key: proofImageKey };
      if (type === "habit") await orbitApi.completeHabitWithProof(orbitId, item.id, data);
      else await orbitApi.completeTaskWithProof(orbitId, item.id, data);
      setProofTarget(null);
      setProofText("");
      setProofFile(null);
      await load();
      toast.success("Proof submitted for review");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function reviewProof(proof, approve) {
    setBusy(`review-${proof.id}`);
    try {
      if (approve) await orbitApi.approveProof(orbitId, proof.id);
      else await orbitApi.rejectProof(orbitId, proof.id, { reason: rejectionReason.trim() });
      setRejectionReason("");
      await load();
      toast.success(approve ? "Proof approved" : "Proof rejected");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail)); }
    finally { setBusy(null); }
  }

  async function aiCheckProof(proof) {
    setBusy(`ai-${proof.id}`);
    try {
      await orbitApi.aiCheckProof(orbitId, proof.id);
      await load();
      toast.success("AI recommendation ready");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail || "AI check unavailable"));
    } finally {
      setBusy(null);
    }
  }

  async function leaveOrDelete() {
    const owner = dashboard.orbit.viewer_role === "owner";
    const confirmed = window.confirm(
      owner
        ? "Delete this Shared Orbit for every member?"
        : "Leave this Shared Orbit?"
    );

    if (!confirmed) return;

    try {
      if (owner) await orbitApi.remove(orbitId);
      else await orbitApi.leave(orbitId);

      toast.success(owner ? "Orbit deleted" : "Orbit left");
      navigate("/orbits", { replace: true });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    }
  }

  if (loading) return <p style={s.muted}>Loading Orbit dashboard...</p>;
  if (!dashboard?.orbit) {
    return (
      <div style={{ ...s.card, ...s.empty }}>
        This Shared Orbit is unavailable.
      </div>
    );
  }

  const {
    orbit,
    stats = {},
    members = [],
    recent_activity: recentActivity = [],
    shared_habits: sharedHabits = [],
    shared_tasks: sharedTasks = [],
    pending_proof_count: pendingProofCount = 0,
    pending_proofs: pendingProofs = [],
  } = dashboard;

  const level = Number(orbit.level || 1);
  const xp = Number(orbit.xp || 0);
  const levelStartXp = (level - 1) ** 2 * 100;
  const nextLevelXp = level ** 2 * 100;
  const levelSpan = Math.max(1, nextLevelXp - levelStartXp);
  const levelProgress = Math.max(0, xp - levelStartXp);
  const xpPercent = Math.max(
    0,
    Math.min(100, Math.round((levelProgress / levelSpan) * 100))
  );
  const weeklyPercent = Math.max(
    0,
    Math.min(100, Number(stats.weekly_completion_rate || 0))
  );
  const canManage = orbit.viewer_role === "owner" || orbit.viewer_role === "admin";

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div>
          <p style={s.eyebrow}>Shared Orbit</p>
          <h1 style={s.title}>{orbit.name}</h1>
          <p style={s.subtitle}>
            {orbit.description || "A private Shared Orbit."}
          </p>
        </div>

        <div style={s.actions}>
          <button
            style={s.secondaryButton}
            onClick={() => navigate(`/orbits/${orbitId}/members`)}
          >
            Members
          </button>
          {canManage && <button
            style={s.button}
            onClick={() => navigate(`/orbits/${orbitId}/goals/new`)}
          >
            New goal
          </button>}
        </div>
      </header>

      <section style={styles.heroCard}>
        <div style={styles.heroTop}>
          <div>
            <span style={styles.heroLabel}>Orbit momentum</span>
            <h2 style={styles.heroLevel}>Level {level}</h2>
            <p style={styles.heroMeta}>
              {stats.member_count || orbit.member_count || members.length} member
              {(stats.member_count || orbit.member_count || members.length) === 1
                ? ""
                : "s"}{" "}
              · {xp} XP
            </p>
          </div>
          <div style={styles.heroIcon}>
            <Orbit size={38} />
          </div>
        </div>

        <ProgressBar percent={xpPercent} />
        <p style={styles.progressCaption}>
          {levelProgress} / {levelSpan} XP to next level
        </p>
      </section>

      <h2 style={s.sectionTitle}>This week</h2>
      <section style={styles.statsGrid}>
        <StatCard
          Icon={TrendingUp}
          label="Completion"
          value={`${weeklyPercent}%`}
        />
        <StatCard Icon={Activity} label="Actions" value={stats.weekly_actions || 0} />
        <StatCard
          Icon={Zap}
          label="Habits"
          value={stats.habits_completed_this_week || 0}
        />
        <StatCard
          Icon={Target}
          label="Tasks"
          value={stats.tasks_completed_this_week || 0}
        />
        <StatCard
          Icon={Flame}
          label="Best streak"
          value={`${stats.current_streak || 0}d`}
        />
      </section>

      <section style={{ ...s.card, marginTop: 16 }}>
        <div style={s.row}>
          <h3 style={s.name}>Weekly progress</h3>
          <strong style={styles.progressValue}>{weeklyPercent}%</strong>
        </div>
        <ProgressBar percent={weeklyPercent} />
        <p style={s.muted}>
          Progress across Shared Orbit goals active this week.
        </p>
      </section>

      <section style={{ ...s.card, marginTop: 16 }}>
        <p style={styles.smallLabel}>Invite code</p>
        <strong style={styles.inviteCode}>{orbit.invite_code}</strong>
      </section>

      <SharedItemSection title="Shared habits" type="habit" items={sharedHabits} busy={busy} canCreate={canManage} onCreate={() => setCreateType("habit")} onComplete={completeSharedItem} />
      <SharedItemSection title="Shared tasks" type="task" items={sharedTasks} busy={busy} canCreate={canManage} onCreate={() => setCreateType("task")} onComplete={completeSharedItem} />

      {createType && <form style={{...s.card, marginTop:16}} onSubmit={createSharedItem}>
        <h3 style={s.name}>New shared {createType}</h3>
        <label style={s.label}>Name</label><input style={s.input} value={itemName} onChange={e => setItemName(e.target.value)} maxLength={100}/>
        <label style={s.label}>Description</label><input style={s.input} value={itemDescription} onChange={e => setItemDescription(e.target.value)} maxLength={300}/>
        <label style={{...s.label, display:"flex", gap:10, alignItems:"center"}}><input type="checkbox" checked={requiresProof} onChange={e => setRequiresProof(e.target.checked)}/> Require proof before XP is awarded</label>
        <div style={s.actions}><button type="button" style={s.secondaryButton} onClick={() => setCreateType(null)}>Cancel</button><button style={s.button} disabled={busy || !itemName.trim()}>Create</button></div>
      </form>}

      {proofTarget && <form style={{...s.card, marginTop:16}} onSubmit={submitProof}>
        <h3 style={s.name}>Submit proof for {proofTarget.item.name}</h3>
        <label style={s.label}>What did you complete?</label><textarea style={{...s.input, minHeight:100}} value={proofText} onChange={e => setProofText(e.target.value)} maxLength={1000}/>
        <label style={s.label}>Proof image (optional)</label><input type="file" accept="image/jpeg,image/png,image/webp,image/heic,.heic" onChange={e => setProofFile(e.target.files?.[0] || null)}/>
        {proofFile && <p style={s.muted}>{proofFile.name}</p>}
        <div style={s.actions}><button type="button" style={s.secondaryButton} onClick={() => { setProofTarget(null); setProofFile(null); }}>Cancel</button><button style={s.button} disabled={busy || (!proofText.trim() && !proofFile)}>{busy ? "Submitting..." : "Submit for review"}</button></div>
      </form>}

      {pendingProofCount > 0 && <h2 style={s.sectionTitle}>Pending proofs ({pendingProofCount})</h2>}
      {pendingProofs.length > 0 && <div style={s.cardStack}>{pendingProofs.map(proof => <div key={proof.id} style={s.card}>
        <div style={s.row}><h3 style={s.name}>{proof.item?.name || "Shared item"}</h3><span style={s.badge}>pending</span></div>
        <p style={s.muted}>Submitted by {proof.submitter?.display_name || proof.submitter?.name || "a member"}</p>
        {proof.proof_text && <p style={styles.proofText}>{proof.proof_text}</p>}
        {proof.proof_image_key && <ProofImage objectKey={proof.proof_image_key} />}
        {proof.ai_status === "completed" && <div style={styles.aiRecommendation}>
          <strong style={{textTransform:"capitalize"}}>AI recommendation: {proof.ai_recommendation || "uncertain"}</strong>
          <span>{Math.round((proof.ai_confidence || 0) * 100)}% confidence</span>
          {proof.ai_reason && <span>{proof.ai_reason}</span>}
        </div>}
        {proof.ai_status === "failed" && proof.ai_reason && <p style={styles.aiError}>{proof.ai_reason}</p>}
        <button type="button" style={{...s.secondaryButton, marginTop:14}} disabled={busy || proof.ai_status === "pending"} onClick={() => aiCheckProof(proof)}>{proof.ai_status === "pending" ? "Checking..." : "AI Check"}</button>
        <input style={{...s.input, marginTop:12}} value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} placeholder="Rejection reason (optional)" maxLength={500}/>
        <div style={{...s.actions, marginTop:14}}><button style={s.secondaryButton} disabled={busy} onClick={() => reviewProof(proof, false)}>Reject</button><button style={s.button} disabled={busy} onClick={() => reviewProof(proof, true)}>Approve</button></div>
      </div>)}</div>}

      <h2 style={s.sectionTitle}>Group goals</h2>
      {orbit.goals?.length ? (
        <div style={s.cardStack}>
          {orbit.goals.map((goal) => {
            const percent = Math.min(
              100,
              Math.round(((goal.progress || 0) / goal.target_amount) * 100)
            );

            return (
              <div key={goal.id} style={s.card}>
                <div style={s.row}>
                  <h3 style={s.name}>{goal.title}</h3>
                  <span style={s.badge}>{goal.status}</span>
                </div>
                {goal.description && <p style={s.muted}>{goal.description}</p>}
                <ProgressBar percent={percent} />
                <div style={{ ...s.row, marginTop: 10 }}>
                  <p style={{ ...s.muted, margin: 0 }}>
                    {goal.progress || 0} / {goal.target_amount}{" "}
                    {TYPE_LABELS[goal.target_type] || goal.target_type}
                  </p>
                  {goal.status !== "completed" && (
                    <button
                      style={s.secondaryButton}
                      disabled={busy === goal.id}
                      onClick={() => contribute(goal)}
                    >
                      {busy === goal.id
                        ? "Adding..."
                        : goal.target_type === "check_in"
                          ? "Check in"
                          : "Add 1"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ ...s.card, ...s.empty }}>
          <Target size={40} />
          <h3 style={{ color: "var(--text)" }}>No group goals</h3>
          <p>Create the first shared target for this Orbit.</p>
        </div>
      )}

      <h2 style={s.sectionTitle}>Weekly Orbit Recap</h2>
      <section style={s.card}>
        {orbitRecaps[0]?.ai_recap ? <OrbitAIRecap recap={orbitRecaps[0].ai_recap} /> : <p style={s.muted}>Generate a shared reflection from this Orbit's completions, challenges, XP, and proof reviews.</p>}
        <button style={{...s.button, marginTop:14}} disabled={busy} onClick={generateOrbitAIRecap}>
          {busy === "orbit-ai-recap" ? "Generating..." : orbitRecaps[0]?.ai_recap ? "Refresh AI Recap" : "Generate AI Recap"}
        </button>
      </section>

      <h2 style={s.sectionTitle}>Recent activity</h2>
      {recentActivity.length ? (
        <div style={s.cardStack}>
          {recentActivity.map((item) => (
            <div key={item.id} style={s.card}>
              <div style={styles.activityRow}>
                <div style={styles.activityIcon}>
                  <Activity size={20} />
                </div>
                <div>
                  <p style={styles.activityMessage}>{item.message}</p>
                  <p style={styles.activityTime}>
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={s.muted}>
          Activity will appear as members build momentum.
        </p>
      )}

      <div style={styles.sectionHeader}>
        <h2 style={{ ...s.sectionTitle, margin: 0 }}>Members</h2>
        <span style={s.muted}>{members.length} total</span>
      </div>
      {members.length ? (
        <div style={styles.memberGrid}>
          {members.map((member) => (
            <div key={member.user_id} style={s.card}>
              <div style={styles.memberRow}>
                <UserAvatar user={member.user} size={48} style={styles.avatar} />
                <div>
                  <h3 style={styles.memberName}>
                    {member.user?.display_name ||
                      member.user?.name ||
                      member.user?.username ||
                      "Member"}
                  </h3>
                  <p style={styles.memberMeta}><span style={{...s.badge, textTransform:"capitalize", marginRight:8}}>{member.role}</span>Level {member.user?.level || 1}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ ...s.card, ...s.empty }}>
          <Users size={40} />
          <p>No members to display.</p>
        </div>
      )}

      <button
        style={{ ...s.dangerButton, marginTop: 34 }}
        onClick={leaveOrDelete}
      >
        {orbit.viewer_role === "owner" ? "Delete Orbit" : "Leave Orbit"}
      </button>
    </div>
  );
}

function ProgressBar({ percent }) {
  return (
    <div style={styles.progressTrack}>
      <div
        style={{
          ...styles.progressFill,
          width: `${Math.max(0, Math.min(100, percent))}%`,
        }}
      />
    </div>
  );
}

function OrbitAIRecap({ recap }) {
  const sections = [["Wins", recap.wins], ["Needs attention", recap.needs_attention], ["Suggested focus", recap.suggested_focus]];
  return <div style={styles.orbitAIRecap}>
    <p style={{margin:0}}>{recap.summary}</p>
    {sections.map(([label, items]) => items?.length ? <div key={label}>
      <strong>{label}</strong>
      <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </div> : null)}
    {recap.suggested_challenge && <strong style={{color:"var(--primary-dark)"}}>Challenge idea: {recap.suggested_challenge}</strong>}
  </div>;
}

function ProofImage({ objectKey }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    uploadApi.getViewUrl(objectKey)
      .then(({ data }) => { if (active) setUrl(data.view_url); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [objectKey]);

  if (failed) return <p style={s.muted}>Proof image unavailable.</p>;
  if (!url) return <p style={s.muted}>Loading proof image...</p>;
  return <img src={url} alt="Submitted proof" style={styles.proofImage} />;
}

function StatCard({ Icon, label, value }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statIcon}>
        <Icon size={20} />
      </div>
      <strong style={styles.statValue}>{value}</strong>
      <span style={styles.statLabel}>{label}</span>
    </div>
  );
}

function SharedItemSection({ title, type, items, busy, canCreate, onCreate, onComplete }) {
  return <>
    <div style={styles.sectionHeader}><h2 style={{...s.sectionTitle, margin:0}}>{title}</h2>{canCreate && <button style={s.secondaryButton} onClick={onCreate}>Create</button>}</div>
    {items.length ? <div style={s.cardStack}>{items.map(item => {
      const completed = type === "habit" ? item.completed_today : item.completed;
      const pending = item.viewer_proof_status === "pending";
      return <div key={item.id} style={s.card}>
        <div style={s.row}><div><h3 style={s.name}>{item.name}</h3>{item.description && <p style={s.muted}>{item.description}</p>}{item.requires_proof && <p style={{...s.muted, color:"var(--primary-dark)"}}>Proof required</p>}{pending && <p style={s.muted}>Awaiting review</p>}{item.viewer_proof_status === "rejected" && <p style={{...s.muted, color:"var(--danger)"}}>Proof rejected. You can resubmit.</p>}</div><button style={s.secondaryButton} disabled={completed || pending || busy} onClick={() => onComplete(type, item)}>{completed ? "Completed" : pending ? "Pending review" : item.requires_proof ? (item.viewer_proof_status === "rejected" ? "Resubmit proof" : "Submit proof") : "Complete"}</button></div>
      </div>;
    })}</div> : <div style={{...s.card, ...s.empty}}>No {title.toLowerCase()} yet.</div>}
  </>;
}

const styles = {
  heroCard: {
    padding: 26,
    borderRadius: 28,
    color: "white",
    background:
      "linear-gradient(135deg, var(--primary-dark), var(--primary))",
    boxShadow: "0 18px 40px rgba(47, 93, 58, 0.24)",
  },
  heroTop: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    opacity: 0.82,
  },
  heroLevel: { margin: "8px 0 0", fontSize: 34, letterSpacing: "-0.04em" },
  heroMeta: { margin: "7px 0 0", fontWeight: 750, opacity: 0.88 },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 24,
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.15)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 14,
  },
  statCard: {
    padding: 18,
    borderRadius: 22,
    background: "var(--surface)",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  statIcon: {
    width: 38,
    height: 38,
    display: "grid",
    placeItems: "center",
    borderRadius: 14,
    color: "var(--primary-dark)",
    background: "color-mix(in srgb, var(--primary) 12%, transparent)",
  },
  statValue: { color: "var(--text)", fontSize: 25, letterSpacing: "-0.03em" },
  statLabel: { color: "var(--muted)", fontSize: 13, fontWeight: 800 },
  progressTrack: {
    height: 11,
    marginTop: 18,
    overflow: "hidden",
    borderRadius: 999,
    background: "rgba(127,127,127,0.18)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "var(--accent)",
    transition: "width 0.25s ease",
  },
  progressCaption: { margin: "9px 0 0", fontSize: 13, fontWeight: 750, opacity: 0.84 },
  progressValue: { color: "var(--primary-dark)", fontSize: 18 },
  proofText: { margin:"14px 0 0", padding:14, borderRadius:14, background:"color-mix(in srgb, var(--primary) 8%, var(--surface))", color:"var(--text)", whiteSpace:"pre-wrap" },
  proofImage: { display:"block", width:"100%", maxHeight:420, marginTop:14, borderRadius:16, objectFit:"cover" },
  aiRecommendation: { display:"grid", gap:5, marginTop:14, padding:14, borderRadius:14, background:"color-mix(in srgb, var(--accent) 10%, var(--surface))", color:"var(--text)" },
  aiError: { margin:"12px 0 0", color:"var(--danger, #b42318)", fontWeight:700 },
  orbitAIRecap: { display:"grid", gap:12, color:"var(--text)", lineHeight:1.55 },
  smallLabel: {
    margin: 0,
    color: "var(--muted)",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  inviteCode: {
    display: "block",
    marginTop: 7,
    color: "var(--text)",
    fontSize: 28,
    letterSpacing: "0.08em",
  },
  activityRow: { display: "flex", alignItems: "flex-start", gap: 13 },
  activityIcon: {
    width: 40,
    height: 40,
    flex: "0 0 auto",
    display: "grid",
    placeItems: "center",
    borderRadius: 14,
    color: "var(--primary-dark)",
    background: "color-mix(in srgb, var(--primary) 12%, transparent)",
  },
  activityMessage: { margin: 0, color: "var(--text)", fontWeight: 800, lineHeight: 1.45 },
  activityTime: { margin: "6px 0 0", color: "var(--muted)", fontSize: 12, fontWeight: 700 },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    margin: "30px 0 14px",
  },
  memberGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  },
  memberRow: { display: "flex", alignItems: "center", gap: 13 },
  avatar: {
    width: 48,
    height: 48,
    flex: "0 0 auto",
    display: "grid",
    placeItems: "center",
    borderRadius: 18,
    color: "var(--primary-dark)",
    background: "color-mix(in srgb, var(--primary) 12%, transparent)",
  },
  memberName: { margin: 0, color: "var(--text)", fontSize: 16 },
  memberMeta: { margin: "5px 0 0", color: "var(--muted)", fontSize: 13, fontWeight: 750, textTransform: "capitalize" },
};
