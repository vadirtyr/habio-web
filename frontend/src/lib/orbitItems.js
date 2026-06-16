import { orbitApi } from "@/lib/api";

export async function getOrbitItems() {
  const { data } = await orbitApi.list();
  const orbits = Array.isArray(data) ? data : data?.items || [];
  const dashboards = await Promise.allSettled(orbits.map((orbit) => orbitApi.getDashboard(orbit.id)));
  const habits = [];
  const tasks = [];
  const summaries = [];
  const activity = [];
  dashboards.forEach((result, index) => {
    if (result.status !== "fulfilled") return;
    const dashboard = result.value.data;
    const orbit = dashboard?.orbit || orbits[index];
    const stats = dashboard?.stats || {};
    const shared = { is_orbit_item: true, orbit_id: orbit.id, orbit_name: orbit.name || "Shared Orbit" };
    (dashboard?.shared_habits || []).forEach((item) => habits.push({ ...item, ...shared, orbit_item_type: "habit", _list_key: `orbit-habit-${orbit.id}-${item.id}` }));
    (dashboard?.shared_tasks || []).forEach((item) => tasks.push({ ...item, ...shared, orbit_item_type: "task", _list_key: `orbit-task-${orbit.id}-${item.id}` }));
    const recentActivity = dashboard?.recent_activity || [];
    summaries.push({
      ...orbit,
      weekly_completion_rate: stats.weekly_completion_rate || 0,
      weekly_actions: stats.weekly_actions || 0,
      member_count: stats.member_count || orbit.member_count || 0,
      active_challenges_count: (dashboard?.active_challenges || []).length,
      due_count: (dashboard?.shared_habits || []).filter((item) => !item.completed_today).length + (dashboard?.shared_tasks || []).filter((item) => !item.completed).length,
      last_activity_at: recentActivity[0]?.created_at || orbit.updated_at || orbit.created_at,
    });
    recentActivity.forEach((item) => activity.push({ ...item, is_orbit_activity: true, orbit_id: orbit.id, orbit_name: orbit.name || "Shared Orbit", _list_key: `orbit-activity-${orbit.id}-${item.id}` }));
  });
  summaries.sort((a, b) => String(b.last_activity_at || "").localeCompare(String(a.last_activity_at || "")));
  activity.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  return { habits, tasks, orbits: summaries, activity };
}

export function mergeUnique(personal, orbitItems, type) {
  const all = [
    ...personal.map((item) => ({ ...item, is_orbit_item: false, context_label: "Personal", _list_key: `personal-${type}-${item.id || item._id}` })),
    ...orbitItems,
  ];
  return [...new Map(all.map((item) => [item._list_key, item])).values()];
}
