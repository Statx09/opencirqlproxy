// src/fetchHosts.js
import { supabase } from "./supabaseClient";

export async function fetchHosts() {
  try {
    const { data, error } = await supabase
      .from("hosts")
      .select("*"); // MUST include link, topics, avatar, islive, livelink etc

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("fetchHosts() failed:", err);
    return [];
  }
}
