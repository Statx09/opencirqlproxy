import { supabase } from "./supabaseClient";

export async function fetchHosts() {
  const { data, error } = await supabase.from("hosts").select("*");
  return { data, error };
}
