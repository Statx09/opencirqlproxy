import { supabase } from "../lib/supabaseClient";

export async function fetchHosts() {
  const res = await supabase
    .from("profiles")
    .select("*");

  if (res.error) {
    console.error("❌ fetchHosts error:", res.error);
    return [];
  }

  return res.data || [];
}