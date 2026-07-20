import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function useStatusFeed() {
  const [statuses, setStatuses] = useState([]);

  useEffect(() => {

    const load = async () => {

      // 1. Load statuses
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
        console.error(
          "STATUS ERROR:",
          statusError
        );
        return;
      }



      // 2. Load profiles with expressions
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
`)



      if (profileError) {
        console.error(
          "PROFILE ERROR:",
          profileError
        );
        return;
      }



      // 3. Merge status + profile data
      const merged = statusData.map((status) => {

        const profile = profileData.find(
          (p) =>
            p.user_id === status.user_id
        );


        console.log("STATUS PROFILE:", {
  id: profile?.id,
  user_id: profile?.user_id,
  alias: profile?.alias,
  name: profile?.name,
  avatar_url: profile?.avatar_url,
  banner_url: profile?.banner_url,
  expression_badges: profile?.expression_badges,
  topics: profile?.topics,
  intent_tags: profile?.intent_tags,
});


        return {
          ...status,

          profile,
        };

      });



      // 4. Add demo statuses if database is empty
      const demoStatuses = [
        {
          id: "demo-1",
          user_id: "demo-zara",
          content:
            "Looking for interesting conversations today 🌍",
          created_at:
            new Date().toISOString(),

          profile: {
            name: "Zara",
            avatar_url:
              "https://i.pravatar.cc/150?img=47",

            expressions: [
              "travel",
              "developer",
              "gaming",
            ],
          },
        },
      ];



      setStatuses([
        ...merged,
        ...(merged.length ? [] : demoStatuses),
      ]);

    };



    load();



    // realtime updates
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

      supabase.removeChannel(
        channel
      );

    };


  }, []);



  return statuses;
}