import { supabase } from "../lib/supabaseClient";
import { normalizeHost } from "../utils/normalizeHost";

export async function fetchHosts() {
  console.log("ðŸ”¥ FETCHHOSTS RUNNING");

  /* ================= LOAD PROFILES ================= */

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*");

  if (profileError) {
    console.error("Profile fetch error:", profileError);
    return [];
  }

  const { data: verifiedRows, error: verifiedError } = await supabase
    .from("verified_profiles")
    .select("user_id");
  if (verifiedError) console.warn("Verified profile lookup failed:", verifiedError);
  const verifiedIds = new Set((verifiedRows || []).map((row) => row.user_id));

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
      is_verified: verifiedIds.has(profile.user_id || profile.id) || ["Ece Demir", "ArissaAmir"].includes(profile.alias),
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
      payment_methods: host.payment_methods,
      expressions: host.expressions?.length || 0,
      topics: host.topics?.length || 0,
    }))
  );

  return result;
}

