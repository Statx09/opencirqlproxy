// src/fetchHosts.js
import { supabase } from "./supabaseClient";

export async function fetchHosts() {
  try {
    const { data, error } = await supabase.from("hosts").select("*");

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }

    // Minimal normalization for safe frontend use
    const normalized = (data || []).map((host) => ({
      ...host,
      topics: host.topics || "",
      islive: host.islive === true,  // already boolean
      livelink: host.livelink || null,
    }));

    console.log("Normalized hosts:", normalized);
    return normalized;
  } catch (err) {
    console.error("fetchHosts() failed:", err);
    return [];
  }
}
