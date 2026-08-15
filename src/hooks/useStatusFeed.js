import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useStatusFeed() {
  const [statuses, setStatuses] = useState([]);

  const load = useCallback(async () => {
    const {
      data: statusData,
      error: statusError,
    } = await supabase
      .from("live_statuses")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(30);

    if (statusError) {
      console.error("STATUS ERROR:", statusError);
      return;
    }

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        user_id,
        alias,
        name,
        avatar_url,
        banner_url,
        expression_badges,
        intent_tags,
        topics
      `);

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      return;
    }

    const merged = statusData.map((status) => {
      const profile = profileData.find(
        (p) => p.user_id === status.user_id
      );

      return {
        ...status,
        profile,
      };
    });

    setStatuses(merged);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel("status-feed")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_statuses",
        },
        () => {
          load();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  return {
    statuses,
    reload: load,
  };
}
