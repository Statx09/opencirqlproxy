export function normalizeHost(host = {}) {
  return {
    ...host,

    id: host.id,

    user_id: host.user_id || host.id,

    avatar:
      host.avatar_url ||
      host.avatar ||
      null,

    banner:
      host.banner_url ||
      host.banner ||
      null,

    name:
      host.alias ||
      host.name ||
      "Unnamed",

    topics: safeArray(host.topics),

    intents: safeArray(host.intent_tags),

    flags: safeArray(
      host.flags || host.core_badges
    ),

    expressions: safeArray(
      host.expressions ||
      host.expression_badges
    ),

    interests: safeArray(
      host.interests ||
      host.stance_badges
    ),
  };
}


function safeArray(input) {
  if (!input) return [];

  if (Array.isArray(input)) return input;

  return String(input)
    .replace(/[{}"]/g,"")
    .split(",")
    .map(t=>t.trim())
    .filter(Boolean);
}