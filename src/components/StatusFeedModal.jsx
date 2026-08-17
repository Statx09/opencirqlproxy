import React from "react";
import { supabase } from "../lib/supabaseClient";

import ModalShell from "./ui/ModalShell";
import LiveComposer from "./live/LiveComposer";
import LiveFeed from "./live/LiveFeed";

export default function StatusFeedModal({
  statuses = [],
  onClose,
  onOpenProfile,
  reloadStatuses,
  onAction,
}) {
  const handlePost = async ({ content, expression }) => {
    console.log("Posting...", {
      content,
      expression,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("No user");
      return;
    }

    const { data, error } = await supabase
      .from("live_statuses")
      .insert({
        user_id: user.id,
        content,
        expression,
        created_at: new Date().toISOString(),
      })
      .select();

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    if (!error) {
      await reloadStatuses?.();
    }
  };

  return (
    <ModalShell
      title="Feed"
      onClose={onClose}
      zIndex={90000}
    >
      <div style={container}>

        {/* SCROLLABLE FEED */}
        <div style={feedWrap}>
          <LiveFeed
            statuses={statuses}
            onOpenProfile={onOpenProfile}
            onAction={onAction}
          />
        </div>

        {/* BOTTOM COMPOSER */}
        <div style={composerWrap}>
          <LiveComposer
            onPost={handlePost}
          />
        </div>

      </div>
    </ModalShell>
  );
}

/* ================= STYLES ================= */

const container = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  background: "transparent",
};

const feedWrap = {
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  overflowX: "hidden",
  background: "transparent",
};

const composerWrap = {
  flexShrink: 0,
  padding: "12px 18px 14px",
  borderTop: "1px solid rgba(255,255,255,.09)",
  background: "rgba(0,0,0,.18)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
};
