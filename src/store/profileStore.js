import { create } from "zustand";
import { supabase } from "../lib/supabaseClient";

export const useProfileStore = create((set, get) => ({
  profile: null,
  loading: false,

  setProfile: (profile) => set({ profile }),

  fetchProfile: async (userId) => {
    if (!userId) return;

    set({ loading: true });

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    set({ profile: data, loading: false });
  },

  updateLocalProfile: (updates) => {
    const current = get().profile;
    if (!current) return;

    set({
      profile: {
        ...current,
        ...updates,
      },
    });
  },
}));