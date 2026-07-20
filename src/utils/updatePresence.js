import { supabase } from "../lib/supabaseClient";

export async function updatePresence(userId, presence) {
  if (!userId) return;

  const payload = {
    user_id: userId,
    presence,
    is_online: presence !== "offline",
    last_active: new Date().toISOString(),
  };

  // Check if a row already exists
  const { data: existing } = await supabase
    .from("user_presence")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  let error;

  if (existing) {
    ({ error } = await supabase
      .from("user_presence")
      .update(payload)
      .eq("user_id", userId));
  } else {
    ({ error } = await supabase
      .from("user_presence")
      .insert(payload));
  }

  if (error) {
    console.error("Presence update failed:", error);
  }
}