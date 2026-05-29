const KEY = 'recentlyViewedIds';
const MAX = 6;

export function getRecentlyViewed() {
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids : [];
  } catch {
    return [];
  }
}

export function pushRecentlyViewed(id) {
  if (typeof id !== 'number' && typeof id !== 'string') return;
  const numId = Number(id);
  if (Number.isNaN(numId)) return;
  const current = getRecentlyViewed().filter((x) => x !== numId);
  const next = [numId, ...current].slice(0, MAX);
  localStorage.setItem(KEY, JSON.stringify(next));
}
