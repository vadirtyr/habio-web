import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  Flag,
  Flame,
  Orbit,
  Target,
  Trophy,
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
const RSVP_OPTIONS = [
  ["attending", "Attending"],
  ["maybe", "Maybe"],
  ["declined", "Declined"],
];

export default function OrbitDetail() {
  const { orbitId } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [parentDashboard, setParentDashboard] = useState(null);
  const [troopMilestones, setTroopMilestones] = useState([]);
  const [events, setEvents] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [patrolLeaderboard, setPatrolLeaderboard] = useState([]);
  const [readinessByEvent, setReadinessByEvent] = useState({});
  const [patrolReadinessByEvent, setPatrolReadinessByEvent] = useState({});
  const [orbitRecaps, setOrbitRecaps] = useState([]);
  const [insightsError, setInsightsError] = useState(null);
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
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewardTitle, setRewardTitle] = useState("");
  const [rewardDescription, setRewardDescription] = useState("");
  const [rewardCost, setRewardCost] = useState("500");
  const [rewardSeasonId, setRewardSeasonId] = useState("");
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventSeasonId, setEventSeasonId] = useState("");
  const [showSeasonForm, setShowSeasonForm] = useState(false);
  const [editingSeason, setEditingSeason] = useState(null);
  const [seasonTitle, setSeasonTitle] = useState("");
  const [seasonDescription, setSeasonDescription] = useState("");
  const [seasonStartDate, setSeasonStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [seasonEndDate, setSeasonEndDate] = useState(() => {
    const end = new Date();
    end.setUTCDate(end.getUTCDate() + 30);
    return end.toISOString().slice(0, 10);
  });
  const [readinessForm, setReadinessForm] = useState(null);
  const [readinessTitle, setReadinessTitle] = useState("");
  const [readinessDescription, setReadinessDescription] = useState("");
  const [readinessRequired, setReadinessRequired] = useState(true);
  const [showPatrolForm, setShowPatrolForm] = useState(false);
  const [patrolName, setPatrolName] = useState("");
  const [patrolDescription, setPatrolDescription] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await orbitApi.getDashboard(orbitId);
      setDashboard(data);
      const [{ data: recapData }, { data: patrolLeaderboardData }, { data: eventData }, { data: seasonData }] = await Promise.all([
        orbitApi.listWeeklyRecaps(orbitId),
        orbitApi.getPatrolLeaderboard(orbitId),
        orbitApi.listEvents(orbitId),
        orbitApi.listSeasons(orbitId),
      ]);
      setOrbitRecaps(Array.isArray(recapData?.items) ? recapData.items : []);
      setPatrolLeaderboard(Array.isArray(patrolLeaderboardData?.items) ? patrolLeaderboardData.items : []);
      const eventItems = Array.isArray(eventData?.items) ? eventData.items : [];
      setEvents(eventItems);
      setSeasons(Array.isArray(seasonData?.items) ? seasonData.items : []);
      const [readinessResults, patrolReadinessResults] = await Promise.all([
        Promise.allSettled(eventItems.map((event) => orbitApi.getEventReadiness(orbitId, event.id))),
        Promise.allSettled(eventItems.map((event) => orbitApi.getEventPatrolReadiness(orbitId, event.id))),
      ]);
      const readinessMap = {};
      readinessResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          readinessMap[eventItems[index].id] = result.value.data;
        }
      });
      setReadinessByEvent(readinessMap);
      if (data.orbit?.template === "scout_troop") {
        orbitApi.getParentDashboard(orbitId)
          .then(({ data }) => setParentDashboard(data))
          .catch(() => setParentDashboard(null));
        orbitApi.getMilestones(orbitId)
          .then(({ data }) => setTroopMilestones((data.items || []).filter((item) => item.template === "scout_troop")))
          .catch(() => setTroopMilestones([]));
      } else {
        setParentDashboard(null);
        setTroopMilestones([]);
      }
      const patrolReadinessMap = {};
      patrolReadinessResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
          patrolReadinessMap[eventItems[index].id] = result.value.data;
        }
      });
      setPatrolReadinessByEvent(patrolReadinessMap);
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

  async function generateOrbitAIInsights() {
    setBusy("orbit-ai-insights");
    setInsightsError(null);
    try {
      await orbitApi.generateAIInsights(orbitId);
      await load();
      toast.success("Orbit Insights ready");
    } catch (err) {
      const message = formatApiError(err.response?.data?.detail) || "Orbit Insights unavailable";
      setInsightsError(message);
      toast.error(message);
    } finally {
      setBusy(null);
    }
  }

  function openRewardForm(reward = null) {
    setEditingReward(reward);
    setRewardTitle(reward?.title || "");
    setRewardDescription(reward?.description || "");
    setRewardCost(String(reward?.xp_cost || 500));
    setRewardSeasonId(reward?.season_id || "");
    setShowRewardForm(true);
  }

  async function saveReward(event) {
    event.preventDefault();
    const xpCost = Number(rewardCost);
    if (!rewardTitle.trim() || xpCost < 1) return;
    setBusy(editingReward ? `edit-reward-${editingReward.id}` : "create-reward");
    try {
      const data = { title: rewardTitle.trim(), description: rewardDescription.trim(), xp_cost: xpCost, season_id: rewardSeasonId || null };
      if (editingReward) await orbitApi.updateReward(orbitId, editingReward.id, data);
      else await orbitApi.createReward(orbitId, data);
      setShowRewardForm(false);
      setEditingReward(null);
      await load();
      toast.success("Orbit reward saved");
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Could not save reward"); }
    finally { setBusy(null); }
  }

  async function redeemReward(reward) {
    setBusy(`redeem-reward-${reward.id}`);
    try {
      await orbitApi.redeemReward(orbitId, reward.id);
      await load();
      toast.success(`${reward.title} redeemed`);
    } catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Could not redeem reward"); }
    finally { setBusy(null); }
  }

  async function deleteReward(reward) {
    if (!window.confirm(`Delete ${reward.title}?`)) return;
    try { await orbitApi.deleteReward(orbitId, reward.id); await load(); toast.success("Orbit reward deleted"); }
    catch (err) { toast.error(formatApiError(err.response?.data?.detail) || "Could not delete reward"); }
  }

  function openEventForm(event = null) {
    setEditingEvent(event);
    setEventTitle(event?.title || "");
    setEventDescription(event?.description || "");
    setEventLocation(event?.location || "");
    setEventStart(event?.start_time ? event.start_time.slice(0, 16) : "");
    setEventEnd(event?.end_time ? event.end_time.slice(0, 16) : "");
    setEventSeasonId(event?.season_id || "");
    setShowEventForm(true);
  }

  async function saveEvent(event) {
    event.preventDefault();
    if (!eventTitle.trim() || !eventStart.trim()) return;
    setBusy(editingEvent ? `edit-event-${editingEvent.id}` : "create-event");
    try {
      const data = {
        title: eventTitle.trim(),
        description: eventDescription.trim(),
        location: eventLocation.trim(),
        start_time: eventStart.trim(),
        end_time: eventEnd.trim() || null,
        season_id: eventSeasonId || null,
      };
      if (editingEvent) await orbitApi.updateEvent(orbitId, editingEvent.id, data);
      else await orbitApi.createEvent(orbitId, data);
      setShowEventForm(false);
      setEditingEvent(null);
      await load();
      toast.success("Orbit event saved");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not save event");
    } finally {
      setBusy(null);
    }
  }

  async function deleteEvent(event) {
    if (!window.confirm(`Delete ${event.title}?`)) return;
    setBusy(`delete-event-${event.id}`);
    try {
      await orbitApi.deleteEvent(orbitId, event.id);
      await load();
      toast.success("Orbit event deleted");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not delete event");
    } finally {
      setBusy(null);
    }
  }

  function openSeasonForm(season = null) {
    setEditingSeason(season);
    setSeasonTitle(season?.title || "");
    setSeasonDescription(season?.description || "");
    setSeasonStartDate(season?.start_date || new Date().toISOString().slice(0, 10));
    setSeasonEndDate(season?.end_date || (() => {
      const end = new Date();
      end.setUTCDate(end.getUTCDate() + 30);
      return end.toISOString().slice(0, 10);
    })());
    setShowSeasonForm(true);
  }

  async function saveSeason(event) {
    event.preventDefault();
    if (!seasonTitle.trim() || !seasonStartDate.trim() || !seasonEndDate.trim()) return;
    setBusy(editingSeason ? `edit-season-${editingSeason.id}` : "create-season");
    try {
      const data = {
        title: seasonTitle.trim(),
        description: seasonDescription.trim(),
        start_date: seasonStartDate.trim(),
        end_date: seasonEndDate.trim(),
        template: dashboard?.orbit?.template || null,
      };
      if (editingSeason) await orbitApi.updateSeason(orbitId, editingSeason.id, data);
      else await orbitApi.createSeason(orbitId, data);
      setShowSeasonForm(false);
      setEditingSeason(null);
      await load();
      toast.success("Orbit season saved");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not save season");
    } finally {
      setBusy(null);
    }
  }

  async function deleteSeason(season) {
    if (!window.confirm(`Archive ${season.title}? Existing linked items will keep working.`)) return;
    try {
      await orbitApi.deleteSeason(orbitId, season.id);
      await load();
      toast.success("Orbit season archived");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not archive season");
    }
  }

  async function rsvpEvent(event, status) {
    setBusy(`event-rsvp-${event.id}`);
    try {
      await orbitApi.rsvpEvent(orbitId, event.id, status);
      await load();
      toast.success("RSVP updated");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not update RSVP");
    } finally {
      setBusy(null);
    }
  }

  function openReadinessForm(event, item = null) {
    setReadinessForm({ event, item });
    setReadinessTitle(item?.title || "");
    setReadinessDescription(item?.description || "");
    setReadinessRequired(item?.required !== false);
  }

  async function saveReadinessItem(event) {
    event.preventDefault();
    if (!readinessForm?.event || !readinessTitle.trim()) return;
    const { event: orbitEvent, item } = readinessForm;
    setBusy(item ? `readiness-edit-${item.id}` : `readiness-create-${orbitEvent.id}`);
    try {
      const data = {
        title: readinessTitle.trim(),
        description: readinessDescription.trim(),
        required: readinessRequired,
      };
      const response = item
        ? await orbitApi.updateEventReadinessItem(orbitId, orbitEvent.id, item.id, data)
        : await orbitApi.createEventReadinessItem(orbitId, orbitEvent.id, data);
      setReadinessByEvent((current) => ({ ...current, [orbitEvent.id]: response.data }));
      setReadinessForm(null);
      toast.success("Readiness checklist updated");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not save checklist item");
    } finally {
      setBusy(null);
    }
  }

  async function deleteReadinessItem(event, item) {
    if (!window.confirm(`Delete ${item.title}?`)) return;
    setBusy(`readiness-delete-${item.id}`);
    try {
      const response = await orbitApi.deleteEventReadinessItem(orbitId, event.id, item.id);
      setReadinessByEvent((current) => ({ ...current, [event.id]: response.data }));
      toast.success("Checklist item deleted");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not delete checklist item");
    } finally {
      setBusy(null);
    }
  }

  async function toggleReadinessItem(event, item) {
    setBusy(`readiness-${item.id}`);
    try {
      const response = item.completed
        ? await orbitApi.uncompleteEventReadinessItem(orbitId, event.id, item.id)
        : await orbitApi.completeEventReadinessItem(orbitId, event.id, item.id);
      setReadinessByEvent((current) => ({ ...current, [event.id]: response.data }));
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not update checklist");
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

  async function createPatrol(event) {
    event.preventDefault();
    if (!patrolName.trim()) return;
    setBusy("create-patrol");
    try {
      await orbitApi.createPatrol(orbitId, {
        name: patrolName.trim(),
        description: patrolDescription.trim(),
      });
      setPatrolName("");
      setPatrolDescription("");
      setShowPatrolForm(false);
      await load();
      toast.success("Patrol created");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not create patrol");
    } finally {
      setBusy(null);
    }
  }

  async function deletePatrol(patrol) {
    if (!window.confirm(`Delete ${patrol.name}? Members will be unassigned from this patrol.`)) return;
    setBusy(`delete-patrol-${patrol.id}`);
    try {
      await orbitApi.deletePatrol(orbitId, patrol.id);
      await load();
      toast.success("Patrol deleted");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not delete patrol");
    } finally {
      setBusy(null);
    }
  }

  async function assignPatrolMember(patrol, userId) {
    if (!userId) return;
    setBusy(`assign-patrol-${patrol.id}`);
    try {
      await orbitApi.assignPatrolMember(orbitId, patrol.id, userId);
      await load();
      toast.success("Patrol assignment updated");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not assign member");
    } finally {
      setBusy(null);
    }
  }

  async function removePatrolMember(patrol, userId) {
    setBusy(`remove-patrol-${patrol.id}-${userId}`);
    try {
      await orbitApi.removePatrolMember(orbitId, patrol.id, userId);
      await load();
      toast.success("Member removed from patrol");
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail) || "Could not remove member from patrol");
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
    patrols = [],
    recent_activity: recentActivity = [],
    shared_habits: sharedHabits = [],
    shared_tasks: sharedTasks = [],
    orbit_achievements: orbitAchievements = [],
    recent_achievement_unlocks: recentAchievementUnlocks = [],
    active_rewards: activeRewards = [],
    redeemed_rewards: redeemedRewards = [],
    health_score: healthScore = 0,
    health_trend: healthTrend = "stable",
    health_change: healthChange = 0,
    health_breakdown: healthBreakdown = {},
    health_summary: healthSummary = "",
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
  const showPatrols = orbit.template === "scout_troop" || patrols.length > 0;

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

      <section style={styles.healthCard}>
        <div style={s.row}>
          <div><span style={styles.heroLabel}>Orbit Health</span><h2 style={styles.healthScore}>{healthScore}/100</h2></div>
          <span style={{...styles.healthTrend, color:healthTrend === "up" ? "var(--success)" : healthTrend === "down" ? "var(--danger)" : "var(--text-muted)"}}>{healthTrend === "up" ? "↑" : healthTrend === "down" ? "↓" : "→"} {healthChange > 0 ? "+" : ""}{healthChange}</span>
        </div>
        <ProgressBar percent={healthScore} />
        <p style={s.muted}>{healthSummary}</p>
        <div style={styles.healthBreakdown}>
          {[["Completion", "completion", 40], ["Members", "members", 25], ["Challenges", "challenges", 15], ["Streaks", "streaks", 10], ["Activity", "activity", 10]].map(([label, key, max]) => <div key={key} style={styles.healthMetric}><span style={styles.smallLabel}>{label}</span><strong>{healthBreakdown[key] || 0}/{max}</strong></div>)}
        </div>
      </section>

      <div style={{...s.row, marginTop:24}}><h2 style={{...s.sectionTitle, margin:0}}>Seasons</h2>{canManage && <button style={s.secondaryButton} onClick={() => openSeasonForm()}>Create season</button>}</div>
      {showSeasonForm && <form style={{...s.card, marginTop:16}} onSubmit={saveSeason}>
        <h3 style={s.name}>{editingSeason ? "Edit season" : "New season"}</h3>
        <label style={s.label}>Title</label><input style={s.input} value={seasonTitle} onChange={event => setSeasonTitle(event.target.value)} maxLength={120}/>
        <label style={s.label}>Description</label><input style={s.input} value={seasonDescription} onChange={event => setSeasonDescription(event.target.value)} maxLength={1000}/>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:16}}>
          <div><label style={s.label}>Start date</label><input style={s.input} type="date" value={seasonStartDate} onChange={event => setSeasonStartDate(event.target.value)}/></div>
          <div><label style={s.label}>End date</label><input style={s.input} type="date" value={seasonEndDate} onChange={event => setSeasonEndDate(event.target.value)}/></div>
        </div>
        <div style={s.actions}><button type="button" style={s.secondaryButton} onClick={() => { setShowSeasonForm(false); setEditingSeason(null); }}>Cancel</button><button style={s.button} disabled={busy || !seasonTitle.trim()}>Save</button></div>
      </form>}
      {seasons.length ? <div style={{...s.cardStack, marginTop:16}}>{seasons.map(season => <section key={season.id} style={s.card}>
        <div style={s.row}>
          <div><h3 style={s.name}>{season.title}</h3>{season.description && <p style={s.muted}>{season.description}</p>}<p style={s.muted}>{season.start_date} → {season.end_date}</p></div>
          <span style={s.badge}>{season.days_remaining}d left</span>
        </div>
        <div style={styles.seasonMetricGrid}>
          <StatCard Icon={Trophy} label="Challenges" value={season.challenge_count || 0} />
          <StatCard Icon={CalendarDays} label="Events" value={season.event_count || 0} />
          <StatCard Icon={Flag} label="Milestones" value={season.milestone_count || 0} />
          <StatCard Icon={Zap} label="Rewards" value={season.reward_count || 0} />
        </div>
        {canManage && <div style={s.actions}><button style={s.secondaryButton} onClick={() => openSeasonForm(season)}>Edit</button><button style={s.secondaryButton} onClick={() => deleteSeason(season)}>Archive</button></div>}
      </section>)}</div> : <section style={{...s.card, ...s.empty, marginTop:16}}><CalendarDays size={40}/><h3>No seasons yet</h3><p>Create a time-bound season to group challenges, events, rewards, and milestones.</p></section>}

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

      {showPatrols && <>
        <ParentDashboardCard parentDashboard={parentDashboard} />
        <TroopMilestonesCard milestones={troopMilestones} />
        <div style={{...s.row, marginTop:24}}><h2 style={{...s.sectionTitle, margin:0}}>Patrols</h2>{canManage && <button style={s.secondaryButton} onClick={() => setShowPatrolForm((value) => !value)}>Create patrol</button>}</div>
        {patrolLeaderboard.length > 0 && <section style={{...s.card, marginTop:16}}>
          <h3 style={s.name}>Patrol Leaderboard</h3>
          {patrolLeaderboard.slice(0, 5).map(item => <div key={item.patrol_id} style={styles.patrolLeaderboardRow}>
            <strong style={{color:item.rank === 1 ? "var(--primary-dark)" : "var(--muted)", width:38}}>#{item.rank}</strong>
            <div style={{flex:1}}><strong>{item.patrol_name}</strong><p style={s.muted}>{item.member_count} member{item.member_count === 1 ? "" : "s"} · {item.average_xp} avg XP</p></div>
            <strong style={{color:"var(--primary-dark)"}}>{item.total_xp} XP</strong>
          </div>)}
        </section>}
        {showPatrolForm && <form style={{...s.card, marginTop:16}} onSubmit={createPatrol}>
          <h3 style={s.name}>New patrol</h3>
          <label style={s.label}>Name</label><input style={s.input} value={patrolName} onChange={event => setPatrolName(event.target.value)} maxLength={80}/>
          <label style={s.label}>Description</label><input style={s.input} value={patrolDescription} onChange={event => setPatrolDescription(event.target.value)} maxLength={500}/>
          <div style={s.actions}><button type="button" style={s.secondaryButton} onClick={() => setShowPatrolForm(false)}>Cancel</button><button style={s.button} disabled={busy || !patrolName.trim()}>Create</button></div>
        </form>}
        {patrols.length ? <div style={{...s.cardStack, marginTop:16}}>{patrols.map(patrol => {
          const unassignedMembers = members.filter(member => member.patrol_id !== patrol.id);
          return <section key={patrol.id} style={s.card}>
            <div style={s.row}><div><h3 style={s.name}>{patrol.name}</h3>{patrol.description && <p style={s.muted}>{patrol.description}</p>}</div><span style={s.badge}>{patrol.member_count || 0} members</span></div>
            {patrol.leader && <p style={s.muted}><strong>Leader:</strong> {patrol.leader.display_name || patrol.leader.name || patrol.leader.username}</p>}
            {(patrol.members || []).map(member => <div key={member.user_id} style={styles.patrolMemberRow}>
              <UserAvatar user={member.user} size={32} style={styles.avatar} />
              <span style={{flex:1}}>{member.user?.display_name || member.user?.name || member.user?.username || "Member"}</span>
              {canManage && <button style={s.secondaryButton} disabled={busy} onClick={() => removePatrolMember(patrol, member.user_id)}>Remove</button>}
            </div>)}
            {canManage && <div style={s.actions}>
              <select style={s.input} defaultValue="" onChange={event => { assignPatrolMember(patrol, event.target.value); event.target.value = ""; }} disabled={busy || !unassignedMembers.length}>
                <option value="">Assign member...</option>
                {unassignedMembers.map(member => <option key={member.user_id} value={member.user_id}>{member.user?.display_name || member.user?.name || member.user?.username || "Member"}</option>)}
              </select>
              <button style={s.secondaryButton} disabled={busy} onClick={() => deletePatrol(patrol)}>Delete</button>
            </div>}
          </section>;
        })}</div> : <section style={{...s.card, ...s.empty, marginTop:16}}><Users size={40}/><h3>No patrols yet</h3><p>Create patrols to organize this Scout Troop Orbit.</p></section>}
      </>}

      <div style={{...s.row, marginTop:24}}><h2 style={{...s.sectionTitle, margin:0}}>Orbit Events</h2>{canManage && <button style={s.secondaryButton} onClick={() => openEventForm()}>Create event</button>}</div>
      {showEventForm && <form style={{...s.card, marginTop:16}} onSubmit={saveEvent}>
        <h3 style={s.name}>{editingEvent ? "Edit Orbit event" : "New Orbit event"}</h3>
        <label style={s.label}>Title</label><input style={s.input} value={eventTitle} onChange={event => setEventTitle(event.target.value)} maxLength={120}/>
        <label style={s.label}>Description</label><input style={s.input} value={eventDescription} onChange={event => setEventDescription(event.target.value)} maxLength={1000}/>
        <label style={s.label}>Location</label><input style={s.input} value={eventLocation} onChange={event => setEventLocation(event.target.value)} maxLength={240}/>
        <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:16}}>
          <div><label style={s.label}>Start</label><input style={s.input} type="datetime-local" value={eventStart} onChange={event => setEventStart(event.target.value)}/></div>
          <div><label style={s.label}>End optional</label><input style={s.input} type="datetime-local" value={eventEnd} onChange={event => setEventEnd(event.target.value)}/></div>
        </div>
        {!!seasons.length && <><label style={s.label}>Season</label><select style={s.input} value={eventSeasonId} onChange={event => setEventSeasonId(event.target.value)}><option value="">None</option>{seasons.map(season => <option key={season.id} value={season.id}>{season.title}</option>)}</select></>}
        <div style={s.actions}><button type="button" style={s.secondaryButton} onClick={() => { setShowEventForm(false); setEditingEvent(null); }}>Cancel</button><button style={s.button} disabled={busy || !eventTitle.trim() || !eventStart.trim()}>Save</button></div>
      </form>}
      {events.length ? <div style={{...s.cardStack, marginTop:16}}>{events.map(event => <React.Fragment key={event.id}>
        <OrbitEventCard
          event={event}
          readiness={readinessByEvent[event.id]}
          patrolReadiness={patrolReadinessByEvent[event.id]}
          canManage={canManage}
          busy={busy}
          onEdit={() => openEventForm(event)}
          onDelete={() => deleteEvent(event)}
          onRsvp={(status) => rsvpEvent(event, status)}
          onCreateReadiness={() => openReadinessForm(event)}
          onEditReadiness={(item) => openReadinessForm(event, item)}
          onDeleteReadiness={(item) => deleteReadinessItem(event, item)}
          onToggleReadiness={(item) => toggleReadinessItem(event, item)}
        />
        {readinessForm?.event?.id === event.id && <form style={s.card} onSubmit={saveReadinessItem}>
          <h3 style={s.name}>{readinessForm.item ? "Edit readiness item" : "New readiness item"}</h3>
          <label style={s.label}>Title</label><input style={s.input} value={readinessTitle} onChange={event => setReadinessTitle(event.target.value)} maxLength={140}/>
          <label style={s.label}>Description</label><input style={s.input} value={readinessDescription} onChange={event => setReadinessDescription(event.target.value)} maxLength={500}/>
          <label style={{...s.label, display:"flex", gap:10, alignItems:"center"}}><input type="checkbox" checked={readinessRequired} onChange={event => setReadinessRequired(event.target.checked)}/> Required for readiness percentage</label>
          <div style={s.actions}><button type="button" style={s.secondaryButton} onClick={() => setReadinessForm(null)}>Cancel</button><button style={s.button} disabled={busy || !readinessTitle.trim()}>Save</button></div>
        </form>}
      </React.Fragment>)}</div> : <section style={{...s.card, ...s.empty, marginTop:16}}><CalendarDays size={40}/><h3>No Orbit events</h3><p>Add meetings, campouts, workouts, or study sessions for this Orbit.</p></section>}

      <div style={{...s.row, marginTop:24}}><h2 style={{...s.sectionTitle, margin:0}}>Orbit Rewards</h2>{canManage && <button style={s.secondaryButton} onClick={() => openRewardForm()}>Create reward</button>}</div>
      {showRewardForm && <form style={{...s.card, marginTop:16}} onSubmit={saveReward}>
        <h3 style={s.name}>{editingReward ? "Edit Orbit reward" : "New Orbit reward"}</h3>
        <label style={s.label}>Title</label><input style={s.input} value={rewardTitle} onChange={event => setRewardTitle(event.target.value)} maxLength={100}/>
        <label style={s.label}>Description</label><input style={s.input} value={rewardDescription} onChange={event => setRewardDescription(event.target.value)} maxLength={500}/>
        <label style={s.label}>XP cost</label><input style={s.input} type="number" min="1" value={rewardCost} onChange={event => setRewardCost(event.target.value)}/>
        {!!seasons.length && <><label style={s.label}>Season</label><select style={s.input} value={rewardSeasonId} onChange={event => setRewardSeasonId(event.target.value)}><option value="">None</option>{seasons.map(season => <option key={season.id} value={season.id}>{season.title}</option>)}</select></>}
        <div style={s.actions}><button type="button" style={s.secondaryButton} onClick={() => { setShowRewardForm(false); setEditingReward(null); }}>Cancel</button><button style={s.button} disabled={busy || !rewardTitle.trim() || Number(rewardCost) < 1}>Save</button></div>
      </form>}
      {activeRewards.length ? <div style={{...s.cardStack, marginTop:16}}>{activeRewards.map(reward => <OrbitRewardCard key={reward.id} reward={reward} canManage={canManage} busy={busy} onEdit={() => openRewardForm(reward)} onDelete={() => deleteReward(reward)} onRedeem={() => redeemReward(reward)} />)}</div> : <section style={{...s.card, ...s.empty, marginTop:16}}><h3>No Orbit rewards</h3><p>Create a shared reward worth working toward together.</p></section>}
      {redeemedRewards.length > 0 && <><p style={{...styles.smallLabel, marginTop:20}}>Redeemed</p><div style={s.cardStack}>{redeemedRewards.slice(0, 3).map(reward => <OrbitRewardCard key={reward.id} reward={reward} canManage={false} busy={null} />)}</div></>}

      <h2 style={s.sectionTitle}>Orbit Achievements</h2>
      {recentAchievementUnlocks.length > 0 && <section style={{...s.card, marginBottom:16}}>
        <p style={styles.smallLabel}>Recent unlocks</p>
        {recentAchievementUnlocks.map(achievement => <div key={achievement.id} style={styles.achievementUnlock}>
          <Trophy size={24} color={achievement.color || "var(--primary)"} />
          <div><strong>{achievement.name}</strong><p style={{...s.muted, margin:"4px 0 0"}}>{achievement.description}</p></div>
        </div>)}
      </section>}
      <section style={s.card}>
        {orbitAchievements.length ? orbitAchievements.map(achievement => <div key={achievement.id} style={styles.achievementRow}>
          <div style={s.row}><strong>{achievement.earned ? "✓ " : ""}{achievement.name}</strong><span style={s.muted}>{achievement.progress} / {achievement.target}</span></div>
          <ProgressBar percent={achievement.percent || 0} />
        </div>) : <p style={s.muted}>Orbit achievement progress will appear as members build momentum.</p>}
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

      <h2 style={s.sectionTitle}>AI Orbit Coach</h2>
      <section style={s.card}>
        {orbitRecaps[0]?.ai_insights ? <OrbitAIInsights insights={orbitRecaps[0].ai_insights} /> : <p style={s.muted}>Get practical coaching based on this Orbit's participation, progress, streaks, and challenges.</p>}
        {orbitRecaps[0]?.ai_insights_generated_at && <p style={styles.progressCaption}>Last generated {new Date(orbitRecaps[0].ai_insights_generated_at).toLocaleString()}</p>}
        {insightsError && <p style={{color:"var(--danger)", fontWeight:700}}>{insightsError}</p>}
        <button style={{...s.button, marginTop:14}} disabled={busy} onClick={generateOrbitAIInsights}>
          {busy === "orbit-ai-insights" ? "Generating..." : orbitRecaps[0]?.ai_insights ? "Refresh Insights" : "Generate Insights"}
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

function OrbitRewardCard({ reward, canManage, busy, onEdit, onDelete, onRedeem }) {
  return <section style={s.card}>
    <div style={s.row}><h3 style={s.name}>{reward.title}</h3><span style={s.badge}>{reward.redeemed ? "redeemed" : `${reward.xp_cost} XP`}</span></div>
    {reward.description && <p style={s.muted}>{reward.description}</p>}
    <ProgressBar percent={reward.progress_percent || 0} />
    <p style={styles.progressCaption}>{reward.progress_xp || 0} / {reward.xp_cost} XP</p>
    {canManage && !reward.redeemed && <div style={s.actions}>
      <button style={s.secondaryButton} disabled={busy} onClick={onEdit}>Edit</button>
      <button style={s.secondaryButton} disabled={busy} onClick={onDelete}>Delete</button>
      {reward.redeemable && <button style={s.button} disabled={busy} onClick={onRedeem}>Redeem</button>}
    </div>}
  </section>;
}

function ParentDashboardCard({ parentDashboard }) {
  if (!parentDashboard) {
    return <section style={{...s.card, marginTop:16}}>
      <div style={s.row}>
        <div>
          <h3 style={s.name}>Parent Dashboard</h3>
          <p style={s.muted}>Loading troop visibility...</p>
        </div>
        <Users color="var(--primary-dark)" />
      </div>
    </section>;
  }
  const events = parentDashboard.upcoming_events || [];
  const patrols = parentDashboard.patrols || [];
  const challenges = parentDashboard.challenges || [];
  const activity = parentDashboard.recent_activity || [];
  return <section style={{...s.card, marginTop:16}}>
    <div style={s.row}>
      <div>
        <p style={s.eyebrow}>Read-only troop view</p>
        <h3 style={s.name}>Parent Dashboard</h3>
        <p style={s.muted}>Upcoming events, readiness, patrol progress, and recent troop activity.</p>
      </div>
      <Users color="var(--primary-dark)" />
    </div>
    <div style={styles.parentDashboardGrid}>
      <div>
        <strong>Upcoming events</strong>
        {events.length ? events.map(event => <p key={event.id} style={s.muted}>
          {event.title}: {event.readiness_percent ?? 0}% ready{event.viewer_rsvp ? ` · ${event.viewer_rsvp}` : ""}{event.location ? ` · ${event.location}` : ""}
        </p>) : <p style={s.muted}>No upcoming events.</p>}
      </div>
      <div>
        <strong>Patrol standings</strong>
        {patrols.length ? patrols.slice(0, 5).map(patrol => <p key={patrol.id} style={s.muted}>
          {patrol.leaderboard_rank ? `#${patrol.leaderboard_rank} ` : ""}{patrol.name}: {patrol.readiness_percent == null ? "No readiness yet" : `${patrol.readiness_percent}% ready`}
        </p>) : <p style={s.muted}>No patrols yet.</p>}
      </div>
      <div>
        <strong>Active challenges</strong>
        {challenges.length ? challenges.map(challenge => <p key={challenge.id} style={s.muted}>
          {challenge.title}: {challenge.progress_percent}%
        </p>) : <p style={s.muted}>No active challenges.</p>}
      </div>
      <div>
        <strong>Recent activity</strong>
        {activity.length ? activity.slice(0, 4).map(item => <p key={item.id} style={s.muted}>
          {item.message || item.type || "Orbit activity"}
        </p>) : <p style={s.muted}>No recent activity.</p>}
      </div>
    </div>
  </section>;
}

function TroopMilestonesCard({ milestones }) {
  return <section style={{...s.card, marginTop:16}}>
    <div style={s.row}>
      <div>
        <p style={s.eyebrow}>Scout Troop</p>
        <h3 style={s.name}>Troop Milestones</h3>
        <p style={s.muted}>Celebrate campouts, service projects, patrol readiness, and troop XP.</p>
      </div>
      <Flag color="var(--primary-dark)" />
    </div>
    {milestones.length ? <div style={styles.troopMilestoneList}>
      {milestones.map(milestone => {
        const percent = milestone.target ? Math.min(100, Math.round((milestone.progress / milestone.target) * 100)) : 0;
        return <div key={milestone.id} style={styles.troopMilestoneRow}>
          <div style={{...styles.troopMilestoneIcon, opacity: milestone.unlocked ? 1 : 0.55}}>
            {milestone.unlocked ? "OK" : "LOCK"}
          </div>
          <div style={{flex:1}}>
            <div style={s.row}>
              <strong>{milestone.title}</strong>
              <strong style={{color: milestone.unlocked ? "var(--primary-dark)" : "var(--muted)"}}>
                {milestone.unlocked ? "Unlocked" : "Locked"}
              </strong>
            </div>
            <p style={s.muted}>{milestone.description}</p>
            <ProgressBar percent={percent} />
            <p style={styles.progressCaption}>
              {milestone.progress} / {milestone.target}{milestone.unlocked_at ? ` · Unlocked ${new Date(milestone.unlocked_at).toLocaleDateString()}` : ""}
            </p>
          </div>
        </div>;
      })}
    </div> : <p style={s.muted}>Troop milestone progress will appear here after the next sync.</p>}
  </section>;
}

function OrbitEventCard({
  event,
  readiness,
  patrolReadiness,
  canManage,
  busy,
  onEdit,
  onDelete,
  onRsvp,
  onCreateReadiness,
  onEditReadiness,
  onDeleteReadiness,
  onToggleReadiness,
}) {
  const counts = event.rsvp_counts || {};
  const start = event.start_time ? new Date(event.start_time).toLocaleString() : "Time TBD";
  const end = event.end_time ? new Date(event.end_time).toLocaleString() : null;
  const items = readiness?.items || [];
  const patrolItems = patrolReadiness?.items || [];
  return <section style={s.card}>
    <div style={s.row}>
      <div>
        <h3 style={s.name}>{event.title}</h3>
        <p style={s.muted}>{start}{end ? ` - ${end}` : ""}</p>
      </div>
      <CalendarDays color="var(--primary-dark)" />
    </div>
    {event.location && <p style={s.muted}><strong>Location:</strong> {event.location}</p>}
    {event.description && <p style={s.muted}>{event.description}</p>}
    <p style={styles.progressCaption}>{counts.attending || 0} attending · {counts.maybe || 0} maybe · {counts.declined || 0} declined</p>
    <div style={s.actions}>
      {RSVP_OPTIONS.map(([value, label]) => <button key={value} style={event.viewer_rsvp === value ? s.button : s.secondaryButton} disabled={busy} onClick={() => onRsvp(value)}>{event.viewer_rsvp === value ? `✓ ${label}` : label}</button>)}
    </div>
    {canManage && <div style={s.actions}>
      <button style={s.secondaryButton} disabled={busy} onClick={onEdit}>Edit</button>
      <button style={s.secondaryButton} disabled={busy} onClick={onDelete}>Delete</button>
    </div>}
    <div style={{...s.row, marginTop:18}}>
      <div><h4 style={{...s.name, fontSize:18}}>Readiness checklist</h4><p style={s.muted}>{readiness ? `${readiness.readiness_percent}% ready · ${readiness.completed_count}/${readiness.total_count}` : "Loading readiness..."}</p></div>
      {canManage && <button style={s.secondaryButton} disabled={busy} onClick={onCreateReadiness}>Add item</button>}
    </div>
    {readiness && <ProgressBar percent={readiness.readiness_percent || 0} />}
    {items.length ? <div style={styles.readinessList}>{items.map(item => <div key={item.id} style={styles.readinessRow}>
      <button style={styles.checkButton} disabled={busy} onClick={() => onToggleReadiness(item)}>{item.completed ? "☑" : "☐"}</button>
      <div style={{flex:1}}><strong>{item.title}</strong><p style={s.muted}>{item.required ? "Required" : "Optional"}{item.description ? ` · ${item.description}` : ""}</p></div>
      {canManage && <div style={s.actions}><button style={s.secondaryButton} disabled={busy} onClick={() => onEditReadiness(item)}>Edit</button><button style={s.secondaryButton} disabled={busy} onClick={() => onDeleteReadiness(item)}>Delete</button></div>}
    </div>)}</div> : <p style={s.muted}>No readiness items yet.</p>}
    {canManage && readiness?.member_readiness?.length ? <div style={styles.memberReadiness}>
      <strong>Member readiness</strong>
      {readiness.member_readiness.slice(0, 6).map(member => <p key={member.user_id} style={s.muted}>{member.user?.display_name || member.user?.name || member.user?.username || "Member"}: {member.readiness_percent}% ({member.completed_count}/{member.total_count})</p>)}
    </div> : null}
    {patrolItems.length ? <div style={styles.memberReadiness}>
      <strong>Patrol readiness</strong>
      {patrolItems.slice(0, 5).map(patrol => <div key={patrol.patrol_id} style={styles.patrolRollupRow}>
        <div style={{flex: 1}}>
          <div style={s.row}>
            <strong>{patrol.patrol_name}</strong>
            <strong style={{color: "var(--primary-dark)"}}>{patrol.readiness_percent}%</strong>
          </div>
          <p style={s.muted}>
            {patrol.completed_count}/{patrol.required_count} ready · {patrol.member_count} {patrol.member_count === 1 ? "member" : "members"}
          </p>
          {patrol.items?.slice(0, 3).map(item => <p key={item.item_id} style={styles.patrolItemSummary}>
            {item.title}: {item.completed_count}/{item.required_count} ({item.readiness_percent}%)
          </p>)}
        </div>
      </div>)}
    </div> : null}
  </section>;
}

function OrbitAIInsights({ insights }) {
  const sections = [["Strengths", insights.strengths], ["Risks", insights.risks], ["Opportunities", insights.opportunities], ["Recommendations", insights.recommendations]];
  const challenge = insights.suggested_challenge;
  return <div style={styles.orbitAIRecap}>
    <p style={{margin:0}}>{insights.summary}</p>
    {insights.health_explanation && <div><strong>Health explanation</strong><p>{insights.health_explanation}</p></div>}
    {sections.map(([label, items]) => items?.length ? <div key={label}>
      <strong>{label}</strong>
      <ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul>
    </div> : null)}
    {challenge && <div><strong style={{color:"var(--primary-dark)"}}>Suggested challenge: {typeof challenge === "string" ? challenge : challenge.title}</strong>{typeof challenge === "object" && challenge.description && <p>{challenge.description}</p>}</div>}
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
  healthCard: { background:"var(--surface)", border:"1px solid var(--border)", borderRadius:18, padding:20, marginTop:16 },
  healthScore: { margin:"5px 0 12px", fontSize:34, color:"var(--text)" },
  healthTrend: { fontWeight:850, fontSize:16 },
  healthBreakdown: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(100px, 1fr))", gap:12, marginTop:16 },
  healthMetric: { display:"grid", gap:4 },
  seasonMetricGrid: { display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(120px, 1fr))", gap:12, marginTop:16 },
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
  readinessList: { display:"grid", gap:10, marginTop:14 },
  readinessRow: { display:"flex", alignItems:"flex-start", gap:12, paddingTop:12, borderTop:"1px solid var(--border)" },
  checkButton: { border:0, background:"transparent", color:"var(--primary-dark)", cursor:"pointer", fontSize:24, lineHeight:1 },
  memberReadiness: { display:"grid", gap:4, marginTop:14, paddingTop:14, borderTop:"1px solid var(--border)" },
  patrolRollupRow: { display:"flex", gap:12, paddingTop:10, marginTop:6, borderTop:"1px solid var(--border)" },
  patrolItemSummary: { margin:"4px 0 0", color:"var(--muted)", fontSize:12, fontWeight:700 },
  achievementUnlock: { display:"flex", alignItems:"center", gap:12, marginTop:14 },
  achievementIcon: { fontSize:24, lineHeight:1 },
  achievementRow: { display:"grid", gap:8, marginBottom:16 },
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
  patrolMemberRow: { display: "flex", alignItems: "center", gap: 12, marginTop: 10 },
  patrolLeaderboardRow: { display: "flex", alignItems: "center", gap: 12, paddingTop: 12, marginTop: 12, borderTop: "1px solid var(--border)" },
  parentDashboardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 16 },
  troopMilestoneList: { display: "grid", gap: 12, marginTop: 16 },
  troopMilestoneRow: { display: "flex", alignItems: "flex-start", gap: 12, paddingTop: 12, borderTop: "1px solid var(--border)" },
  troopMilestoneIcon: { width: 42, height: 42, borderRadius: 999, display: "grid", placeItems: "center", background: "color-mix(in srgb, var(--primary) 14%, transparent)", color: "var(--primary-dark)", flex: "0 0 auto" },
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
