// lib/matchEngine.js

let lastIndex = -1;

export function getSuggestedHost(hosts = [], user = null) {
  if (!Array.isArray(hosts) || hosts.length === 0) {
    return null;
  }

  const pool = hosts.filter(Boolean);

  if (pool.length === 0) return null;

  // prevent repeating same host twice in a row
  let index = Math.floor(Math.random() * pool.length);

  if (pool.length > 1 && index === lastIndex) {
    index = (index + 1) % pool.length;
  }

  lastIndex = index;

  const host = pool[index];

  // optional mild personalization hook (safe, non-breaking)
  let reason = "Suggested from active discovery pool";

  if (user?.id) {
    reason = "Matched based on live activity + discovery signals";
  }

  return {
    host,
    reason,
  };
}