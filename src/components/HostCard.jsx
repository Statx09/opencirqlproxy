import React, { useState, useCallback, memo, useMemo } from "react";
import { MessageCircle, Phone } from "lucide-react";

import { getRelationship, canCall } from "../lib/interactionRules";

/* ================= HOST CARD ================= */

function HostCard({
  host,
  user,
  onViewProfile,
  openMedia,
  hasProfile,
  onOpenMessage,
  onOpenCall,
  onOpenSupport,
}) {
  const {
    name,
    alias,
    avatar,
    avatar_url,
    banner_url,
    intent_tags,
    topics,
    user_id,
  } = host;

  const displayName = name || alias || "Unnamed";
  const avatarSrc = avatar_url || avatar;

  /* ---------------- FAST NORMALIZATION (memoized) ---------------- */

  const normalizedTopics = useMemo(() => {
    if (!topics) return [];
    if (Array.isArray(topics)) return topics;

    return String(topics)
      .replace(/[{}"]/g, "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [topics]);

  const normalizedIntent = useMemo(() => {
    if (!intent_tags) return [];
    if (Array.isArray(intent_tags)) return intent_tags;

    return String(intent_tags)
      .replace(/[{}"]/g, "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 2);
  }, [intent_tags]);

  /* ---------------- ACTIONS ---------------- */

  const handleMedia = useCallback(
    (url) => {
      openMedia?.({ type: "image", items: [url], index: 0 });
    },
    [openMedia]
  );

  const handleWave = useCallback(async () => {
  console.log("WAVE CLICKED");
    if (!user?.id) return;

    if (!user_id) return;

    await fetch("/api/wave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_user: user.id,
        to_user: user_id,
      }),
    });
  }, [user?.id, user_id]);

  const handleCallClick = useCallback(
  async (type) => {
    console.log("CALL BUTTON CLICKED");

    if (!user?.id) {
      console.log("NO USER");
      return;
    }

    if (!hasProfile) {
      console.log("NO PROFILE");
      return;
    }

      const relation = await getRelationship(user.id, user_id);

console.log("RELATION:", relation);

if (!canCall(relation)) {
  console.log("CALL BLOCKED");
  return;
}

console.log("OPENING CALL MODAL");

onOpenCall?.({ host, type });
    },
    [user?.id, user_id, hasProfile, host, onOpenCall]
  );

  return (
    <div style={card}>

      {/* ---------------- BANNER (OPTIMIZED) ---------------- */}
      {banner_url ? (
        <img
          src={banner_url}
          loading="lazy"
          decoding="async"
          style={bannerImg}
          onClick={() => handleMedia(banner_url)}
        />
      ) : (
        <div style={fallbackBanner} />
      )}

      {/* VIEW PROFILE */}
      <button
        style={viewProfileBtn}
        onClick={(e) => {
          e.stopPropagation();
          onViewProfile?.();
        }}
      >
        View Profile
      </button>

      {/* ACTION RAIL */}
      <div style={actionRail}>
        <button style={railBtn} onClick={handleWave}>👋</button>
        <button style={railBtn}>❤️</button>
        <button style={railBtn} onClick={() => {
  console.log("SUPPORT BUTTON CLICKED");
  onOpenSupport?.(host);
}}>💰</button>
      </div>

      {/* CONTENT */}
      <div style={content}>

        {/* AVATAR */}
        <img
          src={avatarSrc}
          loading="lazy"
          decoding="async"
          onClick={() => handleMedia(avatarSrc)}
          style={avatarStyle}
        />

        <h3 style={title}>{displayName}</h3>

        <div style={tagRow}>
          {normalizedIntent.map((t, i) => (
            <span key={i} style={intentTag}>{t}</span>
          ))}
        </div>

        <div style={tagRow}>
          {normalizedTopics.map((t, i) => (
            <span key={i} style={topicTag}>{t}</span>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        <div style={actionButtons}>

          <button
            style={messageButton}
            onClick={() => {
  console.log("MESSAGE BUTTON CLICKED");
  onOpenMessage?.(host);
}}
          >
            <span>Message</span>
            <MessageCircle size={26} />
          </button>

          <button
            style={callButton}
            onClick={() => handleCallClick("video")}
          >
            <span>Call</span>
            <Phone size={26} />
          </button>

        </div>

      </div>

    </div>
  );
}

export default memo(HostCard);

/* ================= STYLES ================= */

const card = {
  height: "100dvh",
  width: "100vw",
  margin: 0,
  padding: 0,
  overflow: "hidden",
  background: "#000",
  position: "relative",
};

/* BANNER IMG (KEY FIX) */
const bannerImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
  inset: 0,
};

const fallbackBanner = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
};

const viewProfileBtn = {
  position: "absolute",
  top: 40,
  right: 16,
  background: "rgba(0,0,0,0.65)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.25)",
  padding: "14px 18px",
  borderRadius: 14,
  fontSize: 15,
  fontWeight: 800,
  zIndex: 10,
};

const actionRail = {
  position: "absolute",
  top: 100,
  right: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 10,
};

const railBtn = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.55)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  fontSize: 18,
};

const content = {
  position: "absolute",
  bottom: 170,
  width: "100%",
  padding: 16,
  color: "#fff",
  zIndex: 50,
  pointerEvents: "auto",
};

const avatarStyle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  border: "4px solid white",
  objectFit: "cover",
};

const title = {
  fontSize: 22,
  fontWeight: 800,
  marginTop: 10,
};

const tagRow = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginTop: 6,
};

const intentTag = {
  background: "#d1fae5",
  color: "#065f46",
  padding: "6px 10px",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
};

const topicTag = {
  background: "#ede9fe",
  color: "#5b21b6",
  padding: "6px 10px",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
};

const actionButtons = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 14,
};

const messageButton = {
  background: "rgba(59,130,246,0.12)",
  border: "1px solid rgba(59,130,246,0.35)",
  color: "#60a5fa",
  borderRadius: 14,
  padding: "14px 12px",
  fontWeight: 700,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const callButton = {
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.35)",
  color: "#22c55e",
  borderRadius: 14,
  padding: "14px 12px",
  fontWeight: 700,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};