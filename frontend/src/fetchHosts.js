// src/fetchHosts.js
import { supabase } from "./supabaseClient.js";

export async function fetchHosts() {
  try {
    const { data, error } = await supabase.from("hosts").select("*");

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }

    const normalized = (data || []).map((host) => ({
      ...host,
      // convert topics from comma string to array
      topics: typeof host.topics === "string"
        ? host.topics.split(",").map(t => t.trim())
        : [],
      // ensure intent_tags is array
      intent_tags: Array.isArray(host.intent_tags) ? host.intent_tags : [],
      avatar: host.avatar || "/default-avatar.png",
      islive: host.islive === true,
    }));

    console.log("Normalized hosts:", normalized);
    return normalized;
  } catch (err) {
    console.error("fetchHosts() failed:", err);
    return [];
  }
}
