import { supabase } from "../lib/supabaseClient";

export async function fetchProfile(userId) {
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function saveProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, {
      onConflict: "user_id",
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function uploadImage(file, bucket, userId) {
  if (!file) return null;

  const ext = file.name.split(".").pop();
  const filename = `${userId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filename);

  return data.publicUrl;
}