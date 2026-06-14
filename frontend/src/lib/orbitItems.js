import { orbitApi } from "@/lib/api";

export async function getOrbitItems() {
  const { data } = await orbitApi.list();
  const orbits = Array.isArray(data) ? data : data?.items || [];
  const dashboards = await Promise.allSettled(orbits.map((orbit) => orbitApi.getDashboard(orbit.id)));
  const habits = [];
  const tasks = [];
  dashboards.forEach((result, index) => {
    if (result.status !== "fulfilled") return;
    const dashboard = result.value.data;
    const orbit = dashboard?.orbit || orbits[index];
    const shared = { is_orbit_item: true, orbit_id: orbit.id, orbit_name: orbit.name || "Shared Orbit" };
    (dashboard?.shared_habits || []).forEach((item) => habits.push({ ...item, ...shared, orbit_item_type: "habit", _list_key: `orbit-habit-${orbit.id}-${item.id}` }));
    (dashboard?.shared_tasks || []).forEach((item) => tasks.push({ ...item, ...shared, orbit_item_type: "task", _list_key: `orbit-task-${orbit.id}-${item.id}` }));
  });
  return { habits, tasks };
}

export function mergeUnique(personal, orbitItems, type) {
  const all = [
    ...personal.map((item) => ({ ...item, _list_key: `personal-${type}-${item.id || item._id}` })),
    ...orbitItems,
  ];
  return [...new Map(all.map((item) => [item._list_key, item])).values()];
}
