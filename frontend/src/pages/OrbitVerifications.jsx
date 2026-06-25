import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { formatApiError, orbitApi, uploadApi } from "@/lib/api";
import { orbitStyles as s } from "@/pages/orbitStyles";

function ProofImage({ objectKey }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let active = true;
    uploadApi.getViewUrl(objectKey).then(({ data }) => { if (active) setUrl(data.view_url); }).catch(() => {});
    return () => { active = false; };
  }, [objectKey]);
  if (!objectKey) return null;
  if (!url) return <p style={s.muted}>Loading proof image...</p>;
  return <img src={url} alt="Proof" style={styles.proofImage} />;
}

export default function OrbitVerifications() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [orbit, setOrbit] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [{ data: dashboard }, { data: proofData }] = await Promise.all([
        orbitApi.getDashboard(orbitId),
        orbitApi.listPendingProofs(orbitId),
      ]);
      setOrbit(dashboard.orbit);
      setProofs(proofData.items || []);
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Unable to load verification queue");
    } finally {
      setLoading(false);
    }
  }, [orbitId]);

  useEffect(() => { load(); }, [load]);

  async function review(proof, approve) {
    setBusy(proof.id);
    try {
      if (approve) await orbitApi.approveProof(orbitId, proof.id);
      else await orbitApi.rejectProof(orbitId, proof.id, { reason: reason.trim() });
      setReason("");
      await load();
      toast.success(approve ? "Proof approved" : "Proof rejected");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not review proof");
    } finally {
      setBusy(null);
    }
  }

  async function aiCheck(proof) {
    setBusy(`ai-${proof.id}`);
    try {
      await orbitApi.aiCheckProof(orbitId, proof.id);
      await load();
      toast.success("AI recommendation ready");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "AI check unavailable");
    } finally {
      setBusy(null);
    }
  }

  if (loading) return <p style={s.muted}>Loading verification queue...</p>;
  return <div style={s.page}>
    <header style={s.header}><div><p style={s.eyebrow}>Verification Queue</p><h1 style={s.title}>{orbit?.name || "Orbit"}</h1><p style={s.subtitle}>Review pending proof before XP, coins, and challenge progress are awarded.</p></div><button style={s.secondaryButton} onClick={() => navigate(`/orbits/${orbitId}`)}>Back to Orbit</button></header>
    {!proofs.length ? <section style={{ ...s.card, ...s.empty }}>No pending proof submissions.</section> : <div style={s.cardStack}>{proofs.map((proof) => <article key={proof.id} style={s.card}>
      <div style={s.row}><div><p style={s.eyebrow}>{proof.item_type || "proof"}</p><h3 style={s.name}>{proof.item?.name || proof.item?.project_title || "Shared item"}</h3><p style={s.muted}>Submitted by {proof.submitter?.display_name || proof.submitter?.name || "a member"}</p></div><span style={s.badge}>Pending</span></div>
      {proof.proof_text && <p style={styles.proofText}>{proof.proof_text}</p>}
      <ProofImage objectKey={proof.proof_image_key || proof.verification_photo_url} />
      {proof.ai_status === "completed" && <div style={styles.aiBox}><strong>AI: {proof.ai_recommendation || "uncertain"}</strong><span>{Math.round((proof.ai_confidence || 0) * 100)}% confidence</span>{proof.ai_reason && <span>{proof.ai_reason}</span>}</div>}
      <input style={{ ...s.input, marginTop: 14 }} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Rejection reason optional" />
      <div style={{ ...s.actions, marginTop: 14 }}><button style={s.secondaryButton} disabled={busy} onClick={() => aiCheck(proof)}>{busy === `ai-${proof.id}` ? "Checking..." : "AI Check"}</button><button style={s.secondaryButton} disabled={busy} onClick={() => review(proof, false)}>Reject</button><button style={s.button} disabled={busy} onClick={() => review(proof, true)}>Approve</button></div>
    </article>)}</div>}
  </div>;
}

const styles = {
  proofText: { margin: "14px 0 0", padding: 14, borderRadius: 16, background: "var(--bg)", color: "var(--text)", fontWeight: 650 },
  proofImage: { width: "100%", maxHeight: 360, objectFit: "cover", borderRadius: 18, marginTop: 14, border: "1px solid var(--border)" },
  aiBox: { marginTop: 14, padding: 14, borderRadius: 16, background: "color-mix(in srgb, var(--primary) 10%, var(--surface))", display: "grid", gap: 4, color: "var(--text)" },
};
