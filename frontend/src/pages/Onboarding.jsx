import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Compass,
  Home,
  Rocket,
  School,
  Tent,
  Trophy,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { onboardingApi, orbitApi } from "@/lib/api";
import { useAppState } from "@/context/AppStateContext";

const GOALS = [
  { id: "family", title: "Family Accountability", template: "family" },
  { id: "scout", title: "Scout Troop", template: "scout_troop" },
  { id: "accountability", title: "Accountability Group", template: "accountability_circle" },
  { id: "fitness", title: "Fitness Goals", template: "fitness_group" },
  { id: "study", title: "Study Group", template: "study_group" },
  { id: "couples", title: "Couples", template: "couples" },
  { id: "personal", title: "Personal Growth", template: "blank" },
];

const TEMPLATES = [
  {
    id: "family",
    title: "Family",
    icon: Home,
    placeholder: "Williams Family",
    description: "Shared goals, chores, rewards, and family accountability.",
  },
  {
    id: "scout_troop",
    title: "Scout Troop",
    icon: Tent,
    placeholder: "Troop 123",
    description: "Meetings, campouts, service projects, leadership, and troop accountability.",
  },
  {
    id: "accountability_circle",
    title: "Accountability Circle",
    icon: Users,
    placeholder: "Morning Momentum",
    description: "Weekly check-ins, shared goals, and group accountability.",
  },
  {
    id: "fitness_group",
    title: "Fitness Group",
    icon: Trophy,
    placeholder: "Saturday Striders",
    description: "Workouts, step goals, fitness challenges, and team motivation.",
  },
  {
    id: "study_group",
    title: "Study Group",
    icon: School,
    placeholder: "Exam Prep Crew",
    description: "Study sessions, reading goals, exam prep, and group focus.",
  },
  {
    id: "couples",
    title: "Couples",
    icon: "💕",
    placeholder: "Our Shared Orbit",
    description: "Strengthen your relationship with shared goals, date nights, gratitude, and milestones.",
  },
  {
    id: "blank",
    title: "Blank Orbit",
    icon: Compass,
    placeholder: "My Orbit",
    description: "Start with an empty Orbit and customize everything yourself.",
    secondary: true,
  },
];

const SUCCESS_ACTIONS = {
  family: ["Invite family members", "Review starter challenges", "Review starter rewards"],
  scout_troop: ["Invite leaders", "Create first event", "Review patrols"],
  accountability_circle: ["Invite members", "Schedule check-in"],
  fitness_group: ["Invite workout partners", "Review challenges"],
  study_group: ["Invite study group", "Schedule study session"],
  couples: ["Invite your partner", "Review starter rewards", "Schedule your first date night", "Review shared goals"],
  blank: ["Invite a member", "Create your first challenge", "Add an event"],
};

const INVITE_MESSAGES = {
  family: "Invite family members.",
  scout_troop: "Invite leaders, parents, and scouts.",
  accountability_circle: "Invite accountability partners.",
  fitness_group: "Invite workout partners.",
  study_group: "Invite study group members.",
  couples: "Invite your partner.",
  blank: "Invite members into your Orbit.",
};

const REWARD_SUGGESTIONS = {
  family: [
    "Family Movie Night",
    "Pizza Night",
    "Choose Dinner",
    "Extra Screen Time",
    "Family Activity Choice",
  ],
  scout_troop: [
    "Troop Recognition",
    "Patrol Pizza Party",
    "Campout Privilege",
    "Patrol Choice Activity",
    "Custom Troop Reward",
  ],
  accountability_circle: [
    "Group Celebration",
    "Accountability Champion",
    "Consistency Award",
  ],
  fitness_group: [
    "Group Workout Celebration",
    "Fitness Champion",
    "Team Achievement Award",
  ],
  study_group: [
    "Study Streak Award",
    "Group Celebration",
    "Focus Champion",
  ],
  couples: [
    "Date Night Choice",
    "Favorite Restaurant Night",
    "Weekend Adventure",
    "Special Celebration",
  ],
  blank: [
    "Group Celebration",
    "Milestone Reward",
    "Team Choice Reward",
  ],
};

const CUSTOM_REWARD_PLACEHOLDERS = {
  family: "Ice cream trip",
  scout_troop: "Patrol pizza party",
  fitness_group: "Group celebration meal",
  study_group: "Exam celebration",
  couples: "Weekend adventure",
  accountability_circle: "Coffee shop celebration",
  blank: "Group celebration",
};

const HABIT_SUGGESTIONS = {
  family: ["Daily Reading", "Chores", "Family Dinner"],
  scout_troop: ["Physical Fitness", "Scout Skill Practice", "Daily Scout Spirit"],
  accountability_circle: ["Daily Check-In", "Goal Progress", "Encouragement"],
  fitness_group: ["Workout", "Stretching", "Hydration"],
  study_group: ["Reading", "Study Session", "Practice Questions"],
  couples: ["Gratitude", "Quality Time", "Shared Goal Progress"],
  blank: ["Check-In", "Practice", "Progress"],
};

const TASK_SUGGESTIONS = {
  family: ["Homework", "Chores", "Room Cleaning"],
  scout_troop: ["Permission Slips", "Medical Forms", "Gear Check"],
  accountability_circle: ["Weekly Reflection", "Next Step", "Goal Review"],
  fitness_group: ["Weekly Weigh-In", "Workout Plan Review"],
  study_group: ["Study Materials Ready", "Practice Exam"],
  couples: ["Date Night Planning", "Shared Goal Review"],
  blank: ["Plan First Goal", "Invite Members", "Review Progress"],
};

const EVENT_SETUP = {
  family: {
    prompt: "Would you like to create your first family event?",
    intro: "These are suggestions. Pick one and add the real date when your family is ready.",
    options: [
      { key: "family_vacation", action: "Create Family Vacation", defaultTitle: "Family Vacation", time: "09:00", readiness: ["Packing Complete"] },
      { key: "family_meeting", action: "Create Family Meeting", defaultTitle: "Family Meeting", time: "18:00", readiness: [] },
      { key: "family_activity", action: "Create Family Activity", defaultTitle: "Family Activity", time: "14:00", readiness: [] },
    ],
  },
  scout_troop: {
    prompt: "Let's get your troop started.",
    intro: "Create a real first event now, or skip and add one later from the Orbit.",
    options: [
      { key: "troop_meeting", action: "Create Troop Meeting", defaultTitle: "Troop Meeting", time: "19:00", readiness: [] },
      { key: "campout", action: "Create Campout", defaultTitle: "Campout", time: "17:00", includeEndDate: true, readiness: ["Permission Slip", "Medical Form", "Packing Complete", "Transportation Confirmed"] },
      { key: "service_project", action: "Create Service Project", defaultTitle: "Service Project", time: "09:00", readiness: ["Volunteers Assigned", "Materials Ready", "Tools Ready"] },
    ],
  },
  accountability_circle: {
    prompt: "Would you like to schedule your first check-in?",
    intro: "Use this to put your first real group touchpoint on the calendar.",
    options: [
      { key: "weekly_check_in", action: "Create Weekly Check-In", defaultTitle: "Weekly Check-In", time: "18:00", readiness: ["Goal Update Submitted", "Progress Reflection Completed", "Next Step Chosen"] },
      { key: "monthly_goal_review", action: "Create Monthly Goal Review", defaultTitle: "Monthly Goal Review", time: "18:00", readiness: [] },
    ],
  },
  fitness_group: {
    prompt: "Would you like to schedule your first workout event?",
    intro: "Pick a real workout or prep event to get the group moving.",
    options: [
      { key: "group_workout", action: "Create Group Workout", defaultTitle: "Group Workout", time: "07:00", readiness: [] },
      { key: "race_prep", action: "Create Race Prep", defaultTitle: "Race or Event Prep", time: "08:00", readiness: ["Training Plan Started", "Gear Ready", "Registration Complete", "Hydration Plan Ready"] },
      { key: "fitness_check_in", action: "Create Fitness Check-In", defaultTitle: "Fitness Check-In", time: "18:00", readiness: [] },
    ],
  },
  study_group: {
    prompt: "Would you like to schedule your first study session?",
    intro: "Put a real study session or exam prep meeting on the calendar.",
    options: [
      { key: "study_session", action: "Create Study Session", defaultTitle: "Study Session", time: "18:00", readiness: [] },
      { key: "exam_prep", action: "Create Exam Prep", defaultTitle: "Exam Prep Session", time: "18:00", readiness: ["Reading Complete", "Notes Reviewed", "Practice Questions Complete", "Study Materials Ready"] },
      { key: "reading_group", action: "Create Reading Group", defaultTitle: "Reading Group", time: "18:00", readiness: [] },
    ],
  },
  couples: {
    prompt: "Would you like to schedule your first date night?",
    intro: "Create a real shared event now, or skip and add it later.",
    options: [
      { key: "date_night", action: "Create Date Night", defaultTitle: "Date Night", time: "19:00", readiness: ["Reservation Made", "Childcare Arranged", "Plans Confirmed"] },
      { key: "goal_review", action: "Create Goal Review", defaultTitle: "Shared Goal Review", time: "18:00", readiness: [] },
      { key: "weekend_adventure", action: "Create Weekend Adventure", defaultTitle: "Weekend Adventure", time: "09:00", includeEndDate: true, readiness: ["Destination Chosen", "Packing Complete", "Reservations Confirmed"] },
    ],
  },
  blank: {
    prompt: "Would you like to create your first event?",
    intro: "Add a real event now, or skip and customize your Orbit later.",
    options: [
      { key: "first_event", action: "Create First Event", defaultTitle: "First Orbit Event", time: "18:00", readiness: [] },
    ],
  },
};

const CHALLENGE_SUGGESTIONS = {
  family: [
    { title: "Family Consistency Challenge", goal_type: "actions", goal_value: 30, reward_xp: 300, duration_days: 30 },
    { title: "Reading Challenge", goal_type: "habits", goal_value: 20, reward_xp: 250, duration_days: 30 },
    { title: "Chore Completion Challenge", goal_type: "tasks", goal_value: 20, reward_xp: 250, duration_days: 30 },
  ],
  scout_troop: [
    { title: "Service Hours Challenge", goal_type: "actions", goal_value: 40, reward_xp: 500, duration_days: 60 },
    { title: "Physical Fitness Challenge", goal_type: "habits", goal_value: 30, reward_xp: 350, duration_days: 30 },
    { title: "Camping Preparation Challenge", goal_type: "tasks", goal_value: 35, reward_xp: 400, duration_days: 45 },
  ],
  accountability_circle: [
    { title: "Weekly Check-In Challenge", goal_type: "actions", goal_value: 12, reward_xp: 250, duration_days: 30 },
    { title: "Consistency Challenge", goal_type: "habits", goal_value: 21, reward_xp: 300, duration_days: 30 },
  ],
  fitness_group: [
    { title: "Weekly Workout Challenge", goal_type: "habits", goal_value: 20, reward_xp: 300, duration_days: 30 },
    { title: "Step Goal Challenge", goal_type: "actions", goal_value: 50, reward_xp: 350, duration_days: 30 },
    { title: "Monthly Fitness Goal", goal_type: "tasks", goal_value: 25, reward_xp: 400, duration_days: 30 },
  ],
  study_group: [
    { title: "Weekly Study Challenge", goal_type: "habits", goal_value: 20, reward_xp: 300, duration_days: 30 },
    { title: "Reading Goal Challenge", goal_type: "tasks", goal_value: 15, reward_xp: 250, duration_days: 30 },
    { title: "Exam Prep Challenge", goal_type: "tasks", goal_value: 25, reward_xp: 400, duration_days: 45 },
  ],
  couples: [
    { title: "Weekly Date Night Challenge", goal_type: "actions", goal_value: 4, reward_xp: 250, duration_days: 30 },
    { title: "Daily Gratitude Challenge", goal_type: "habits", goal_value: 30, reward_xp: 350, duration_days: 30 },
    { title: "Shared Goal Challenge", goal_type: "tasks", goal_value: 10, reward_xp: 300, duration_days: 30 },
  ],
  blank: [
    { title: "First Orbit Challenge", goal_type: "actions", goal_value: 10, reward_xp: 200, duration_days: 30 },
  ],
};

const SEASON_SUGGESTIONS = {
  family: [{ title: "Summer Family Goals", days: 60 }],
  scout_troop: [{ title: "Summer Camp Season", days: 90 }, { title: "Fall Campout Season", days: 90 }],
  accountability_circle: [{ title: "New Year Accountability Sprint", days: 30 }],
  fitness_group: [{ title: "30-Day Fitness Sprint", days: 30 }, { title: "Race Prep Season", days: 90 }],
  study_group: [{ title: "Exam Prep Season", days: 45 }, { title: "Certification Sprint", days: 60 }],
  couples: [{ title: "Date Night Season", days: 60 }, { title: "Shared Goals Season", days: 60 }],
  blank: [{ title: "Custom Season", days: 30 }],
};

function titlesFor(map, templateId) {
  return (map[templateId] || map.blank).map((item) => (typeof item === "string" ? item : item.title));
}

const CHECKLIST = [
  "Create or Join an Orbit",
  "Invite a Member",
  "View a Challenge",
  "View an Event",
  "Complete a Task or Habit",
];

function dateInputValue(daysFromNow = 7) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().slice(0, 10);
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { syncAppState } = useAppState();

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(null);
  const [mode, setMode] = useState(null);
  const [templateId, setTemplateId] = useState("family");
  const [orbitName, setOrbitName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [orbit, setOrbit] = useState(null);
  const [saving, setSaving] = useState(false);
  const [selectedRewards, setSelectedRewards] = useState(REWARD_SUGGESTIONS.family);
  const [selectedHabits, setSelectedHabits] = useState(titlesFor(HABIT_SUGGESTIONS, "family"));
  const [selectedTasks, setSelectedTasks] = useState(titlesFor(TASK_SUGGESTIONS, "family"));
  const [selectedChallenges, setSelectedChallenges] = useState(titlesFor(CHALLENGE_SUGGESTIONS, "family"));
  const [selectedSeasons, setSelectedSeasons] = useState(titlesFor(SEASON_SUGGESTIONS, "family"));
  const [customReward, setCustomReward] = useState("");
  const [rewardsAdded, setRewardsAdded] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteEmails, setInviteEmails] = useState("");
  const [setupEventKey, setSetupEventKey] = useState(null);
  const [setupEventTitle, setSetupEventTitle] = useState("");
  const [setupEventDate, setSetupEventDate] = useState(dateInputValue());
  const [setupEventEndDate, setSetupEventEndDate] = useState(dateInputValue(8));
  const [setupEventTime, setSetupEventTime] = useState("18:00");
  const [setupEventLocation, setSetupEventLocation] = useState("");
  const [checklist, setChecklist] = useState({
    create_or_join_orbit: false,
  });

  const selectedTemplate = useMemo(
    () => TEMPLATES.find((template) => template.id === templateId) || TEMPLATES[0],
    [templateId]
  );

  const progress = Math.round(((step + 1) / 14) * 100);
  const rewardSuggestions = REWARD_SUGGESTIONS[templateId] || REWARD_SUGGESTIONS.blank;
  const suggestedActions = SUCCESS_ACTIONS[templateId] || SUCCESS_ACTIONS.blank;
  const eventSetup = EVENT_SETUP[templateId];
  const selectedSetupEvent = eventSetup?.options.find((item) => item.key === setupEventKey);

  async function markStep(data) {
    try {
      await onboardingApi.completeStep(data);
    } catch (_err) {}
  }

  function selectGoal(item) {
    setGoal(item.id);
    setTemplateId(item.template);
    setSelectedRewards(REWARD_SUGGESTIONS[item.template] || REWARD_SUGGESTIONS.blank);
    resetGuidedSelections(item.template);
    resetSetupEvent();
    markStep({ step: "goal_selected", onboarding_goal: item.id });
  }

  function selectTemplate(id) {
    setTemplateId(id);
    resetGuidedSelections(id);
    resetSetupEvent();
    markStep({ step: "template_selected" });
  }

  function resetGuidedSelections(nextTemplateId) {
    setSelectedHabits(titlesFor(HABIT_SUGGESTIONS, nextTemplateId));
    setSelectedTasks(titlesFor(TASK_SUGGESTIONS, nextTemplateId));
    setSelectedChallenges(titlesFor(CHALLENGE_SUGGESTIONS, nextTemplateId));
    setSelectedSeasons(titlesFor(SEASON_SUGGESTIONS, nextTemplateId));
    setSelectedRewards(REWARD_SUGGESTIONS[nextTemplateId] || REWARD_SUGGESTIONS.blank);
  }

  function resetSetupEvent() {
    setSetupEventKey(null);
    setSetupEventTitle("");
    setSetupEventDate(dateInputValue());
    setSetupEventEndDate(dateInputValue(8));
    setSetupEventTime("18:00");
    setSetupEventLocation("");
  }

  function selectSetupEvent(option) {
    setSetupEventKey(option.key);
    setSetupEventTitle(option.defaultTitle);
    setSetupEventDate(dateInputValue());
    setSetupEventEndDate(dateInputValue(8));
    setSetupEventTime(option.time || "18:00");
    setSetupEventLocation("");
  }

  async function completeOnboarding() {
    await onboardingApi.complete();
    await syncAppState();
  }

  async function createOrbit() {
    if (!orbitName.trim()) {
      toast.error("Give your Orbit a name to continue");
      return;
    }

    setSaving(true);

    try {
      const response = await orbitApi.create({
        name: orbitName.trim(),
        template: templateId,
      });
      const created = response.data?.orbit || response.data;

      setOrbit(created);
      setChecklist({ create_or_join_orbit: true });

      await markStep({
        checklist_item: "create_or_join_orbit",
      });

      toast.success("Your Orbit is ready.");
      setStep(5);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to create Orbit"
      );
    } finally {
      setSaving(false);
    }
  }

  async function joinOrbit() {
    if (!inviteCode.trim()) {
      toast.error("Enter an invite code to continue");
      return;
    }

    setSaving(true);

    try {
      const response = await orbitApi.joinByCode(inviteCode.trim());
      const joined = response.data?.orbit || {
        id: response.data?.orbit_id,
        name: "Your Orbit",
      };

      setOrbit(joined);
      setChecklist({ create_or_join_orbit: true });

      await markStep({
        checklist_item: "create_or_join_orbit",
      });

      toast.success("You joined the Orbit.");
      await completeOnboarding();
      setStep(12);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Failed to join Orbit"
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleReward(title) {
    setSelectedRewards((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    );
  }

  function toggleSelected(setter, title) {
    setter((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    );
  }

  async function createGuidedHabits() {
    if (!orbit?.id) return;
    setSaving(true);
    try {
      for (const name of selectedHabits) {
        await orbitApi.createHabit(orbit.id, {
          name,
          description: "Added during guided template setup.",
          requires_proof: false,
        });
      }
      setStep(6);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || "Could not create habits");
    } finally {
      setSaving(false);
    }
  }

  async function createGuidedTasks() {
    if (!orbit?.id) return;
    setSaving(true);
    try {
      for (const name of selectedTasks) {
        await orbitApi.createTask(orbit.id, {
          name,
          description: "Added during guided template setup.",
          requires_proof: false,
        });
      }
      setStep(7);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || "Could not create tasks");
    } finally {
      setSaving(false);
    }
  }

  async function createSetupEvent() {
    if (!orbit?.id || !selectedSetupEvent) {
      toast.error("Choose an event suggestion or skip for now");
      return;
    }

    if (!setupEventTitle.trim() || !setupEventDate.trim()) {
      toast.error("Add an event title and date to continue");
      return;
    }

    setSaving(true);

    try {
      const startTime = `${setupEventDate.trim()}T${setupEventTime.trim() || "09:00"}:00`;
      const endTime = selectedSetupEvent.includeEndDate && setupEventEndDate.trim()
        ? `${setupEventEndDate.trim()}T${setupEventTime.trim() || "09:00"}:00`
        : null;
      const { data } = await orbitApi.createEvent(orbit.id, {
        title: setupEventTitle.trim(),
        description: "Created during template setup.",
        location: setupEventLocation.trim(),
        start_time: startTime,
        end_time: endTime,
      });
      const eventId = data?.id || data?.event?.id;

      if (eventId) {
        for (const item of selectedSetupEvent.readiness || []) {
          await orbitApi.createEventReadinessItem(orbit.id, eventId, {
            title: item,
            description: "",
            required: true,
          });
        }
      }

      setChecklist((current) => ({ ...current, view_event: true }));
      await markStep({ checklist_item: "view_event" });
      toast.success("Event created.");
      setStep(9);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Could not create event. You can add one later from your Orbit."
      );
    } finally {
      setSaving(false);
    }
  }

  async function continueToSuccess({ addRewards = false } = {}) {
    if (addRewards && mode === "create") {
      const rewardTitles = [
        ...selectedRewards,
        ...(customReward.trim() ? [customReward.trim()] : []),
      ];

      if (orbit?.id && rewardTitles.length) {
        setSaving(true);

        try {
          const existing = await orbitApi.listRewards(orbit.id);
          const existingTitles = new Set(
            (existing.data?.items || existing.data || [])
              .map((reward) => reward?.title?.trim().toLowerCase())
              .filter(Boolean)
          );
          const uniqueTitles = rewardTitles.filter(
            (title, index, all) =>
              title &&
              all.findIndex(
                (item) => item.trim().toLowerCase() === title.trim().toLowerCase()
              ) === index &&
              !existingTitles.has(title.trim().toLowerCase())
          );

          for (const title of uniqueTitles) {
            await orbitApi.createReward(orbit.id, {
              title,
              description: "Starter reward added during onboarding.",
              xp_cost: 500,
            });
          }

          setRewardsAdded(uniqueTitles.length > 0);
        } catch (err) {
          toast.error(
            err.response?.data?.detail ||
              err.message ||
              "Could not add rewards. You can add them from your Orbit later."
          );
          return;
        } finally {
          setSaving(false);
        }
      }
    }

    setStep(8);
  }

  async function createGuidedChallenges() {
    if (!orbit?.id) return;
    const suggestions = CHALLENGE_SUGGESTIONS[templateId] || CHALLENGE_SUGGESTIONS.blank;
    const selected = suggestions.filter((item) => selectedChallenges.includes(item.title));
    setSaving(true);
    try {
      for (const item of selected) {
        await orbitApi.createChallenge(orbit.id, {
          title: item.title,
          description: "Added during guided template setup.",
          goal_type: item.goal_type,
          goal_value: item.goal_value,
          start_date: dateInputValue(0),
          end_date: dateInputValue(item.duration_days || 30),
          reward_xp: item.reward_xp,
        });
      }
      setStep(10);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || "Could not create challenges");
    } finally {
      setSaving(false);
    }
  }

  async function createGuidedSeasons() {
    if (!orbit?.id) return;
    const suggestions = SEASON_SUGGESTIONS[templateId] || SEASON_SUGGESTIONS.blank;
    const selected = suggestions.filter((item) => selectedSeasons.includes(item.title));
    setSaving(true);
    try {
      for (const item of selected) {
        await orbitApi.createSeason(orbit.id, {
          title: item.title,
          description: "Added during guided template setup.",
          start_date: dateInputValue(0),
          end_date: dateInputValue(item.days || 30),
          template: templateId,
        });
      }
      setStep(11);
    } catch (err) {
      toast.error(err.response?.data?.detail || err.message || "Could not create seasons");
    } finally {
      setSaving(false);
    }
  }

  async function showSuccess() {
    await markStep({ step: "success" });
    await completeOnboarding();
    setStep(12);
  }

  async function createOnboardingInviteLink({ share = false } = {}) {
    if (!orbit?.id) return;

    setSaving(true);

    try {
      let link = inviteLink;
      if (!link) {
        const { data } = await orbitApi.createInviteLink(orbit.id);
        link = `${window.location.origin}/orbit-invite/${data.token}`;
        setInviteLink(link);
      }

      setChecklist((current) => ({ ...current, invite_member: true }));
      await markStep({ checklist_item: "invite_member" });

      if (share && navigator.share) {
        await navigator.share({
          title: `Join ${orbit.name} on OurOrbit`,
          text: `Join ${orbit.name} on OurOrbit.`,
          url: link,
        });
      } else {
        await navigator.clipboard?.writeText(link);
        toast.success("Invite link copied.");
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        toast.error(
          err.response?.data?.detail ||
            err.message ||
            "Could not create invite link"
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function sendOnboardingEmailInvites() {
    const emails = inviteEmails
      .split(/[\s,;]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    if (!orbit?.id || !emails.length) {
      toast.error("Enter at least one email address");
      return;
    }

    setSaving(true);

    try {
      const { data } = await orbitApi.sendEmailInvites(orbit.id, emails);
      const sentCount = data.items?.length || 0;
      const errors = data.errors || [];

      if (sentCount) {
        setInviteEmails("");
        setChecklist((current) => ({ ...current, invite_member: true }));
        await markStep({ checklist_item: "invite_member" });
        toast.success(`${sentCount} email invitation${sentCount === 1 ? "" : "s"} sent`);
      }
      errors.forEach((item) => toast.error(`${item.email}: ${item.detail}`));
      if (!sentCount && !errors.length) toast.error("No invitations sent");
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          err.message ||
          "Could not send invites"
      );
    } finally {
      setSaving(false);
    }
  }

  function goToOrbit() {
    if (orbit?.id) {
      navigate(`/orbits/${orbit.id}`);
      return;
    }

    navigate("/");
  }

  function renderOption({ active, title, description, Icon = Circle, onClick, secondary }) {
    return (
      <button
        key={title}
        type="button"
        style={{
          ...styles.option,
          ...(active ? styles.optionActive : {}),
          ...(secondary ? styles.optionSecondary : {}),
        }}
        onClick={onClick}
      >
        <span style={styles.optionIcon}>
          <Icon size={22} />
        </span>
        <span style={styles.optionCopy}>
          <strong>{title}</strong>
          {description && <span>{description}</span>}
        </span>
        {active && <CheckCircle2 size={22} />}
      </button>
    );
  }

  function renderGuidedChecklist({ items, selected, onToggle }) {
    return (
      <div style={styles.optionGrid}>
        {items.map((item) => {
          const title = typeof item === "string" ? item : item.title;
          const isSelected = selected.includes(title);
          return renderOption({
            active: isSelected,
            title,
            Icon: isSelected ? CheckCircle2 : Circle,
            onClick: () => onToggle(title),
          });
        })}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.eyebrow}>Welcome to OurOrbit</p>
        <h1 style={styles.title}>Build better habits together</h1>
        <p style={styles.subtitle}>
          Shared goals, real accountability, and a quick path into your first Orbit.
        </p>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>
      </section>

      <section style={styles.card}>
        {step === 0 && (
          <>
            <div style={styles.iconBubble}>
              <Rocket size={32} />
            </div>
            <h2 style={styles.cardTitle}>Welcome to OurOrbit</h2>
            <p style={styles.cardText}>
              Build better habits together through shared goals and accountability.
            </p>
            <button
              style={styles.primaryButton}
              onClick={() => {
                markStep({ step: "welcome" });
                setStep(1);
              }}
            >
              Get Started
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={styles.cardTitle}>What brings you here?</h2>
            <div style={styles.optionGrid}>
              {GOALS.map((item) =>
                renderOption({
                  active: goal === item.id,
                  title: item.title,
                  Icon: Users,
                  onClick: () => selectGoal(item),
                })
              )}
            </div>
            <button
              style={{ ...styles.primaryButton, ...(goal ? {} : styles.disabled) }}
              disabled={!goal}
              onClick={() => setStep(2)}
            >
              Continue
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={styles.cardTitle}>How would you like to get started?</h2>
            <div style={styles.optionGrid}>
              {renderOption({
                active: mode === "join",
                title: "Join an Existing Orbit",
                description: "Use an invite code from your group.",
                Icon: Users,
                onClick: () => setMode("join"),
              })}
              {renderOption({
                active: mode === "create",
                title: "Create a New Orbit",
                description: "Choose a template and invite people after setup.",
                Icon: Rocket,
                onClick: () => setMode("create"),
              })}
            </div>
            <button
              style={{ ...styles.primaryButton, ...(mode ? {} : styles.disabled) }}
              disabled={!mode}
              onClick={() => {
                markStep({ step: "join_or_create_selected" });
                setStep(mode === "join" ? 4 : 3);
              }}
            >
              Continue
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <h2 style={styles.cardTitle}>Choose Template</h2>
            <p style={styles.cardText}>
              Choose a template to start with recommended challenges, rewards, and guided event/readiness setup.
            </p>
            <div style={styles.optionGrid}>
              {TEMPLATES.map((template) =>
                renderOption({
                  active: templateId === template.id,
                  title: template.title,
                  description: template.description,
                  Icon: template.icon,
                  secondary: template.secondary,
                  onClick: () => selectTemplate(template.id),
                })
              )}
            </div>
            <button style={styles.primaryButton} onClick={() => setStep(4)}>
              Continue
            </button>
          </>
        )}

        {step === 4 && mode === "create" && (
          <>
            <h2 style={styles.cardTitle}>
              {templateId === "scout_troop" ? "Troop Name" : "Orbit Name"}
            </h2>
            <p style={styles.cardText}>
              Starter challenges, rewards, roles, and suggestions will be added automatically.
            </p>
            <input
              style={styles.input}
              value={orbitName}
              onChange={(event) => setOrbitName(event.target.value)}
              placeholder={selectedTemplate.placeholder}
            />
            <button
              style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }}
              disabled={saving}
              onClick={createOrbit}
            >
              {saving ? "Creating..." : "Create Orbit"}
            </button>
          </>
        )}

        {step === 4 && mode === "join" && !orbit && (
          <>
            <h2 style={styles.cardTitle}>Enter Invite Code</h2>
            <p style={styles.cardText}>Paste the invite code from your existing Orbit.</p>
            <input
              style={styles.input}
              value={inviteCode}
              onChange={(event) => setInviteCode(event.target.value)}
              placeholder="Invite code"
            />
            <button
              style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }}
              disabled={saving}
              onClick={joinOrbit}
            >
              {saving ? "Joining..." : "Join Orbit"}
            </button>
          </>
        )}

        {step === 5 && orbit && mode === "create" && (
          <>
            <h2 style={styles.cardTitle}>Would you like to add shared habits?</h2>
            <p style={styles.cardText}>
              Start with habits that match your template, or skip and add your own later.
            </p>
            {renderGuidedChecklist({
              items: HABIT_SUGGESTIONS[templateId] || HABIT_SUGGESTIONS.blank,
              selected: selectedHabits,
              onToggle: (title) => toggleSelected(setSelectedHabits, title),
            })}
            <button style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }} disabled={saving} onClick={createGuidedHabits}>
              {saving ? "Creating..." : "Create Selected"}
            </button>
            <button style={styles.secondaryButton} disabled={saving} onClick={() => setStep(6)}>
              Skip
            </button>
          </>
        )}

        {step === 6 && orbit && mode === "create" && (
          <>
            <h2 style={styles.cardTitle}>Would you like to add shared tasks?</h2>
            <p style={styles.cardText}>
              These are concrete one-time tasks your group can complete together.
            </p>
            {renderGuidedChecklist({
              items: TASK_SUGGESTIONS[templateId] || TASK_SUGGESTIONS.blank,
              selected: selectedTasks,
              onToggle: (title) => toggleSelected(setSelectedTasks, title),
            })}
            <button style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }} disabled={saving} onClick={createGuidedTasks}>
              {saving ? "Creating..." : "Create Selected"}
            </button>
            <button style={styles.secondaryButton} disabled={saving} onClick={() => setStep(7)}>
              Skip
            </button>
          </>
        )}

        {step === 7 && orbit && (
          <>
            <h2 style={styles.cardTitle}>Why Rewards Matter</h2>
            <p style={styles.cardText}>
              Rewards help reinforce positive habits, participation, and progress.
            </p>
            <p style={styles.cardText}>
              A reward can be anything meaningful to your group: family movie night,
              extra screen time, choosing dinner, patrol pizza party, a group
              celebration, or a special outing.
            </p>
            <p style={styles.cardText}>
              Members earn rewards by completing habits, tasks, challenges, and group goals.
            </p>

            <div style={styles.optionGrid}>
              {rewardSuggestions.map((title) =>
                renderOption({
                  active: selectedRewards.includes(title),
                  title,
                  Icon: selectedRewards.includes(title) ? CheckCircle2 : Circle,
                  onClick: () => toggleReward(title),
                })
              )}
            </div>

            <label style={styles.label}>
              What's one reward your group would actually get excited about?
            </label>
            <input
              style={styles.input}
              value={customReward}
              onChange={(event) => setCustomReward(event.target.value)}
              placeholder={CUSTOM_REWARD_PLACEHOLDERS[templateId] || CUSTOM_REWARD_PLACEHOLDERS.blank}
            />
            {mode === "create" && (
              <button
                style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }}
                disabled={saving}
                onClick={() => continueToSuccess({ addRewards: true })}
              >
                {saving ? "Adding Rewards..." : "Create Selected"}
              </button>
            )}
            <button
              style={mode === "create" ? styles.secondaryButton : styles.primaryButton}
              disabled={saving}
              onClick={() => continueToSuccess({ addRewards: false })}
            >
              {mode === "create" ? "Skip" : "Continue"}
            </button>
          </>
        )}

        {step === 8 && orbit && mode === "create" && eventSetup && (
          <>
            <h2 style={styles.cardTitle}>{eventSetup.prompt}</h2>
            <p style={styles.cardText}>{eventSetup.intro}</p>
            <div style={styles.optionGrid}>
              {eventSetup.options.map((option) =>
                renderOption({
                  active: setupEventKey === option.key,
                  title: option.action,
                  description: option.readiness?.length
                    ? `Includes readiness: ${option.readiness.join(", ")}`
                    : "No readiness checklist required.",
                  Icon: CheckCircle2,
                  onClick: () => selectSetupEvent(option),
                })
              )}
            </div>

            {selectedSetupEvent && (
              <>
                <input
                  style={styles.input}
                  value={setupEventTitle}
                  onChange={(event) => setSetupEventTitle(event.target.value)}
                  placeholder="Event name"
                />
                <input
                  style={styles.input}
                  value={setupEventDate}
                  onChange={(event) => setSetupEventDate(event.target.value)}
                  placeholder="Start date (YYYY-MM-DD)"
                />
                {selectedSetupEvent.includeEndDate && (
                  <input
                    style={styles.input}
                    value={setupEventEndDate}
                    onChange={(event) => setSetupEventEndDate(event.target.value)}
                    placeholder="End date (YYYY-MM-DD)"
                  />
                )}
                <input
                  style={styles.input}
                  value={setupEventTime}
                  onChange={(event) => setSetupEventTime(event.target.value)}
                  placeholder="Time (HH:MM)"
                />
                <input
                  style={styles.input}
                  value={setupEventLocation}
                  onChange={(event) => setSetupEventLocation(event.target.value)}
                  placeholder="Location"
                />
                <button
                  style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }}
                  disabled={saving}
                  onClick={createSetupEvent}
                >
                  {saving ? "Creating Event..." : "Create Event"}
                </button>
              </>
            )}

            <button
              style={styles.secondaryButton}
              disabled={saving}
              onClick={() => setStep(9)}
            >
              Skip For Now
            </button>
          </>
        )}

        {step === 9 && orbit && mode === "create" && (
          <>
            <h2 style={styles.cardTitle}>Would you like to add challenges?</h2>
            <p style={styles.cardText}>
              Challenges give the Orbit a clear shared target from day one.
            </p>
            {renderGuidedChecklist({
              items: CHALLENGE_SUGGESTIONS[templateId] || CHALLENGE_SUGGESTIONS.blank,
              selected: selectedChallenges,
              onToggle: (title) => toggleSelected(setSelectedChallenges, title),
            })}
            <button style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }} disabled={saving} onClick={createGuidedChallenges}>
              {saving ? "Creating..." : "Create Selected"}
            </button>
            <button style={styles.secondaryButton} disabled={saving} onClick={() => setStep(10)}>
              Skip
            </button>
          </>
        )}

        {step === 10 && orbit && mode === "create" && (
          <>
            <h2 style={styles.cardTitle}>Would you like to add a season?</h2>
            <p style={styles.cardText}>
              Seasons group events, rewards, milestones, and goals around a time-bound focus.
            </p>
            {renderGuidedChecklist({
              items: SEASON_SUGGESTIONS[templateId] || SEASON_SUGGESTIONS.blank,
              selected: selectedSeasons,
              onToggle: (title) => toggleSelected(setSelectedSeasons, title),
            })}
            <button style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }} disabled={saving} onClick={createGuidedSeasons}>
              {saving ? "Creating..." : "Create Selected"}
            </button>
            <button style={styles.secondaryButton} disabled={saving} onClick={() => setStep(11)}>
              Skip
            </button>
          </>
        )}

        {step === 11 && orbit && mode === "create" && (
          <>
            <h2 style={styles.cardTitle}>Invite members now?</h2>
            <p style={styles.cardText}>
              {INVITE_MESSAGES[templateId] || INVITE_MESSAGES.blank}
            </p>
            <p style={styles.cardText}>
              Bring people in now so your shared habits, challenges, rewards, and events feel alive from day one.
            </p>
            {inviteLink && (
              <input
                readOnly
                value={inviteLink}
                style={styles.input}
                onFocus={(event) => event.target.select()}
              />
            )}
            <div style={styles.buttonRow}>
              <button
                style={styles.primaryButton}
                disabled={saving}
                onClick={() => createOnboardingInviteLink({ share: false })}
              >
                Copy Link
              </button>
              <button
                style={styles.secondaryButton}
                disabled={saving}
                onClick={() => createOnboardingInviteLink({ share: true })}
              >
                Share Invite
              </button>
            </div>
            <textarea
              style={{ ...styles.input, ...styles.textarea }}
              value={inviteEmails}
              onChange={(event) => setInviteEmails(event.target.value)}
              placeholder={"parent1@example.com\nparent2@example.com\nleader@example.com"}
            />
            <button
              style={{ ...styles.primaryButton, ...(saving ? styles.disabled : {}) }}
              disabled={saving}
              onClick={sendOnboardingEmailInvites}
            >
              {saving ? "Sending..." : "Email Invite"}
            </button>
            <button
              style={styles.secondaryButton}
              disabled={saving}
              onClick={showSuccess}
            >
              Skip
            </button>
          </>
        )}

        {step === 12 && orbit && (
          <>
            <div style={styles.iconBubble}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={styles.cardTitle}>Your Orbit is ready.</h2>
            <p style={styles.cardText}>
              {rewardsAdded
                ? "Great! Your group now has rewards to work toward."
                : "Here are the best next actions to build momentum."}
            </p>
            <div style={styles.list}>
              {suggestedActions.map((action) => (
                <div key={action} style={styles.listRow}>
                  <CheckCircle2 size={18} />
                  <span>{action}</span>
                </div>
              ))}
            </div>
            <button style={styles.primaryButton} onClick={() => setStep(13)}>
              View Getting Started Checklist
            </button>
          </>
        )}

        {step === 13 && (
          <>
            <h2 style={styles.cardTitle}>Getting Started Checklist</h2>
            <p style={styles.cardText}>
              Starter Badge unlocked. Keep going with these first meaningful actions.
            </p>
            <div style={styles.list}>
              {CHECKLIST.map((item, index) => {
                const done =
                  (index === 0 && checklist.create_or_join_orbit) ||
                  (index === 1 && checklist.invite_member);
                return (
                  <div key={item} style={styles.listRow}>
                    {done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    <span>{item}</span>
                  </div>
                );
              })}
            </div>
            <button style={styles.primaryButton} onClick={goToOrbit}>
              Go to My Orbit
            </button>
            <button style={styles.secondaryButton} onClick={() => navigate("/")}>
              Go to Dashboard
            </button>
          </>
        )}
      </section>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    padding: "28px 18px 56px",
  },
  hero: {
    marginBottom: 22,
  },
  eyebrow: {
    margin: 0,
    color: "#5B6BFF",
    fontSize: 13,
    fontWeight: 900,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    margin: "8px 0",
    fontSize: "clamp(34px, 7vw, 58px)",
    lineHeight: 1,
    color: "#1E1E24",
  },
  subtitle: {
    maxWidth: 620,
    color: "#666A73",
    fontSize: 18,
    lineHeight: 1.5,
  },
  progressTrack: {
    height: 10,
    maxWidth: 520,
    overflow: "hidden",
    border: "2px solid #1E1E24",
    borderRadius: 999,
    background: "#FFFFFF",
    boxShadow: "3px 3px 0 #1E1E24",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #5B6BFF, #2FD0C7)",
    transition: "width 180ms ease",
  },
  card: {
    display: "grid",
    gap: 18,
    padding: 24,
    border: "2px solid #1E1E24",
    borderRadius: 24,
    background: "#FFFFFF",
    boxShadow: "6px 6px 0 #1E1E24",
  },
  iconBubble: {
    width: 62,
    height: 62,
    display: "grid",
    placeItems: "center",
    border: "2px solid #1E1E24",
    borderRadius: 18,
    color: "#1E1E24",
    background: "#EAF8FF",
  },
  cardTitle: {
    margin: 0,
    color: "#1E1E24",
    fontSize: 30,
    lineHeight: 1.1,
  },
  cardText: {
    margin: 0,
    color: "#666A73",
    fontSize: 16,
    lineHeight: 1.5,
  },
  optionGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 12,
  },
  option: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minHeight: 86,
    padding: 16,
    border: "2px solid #D7DAE5",
    borderRadius: 18,
    background: "#FFFFFF",
    color: "#1E1E24",
    cursor: "pointer",
    textAlign: "left",
  },
  optionActive: {
    borderColor: "#1E1E24",
    background: "#F2F5FF",
    boxShadow: "4px 4px 0 #1E1E24",
  },
  optionSecondary: {
    opacity: 0.86,
  },
  optionIcon: {
    width: 42,
    height: 42,
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
    borderRadius: 14,
    background: "#EEF2FF",
  },
  optionCopy: {
    display: "grid",
    gap: 4,
    flex: 1,
  },
  input: {
    width: "100%",
    minHeight: 54,
    padding: "0 16px",
    border: "2px solid #1E1E24",
    borderRadius: 16,
    fontSize: 16,
    fontWeight: 700,
    boxSizing: "border-box",
  },
  textarea: {
    minHeight: 110,
    paddingTop: 14,
    resize: "vertical",
  },
  label: {
    color: "#1E1E24",
    fontSize: 15,
    fontWeight: 900,
  },
  primaryButton: {
    minHeight: 52,
    padding: "0 22px",
    border: "2px solid #1E1E24",
    borderRadius: 999,
    background: "#5B6BFF",
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "4px 4px 0 #1E1E24",
  },
  secondaryButton: {
    minHeight: 48,
    padding: "0 22px",
    border: "2px solid #D7DAE5",
    borderRadius: 999,
    background: "#FFFFFF",
    color: "#1E1E24",
    fontSize: 15,
    fontWeight: 900,
    cursor: "pointer",
  },
  disabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },
  buttonRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },
  list: {
    display: "grid",
    gap: 10,
  },
  listRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: "#1E1E24",
    fontWeight: 800,
  },
};
