import axios from "axios";

export const TOKEN_KEY = "habio_token";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "https://api.habioapp.co";

export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
    }

    return Promise.reject(error);
  }
);

export async function refreshUser() {
  const response = await api.get("/auth/me");
  return response.data?.user || response.data;
}

export function formatApiError(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    return detail
      .map((item) => (item?.msg ? item.msg : JSON.stringify(item)))
      .filter(Boolean)
      .join(" ");
  }

  if (typeof detail === "object" && detail?.msg) return detail.msg;

  return String(detail);
}

export const activityApi = {
  getMyActivity: () => api.get("/activity"),
  getFeed: () => api.get("/feed"),
  react: (activityId, reaction) =>
    api.post(`/activity/${activityId}/react`, { reaction }),
  removeReaction: (activityId, reaction) =>
    api.delete(`/activity/${activityId}/react/${reaction}`),
};

export const socialApi = {
  searchUsers: (query) =>
    api.get(`/users/search?q=${encodeURIComponent(query)}`),

  followUser: (userId) => api.post(`/users/${userId}/follow`),

  unfollowUser: (userId) => api.post(`/users/${userId}/unfollow`),

  getFollowers: (userId) => api.get(`/users/${userId}/followers`),

  getFollowing: (userId) => api.get(`/users/${userId}/following`),

  getUserActivity: (userId) => api.get(`/users/${userId}/activity`),
};

export const profileApi = {
  getMe: () => api.get("/profile/me"),
  updateMe: (data) => api.put("/profile/me", data),
  updateAvatar: (data) => api.patch("/users/me/avatar", data),
  getPublicProfile: (username) =>
    api.get(`/profile/${encodeURIComponent(username)}`),
};

export const notificationApi = {
  getNotifications: () => api.get("/notifications"),
  getUnreadCount: () => api.get("/notifications/unread-count"),
  markRead: (notificationId) =>
    api.post(`/notifications/${notificationId}/read`),
  markAllRead: () => api.post("/notifications/read-all"),
};

export const statsApi = {
  getStats: () => api.get("/stats"),
};

export const adminApi = {
  getOverview: () => api.get("/admin/analytics/overview"),
  getAdoptionFunnel: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/analytics/adoption-funnel${query ? `?${query}` : ""}`);
  },
  getOrbitGrowth: () => api.get("/admin/analytics/orbit-growth"),
  getTemplateAdoption: () => api.get("/admin/analytics/template-adoption"),
  getRetention30d: () => api.get("/admin/analytics/retention-30d"),
  searchUsers: (q) => api.get(`/admin/tools/users?q=${encodeURIComponent(q || "")}`),
  getUserSummary: (userId) => api.get(`/admin/tools/users/${encodeURIComponent(userId)}`),
  searchOrbits: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/tools/orbits${query ? `?${query}` : ""}`);
  },
  getOrbitSummary: (orbitId) => api.get(`/admin/tools/orbits/${encodeURIComponent(orbitId)}`),
  listSupportTickets: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/tools/support-tickets${query ? `?${query}` : ""}`);
  },
  updateSupportTicket: (ticketId, data) => api.patch(`/admin/tools/support-tickets/${encodeURIComponent(ticketId)}`, data),
  listModerationReports: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/tools/moderation-reports${query ? `?${query}` : ""}`);
  },
  updateModerationReport: (reportId, data) => api.patch(`/admin/tools/moderation-reports/${encodeURIComponent(reportId)}`, data),
  listFeatureFlags: () => api.get("/admin/tools/feature-flags"),
  createFeatureFlag: (data) => api.post("/admin/tools/feature-flags", data),
  updateFeatureFlag: (key, data) => api.patch(`/admin/tools/feature-flags/${encodeURIComponent(key)}`, data),
};

export const recapApi = {
  list: () => api.get("/weekly-recaps"),
  generate: () => api.post("/weekly-recaps/generate"),
  generateAI: () => api.post("/weekly-recaps/ai"),
};

export const onboardingApi = {
  getStatus: () => api.get("/onboarding/status"),
  completeStep: (data) => api.post("/onboarding/complete-step", data),
  complete: () => api.post("/onboarding/complete"),
};

export const uploadApi = {
  createUploadUrl: (data) => api.post("/uploads/presign", data),
  getViewUrl: (key) =>
    api.get(`/uploads/view-url?key=${encodeURIComponent(key)}`),
};

export const orbitApi = {
  list: () => api.get("/orbits"),
  listTemplates: () => api.get("/orbit-templates"),
  get: (orbitId) => api.get(`/orbits/${orbitId}`),
  getDashboard: (orbitId) => api.get(`/orbits/${orbitId}/dashboard`),
  getParentDashboard: (orbitId) => api.get(`/orbits/${orbitId}/parent-dashboard`),
  getMilestones: (orbitId) => api.get(`/orbits/${orbitId}/milestones`),
  getMemories: (orbitId) => api.get(`/orbits/${orbitId}/memories`),
  getMemory: (orbitId, memoryId) => api.get(`/orbits/${orbitId}/memories/${memoryId}`),
  pinMemory: (orbitId, memoryId) => api.post(`/orbits/${orbitId}/memories/${memoryId}/pin`),
  unpinMemory: (orbitId, memoryId) => api.post(`/orbits/${orbitId}/memories/${memoryId}/unpin`),
  listThemes: () => api.get("/orbits/themes"),
  updateTheme: (orbitId, themeId) => api.patch(`/orbits/${orbitId}/theme`, { theme_id: themeId }),
  syncMilestones: (orbitId) => api.post(`/orbits/${orbitId}/milestones/sync`),
  listSeasons: (orbitId) => api.get(`/orbits/${orbitId}/seasons`),
  createSeason: (orbitId, data) => api.post(`/orbits/${orbitId}/seasons`, data),
  updateSeason: (orbitId, seasonId, data) => api.put(`/orbits/${orbitId}/seasons/${seasonId}`, data),
  deleteSeason: (orbitId, seasonId) => api.delete(`/orbits/${orbitId}/seasons/${seasonId}`),
  getPatrolLeaderboard: (orbitId) => api.get(`/orbits/${orbitId}/patrols/leaderboard`),
  listPatrols: (orbitId) => api.get(`/orbits/${orbitId}/patrols`),
  createPatrol: (orbitId, data) => api.post(`/orbits/${orbitId}/patrols`, data),
  updatePatrol: (orbitId, patrolId, data) => api.patch(`/orbits/${orbitId}/patrols/${patrolId}`, data),
  deletePatrol: (orbitId, patrolId) => api.delete(`/orbits/${orbitId}/patrols/${patrolId}`),
  assignPatrolMember: (orbitId, patrolId, userId) =>
    api.post(`/orbits/${orbitId}/patrols/${patrolId}/assign`, { user_id: userId }),
  removePatrolMember: (orbitId, patrolId, userId) =>
    api.post(`/orbits/${orbitId}/patrols/${patrolId}/remove-member`, { user_id: userId }),
  create: (data) => api.post("/orbits", data),
  createFromTemplate: (data) => api.post("/orbits/from-template", data),
  remove: (orbitId) => api.delete(`/orbits/${orbitId}`),
  listInvites: () => api.get("/orbits/invites/pending"),
  inviteMember: (orbitId, data) => api.post(`/orbits/${orbitId}/invites`, data),
  createInviteLink: (orbitId, data = {}) => api.post(`/orbits/${orbitId}/invites`, data),
  sendEmailInvites: (orbitId, emails) => api.post(`/orbits/${orbitId}/invites/email`, { emails }),
  listOrbitInvites: (orbitId) => api.get(`/orbits/${orbitId}/invites`),
  deactivateInvite: (orbitId, inviteId) => api.patch(`/orbits/${orbitId}/invites/${inviteId}/deactivate`),
  previewInviteLink: (token) => api.get(`/orbit-invites/${encodeURIComponent(token)}`),
  acceptInviteLink: (token) => api.post(`/orbit-invites/${encodeURIComponent(token)}/accept`),
  acceptInvite: (inviteId) => api.post(`/orbits/invites/${inviteId}/accept`),
  declineInvite: (inviteId) => api.post(`/orbits/invites/${inviteId}/decline`),
  joinByCode: (code) => api.post(`/orbits/join/${encodeURIComponent(code)}`),
  leave: (orbitId) => api.post(`/orbits/${orbitId}/leave`),
  removeMember: (orbitId, userId) => api.delete(`/orbits/${orbitId}/members/${userId}`),
  updateMemberRole: (orbitId, userId, role) =>
    api.patch(`/orbits/${orbitId}/members/${userId}/role`, { role }),
  transferOwnership: (orbitId, userId) =>
    api.post(`/orbits/${orbitId}/members/${userId}/transfer-ownership`),
  createGoal: (orbitId, data) => api.post(`/orbits/${orbitId}/goals`, data),
  contribute: (orbitId, goalId, data = { amount: 1 }) =>
    api.post(`/orbits/${orbitId}/goals/${goalId}/contribute`, data),
  createHabit: (orbitId, data) => api.post(`/orbits/${orbitId}/habits`, data),
  updateHabit: (orbitId, habitId, data) => api.patch(`/orbits/${orbitId}/habits/${habitId}`, data),
  deleteHabit: (orbitId, habitId) => api.delete(`/orbits/${orbitId}/habits/${habitId}`),
  completeHabit: (orbitId, habitId) => api.post(`/orbits/${orbitId}/habits/${habitId}/complete`),
  completeHabitWithProof: (orbitId, habitId, data) => api.post(`/orbits/${orbitId}/habits/${habitId}/complete-with-proof`, data),
  createTask: (orbitId, data) => api.post(`/orbits/${orbitId}/tasks`, data),
  updateTask: (orbitId, taskId, data) => api.patch(`/orbits/${orbitId}/tasks/${taskId}`, data),
  deleteTask: (orbitId, taskId) => api.delete(`/orbits/${orbitId}/tasks/${taskId}`),
  completeTask: (orbitId, taskId) => api.post(`/orbits/${orbitId}/tasks/${taskId}/complete`),
  completeTaskWithProof: (orbitId, taskId, data) => api.post(`/orbits/${orbitId}/tasks/${taskId}/complete-with-proof`, data),
  listPendingProofs: (orbitId) => api.get(`/orbits/${orbitId}/proofs/pending`),
  aiCheckProof: (orbitId, proofId) => api.post(`/orbits/${orbitId}/proofs/${proofId}/ai-check`),
  listWeeklyRecaps: (orbitId) => api.get(`/orbits/${orbitId}/weekly-recaps`),
  generateAIWeeklyRecap: (orbitId) => api.post(`/orbits/${orbitId}/weekly-recap/ai`),
  generateAIInsights: (orbitId) => api.post(`/orbits/${orbitId}/ai-insights`),
  listSeasons: (orbitId) => api.get(`/orbits/${orbitId}/seasons`),
  createSeason: (orbitId, data) => api.post(`/orbits/${orbitId}/seasons`, data),
  updateSeason: (orbitId, seasonId, data) => api.put(`/orbits/${orbitId}/seasons/${seasonId}`, data),
  deleteSeason: (orbitId, seasonId) => api.delete(`/orbits/${orbitId}/seasons/${seasonId}`),
  approveProof: (orbitId, proofId) => api.post(`/orbits/${orbitId}/proofs/${proofId}/approve`),
  rejectProof: (orbitId, proofId, data = {}) => api.post(`/orbits/${orbitId}/proofs/${proofId}/reject`, data),
  createChallenge: (orbitId, data) => api.post(`/orbits/${orbitId}/challenges`, data),
  updateChallenge: (orbitId, challengeId, data) => api.patch(`/orbits/${orbitId}/challenges/${challengeId}`, data),
  deleteChallenge: (orbitId, challengeId) => api.delete(`/orbits/${orbitId}/challenges/${challengeId}`),
  listRewards: (orbitId) => api.get(`/orbits/${orbitId}/rewards`),
  createReward: (orbitId, data) => api.post(`/orbits/${orbitId}/rewards`, data),
  updateReward: (orbitId, rewardId, data) => api.patch(`/orbits/${orbitId}/rewards/${rewardId}`, data),
  redeemReward: (orbitId, rewardId) => api.post(`/orbits/${orbitId}/rewards/${rewardId}/redeem`),
  deleteReward: (orbitId, rewardId) => api.delete(`/orbits/${orbitId}/rewards/${rewardId}`),
  listEvents: (orbitId) => api.get(`/orbits/${orbitId}/events`),
  createEvent: (orbitId, data) => api.post(`/orbits/${orbitId}/events`, data),
  updateEvent: (orbitId, eventId, data) => api.put(`/orbits/${orbitId}/events/${eventId}`, data),
  deleteEvent: (orbitId, eventId) => api.delete(`/orbits/${orbitId}/events/${eventId}`),
  rsvpEvent: (orbitId, eventId, status) =>
    api.post(`/orbits/${orbitId}/events/${eventId}/rsvp`, { status }),
  getEventReadiness: (orbitId, eventId) =>
    api.get(`/orbits/${orbitId}/events/${eventId}/readiness`),
  getEventPatrolReadiness: (orbitId, eventId) =>
    api.get(`/orbits/${orbitId}/events/${eventId}/readiness/patrols`),
  createEventReadinessItem: (orbitId, eventId, data) =>
    api.post(`/orbits/${orbitId}/events/${eventId}/readiness/items`, data),
  updateEventReadinessItem: (orbitId, eventId, itemId, data) =>
    api.put(`/orbits/${orbitId}/events/${eventId}/readiness/items/${itemId}`, data),
  deleteEventReadinessItem: (orbitId, eventId, itemId) =>
    api.delete(`/orbits/${orbitId}/events/${eventId}/readiness/items/${itemId}`),
  completeEventReadinessItem: (orbitId, eventId, itemId) =>
    api.post(`/orbits/${orbitId}/events/${eventId}/readiness/items/${itemId}/complete`),
  uncompleteEventReadinessItem: (orbitId, eventId, itemId) =>
    api.post(`/orbits/${orbitId}/events/${eventId}/readiness/items/${itemId}/uncomplete`),
};

export const projectApi = {
  list: (orbitId) => api.get(orbitId ? `/projects?orbit_id=${encodeURIComponent(orbitId)}` : "/projects"),
  get: (projectId) => api.get(`/projects/${projectId}`),
  create: (data) => api.post("/projects", data),
  update: (projectId, data) => api.patch(`/projects/${projectId}`, data),
  remove: (projectId) => api.delete(`/projects/${projectId}`),
  completeSubtask: (projectId, subtaskId) => api.post(`/projects/${projectId}/subtasks/${subtaskId}/complete`),
  submitSubtaskVerification: (projectId, subtaskId, data) => api.post(`/projects/${projectId}/subtasks/${subtaskId}/verification`, data),
  approveVerification: (projectId, proofId) => api.post(`/projects/${projectId}/verifications/${proofId}/approve`),
  rejectVerification: (projectId, proofId, data = {}) => api.post(`/projects/${projectId}/verifications/${proofId}/reject`, data),
};

export default api;
