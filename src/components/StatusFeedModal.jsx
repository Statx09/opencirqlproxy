import React from "react";
import { supabase } from "../lib/supabaseClient";

import ModalShell from "./ui/ModalShell";
import LiveComposer from "./live/LiveComposer";
import LiveFeed from "./live/LiveFeed";

export default function StatusFeedModal({
  statuses = [],
  user,
  onClose,
  onOpenProfile,
  reloadStatuses,
  onAction,
}) {
  const handlePost = async ({ content, expression, post_type = "moment", topic = null, proposed_rate = null, imageFile = null }) => {
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

    let image_url = null;
    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${user.id}/feed/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(storagePath, imageFile, { cacheControl: "3600", upsert: false, contentType: imageFile.type || "image/jpeg" });
      if (uploadError) {
        console.error("FEED IMAGE UPLOAD ERROR:", uploadError);
        return false;
      }
      const { data: publicData } = supabase.storage
        .from("profile_images")
        .getPublicUrl(storagePath);
      image_url = publicData?.publicUrl || null;
      if (!image_url) return false;
    }
    const { data, error } = await supabase
      .from("live_statuses")
      .insert({
        user_id: user.id,
        content,
        expression,
        post_type,
        topic,
        proposed_rate,
        image_url,
        created_at: new Date().toISOString(),
      })
      .select();

    console.log("INSERT DATA:", data);
    console.log("INSERT ERROR:", error);

    if (error) {
      console.error('FEED POST ERROR:', error);
      return false;
    }

    await reloadStatuses?.();
    return true;
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
            user={user}
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
