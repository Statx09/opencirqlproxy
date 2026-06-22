export function normalizeHost(host = {}) {
  return {
    id: host.user_id,

    // identity core
    name: host.name || host.alias || "Unknown",
    avatar: host.avatar_url || host.avatar || null,
    banner: host.banner_url || null,

    // content
    bio: host.bio || "",
    topics: normalizeList(host.topics),
    intents: normalizeList(host.intent_tags),

    // expression system (THIS is your “non-dating identity layer”)
    badges: normalizeList(host.badges),          // ideology / flags / symbols
    expressions: normalizeList(host.expressions), // vibe / personality tags

    // meta
    verified: host.verified || false,
    online: host.online || false,
  };
}

function normalizeList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .replace(/[{}"]/g, "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}