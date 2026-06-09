import { supabase } from "../lib/supabaseClient";

export async function getConnectionStatus(userId, hostId) {
  if (!userId || !hostId) return null;

  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .or(
      `and(user_a.eq.${userId},user_b.eq.${hostId}),and(user_a.eq.${hostId},user_b.eq.${userId})`
    )
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}