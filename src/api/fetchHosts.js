import { supabase } from "../lib/supabaseClient";
import { normalizeHost } from "../utils/normalizeHost";

export async function fetchHosts() {
  console.log("🔥 FETCHHOSTS RUNNING");

  /* ================= LOAD PROFILES ================= */

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*");

  if (profileError) {
    console.error("Profile fetch error:", profileError);
    return [];
  }

  /* ================= LOAD PRESENCE ================= */

  const { data: presences, error: presenceError } = await supabase
    .from("user_presence")
    .select("*");

  if (presenceError) {
    console.error("Presence fetch error:", presenceError);
  }

  /* ================= BUILD PRESENCE LOOKUP ================= */

  const presenceMap = {};

  (presences || []).forEach((presence) => {
    presenceMap[presence.user_id] = presence.presence;
  });

  /* ================= NORMALIZE ================= */

  const result = (profiles || []).map((profile) =>
    normalizeHost({
      ...profile,
      presence: presenceMap[profile.user_id] || "offline",
    })
  );

  /* ================= DEBUG ================= */

  console.log("TOTAL PROFILES:", result.length);

  console.table(
    result.map((host) => ({
      alias: host.alias,
      name: host.name,
      id: host.id,
      user_id: host.user_id,
      avatar: host.avatar,
      banner: host.banner,
      presence: host.presence,
      expressions: host.expressions?.length || 0,
      topics: host.topics?.length || 0,
    }))
  );

  return result;
}