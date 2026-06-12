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

export const recapApi = {
  list: () => api.get("/weekly-recaps"),
  generate: () => api.post("/weekly-recaps/generate"),
};

export const orbitApi = {
  list: () => api.get("/orbits"),
  get: (orbitId) => api.get(`/orbits/${orbitId}`),
  create: (data) => api.post("/orbits", data),
  remove: (orbitId) => api.delete(`/orbits/${orbitId}`),
  listInvites: () => api.get("/orbits/invites/pending"),
  inviteMember: (orbitId, data) => api.post(`/orbits/${orbitId}/invites`, data),
  acceptInvite: (inviteId) => api.post(`/orbits/invites/${inviteId}/accept`),
  declineInvite: (inviteId) => api.post(`/orbits/invites/${inviteId}/decline`),
  joinByCode: (code) => api.post(`/orbits/join/${encodeURIComponent(code)}`),
  leave: (orbitId) => api.post(`/orbits/${orbitId}/leave`),
  removeMember: (orbitId, userId) => api.delete(`/orbits/${orbitId}/members/${userId}`),
  createGoal: (orbitId, data) => api.post(`/orbits/${orbitId}/goals`, data),
  contribute: (orbitId, goalId, data = { amount: 1 }) =>
    api.post(`/orbits/${orbitId}/goals/${goalId}/contribute`, data),
};

export default api;
