import React, { useCallback, memo, useMemo } from "react";
import { MessageCircle, Phone } from "lucide-react";
import useHostActions from "../hooks/useHostActions";
import ExpressionBadges from "./badges/ExpressionBadges";

function HostCard({
  host,
  user,
  onViewProfile,
  onOpenMessage,
  onOpenCall,
  onOpenSupport,
  variant = "swipe",
}) {
  if (!host) return null;

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

  /* ================= NORMALIZATION ================= */

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
      .slice(0, 3);
  }, [intent_tags]);

  /* ================= ACTIONS ================= */

const actions = useHostActions({
  host,
  user,
  openMessageModal: (host) => onOpenMessage?.({ host }),
  openCallModal: (host) => onOpenCall?.({ host }),
  openTipModal: onOpenSupport,

  sendHostEvent: async ({ type, from, to }) => {
    if (type === "wave") {
      fetch("/api/wave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from_user: from,
          to_user: to,
        }),
      }).catch(console.log);
    }

    if (type === "like") {
      console.log("LIKE CLICKED");
    }
  },
});

const handleProfile = useCallback(() => {
  onViewProfile?.(host);
}, [host, onViewProfile]);

  /* ================= RENDER ================= */

  return (
    <div style={card(variant)}>

      {/* BANNER */}
      {banner_url ? (
        <img src={banner_url} style={banner} />
      ) : (
        <div style={fallbackBanner} />
      )}

      {/* VIEW PROFILE */}
      <button
        style={viewProfileBtn}
        onClick={(e) => {
          e.stopPropagation();
          handleProfile();
        }}
      >
        View Profile
      </button>

      {/* ACTION RAIL */}
      <div style={rail}>
        <button style={railBtn} onClick={actions.wave}>👋</button>
<button style={railBtn} onClick={actions.like}>❤️</button>
<button style={railBtn} onClick={actions.support}>💰</button>
      </div>

      {/* CONTENT */}
      <div style={content}>
        <img src={avatarSrc} style={avatar} />

        <div style={nameStyle}>{displayName}</div>

        <div style={tags}>
          {normalizedIntent.map((t, i) => (
            <span key={i} style={intentTag}>{t}</span>
          ))}
        </div>

        <div style={tags}>
          {normalizedTopics.map((t, i) => (
            <span key={i} style={topicTag}>{t}</span>
          ))}
        </div>

        {/* ACTION BUTTONS */}
        {variant === "swipe" && (
          <div style={buttons}>
            <button
              style={msgBtn}
              onClick={actions.message}
            >
              <MessageCircle size={16} /> Message
            </button>

            <button
              style={callBtn}
              onClick={actions.call}
            >
              <Phone size={16} /> Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(HostCard);

/* ================= STYLES ================= */

const card = (v) => ({
  height: v === "grid" ? 320 : "100dvh",
  width: "100vw",
  position: "relative",
  background: "#000",
  overflow: "hidden",
});

const banner = {
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
  zIndex: 10,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
};

const rail = {
  position: "absolute",
  top: 100,
  right: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 20,
};

const railBtn = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
};

const content = {
  position: "absolute",
  bottom: 160,
  width: "100%",
  padding: 16,
  color: "#fff",
};

const avatar = {
  width: 110,
  height: 110,
  borderRadius: "50%",
  border: "3px solid #fff",
};

const nameStyle = {
  fontSize: 20,
  fontWeight: 800,
  marginTop: 10,
};

const tags = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 6,
};

const intentTag = {
  background: "#d1fae5",
  color: "#065f46",
  padding: "4px 8px",
  borderRadius: 8,
};

const topicTag = {
  background: "#ede9fe",
  color: "#5b21b6",
  padding: "4px 8px",
  borderRadius: 8,
};

const buttons = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 12,
};

const msgBtn = {
  background: "rgba(59,130,246,0.2)",
  color: "#3b82f6",
  border: "1px solid rgba(59,130,246,0.4)",
  padding: 10,
  borderRadius: 10,
};

const callBtn = {
  background: "rgba(34,197,94,0.2)",
  color: "#22c55e",
  border: "1px solid rgba(34,197,94,0.4)",
  padding: 10,
  borderRadius: 10,
};