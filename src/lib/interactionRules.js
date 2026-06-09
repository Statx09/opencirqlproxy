// lib/interactionRules.js

import { supabase } from "./supabaseClient";

/**
 * Returns the connection record between two users
 */
export async function getRelationship(userA, userB) {
  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .or(
      `and(user_a.eq.${userA},user_b.eq.${userB}),and(user_a.eq.${userB},user_b.eq.${userA})`
    )
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

/**
 * Calls only allowed on accepted connections
 */
export function canCall(connection) {
  return connection?.status === "accepted";
}

/**
 * Messaging currently allowed for everyone
 * (you can tighten this later)
 */
export function canMessage() {
  return true;
}

/**
 * Waves currently allowed for everyone
 */
export function canWave() {
  return true;
}

/**
 * Connection requests allowed if not already connected
 */
export function canConnect(connection) {
  return !connection;
}