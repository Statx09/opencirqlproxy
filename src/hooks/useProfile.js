import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  fetchProfile,
  saveProfile,
  uploadImage,
} from "../services/profileService";

export default function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    loadProfile();

    const channel = supabase
      .channel(`profile-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function loadProfile() {
    setLoading(true);

    const p = await fetchProfile(userId);

    setProfile(p);

    setLoading(false);
  }

  async function updateProfile(values) {
    const updated = await saveProfile(values);

    setProfile(updated);

    return updated;
  }

  async function uploadAvatar(file) {
    const url = await uploadImage(file, "avatars", userId);

    return url;
  }

  async function uploadBanner(file) {
    const url = await uploadImage(file, "banners", userId);

    return url;
  }

  return {
    profile,
    loading,
    updateProfile,
    uploadAvatar,
    uploadBanner,
    reload: loadProfile,
  };
}