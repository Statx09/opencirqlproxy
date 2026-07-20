import { supabase } from "../lib/supabaseClient";

export async function fetchMyProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("fetchMyProfile", error);
    return null;
  }

  return data;
}