import React, { useState, useCallback, memo } from "react";
import { MessageCircle, Phone } from "lucide-react";

import MessagesModal from "./MessagesModal";
import CallModal from "./CallModal";
import SupportModal from "./SupportModal";
import { getRelationship, canCall } from "../lib/interactionRules";

function HostCard({ host, user, onViewProfile, onOpenExplorer, hasProfile, openMedia }) {

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

  const normalizeArray = useCallback((value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value;

    if (typeof value === "string") {
      return value
        .replace(/[{}"]/g, "")
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    }

    return [];
  }, []);

  const normalizedTopics = normalizeArray(topics);
  const normalizedIntent = normalizeArray(intent_tags);

// ================= MODAL STATE =================
const [showMessageModal, setShowMessageModal] = useState(false);
const [showCallModal, setShowCallModal] = useState(false);
const [callType, setCallType] = useState(null);
const [showSupportModal, setShowSupportModal] = useState(false);

  const handleMedia = useCallback(
    (url) => {
      openMedia?.({ type: "image", items: [url], index: 0 });
    },
    [openMedia]
  );

  const handleWave = useCallback(async () => {
  if (!user?.id) return alert("Login required");
  if (!user_id) return alert("Invalid host");

  await fetch("/api/wave", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from_user: user.id, to_user: user_id }),
  });

  alert("👋 Wave sent!");
}, [user?.id, user_id]);

const handleLove = () => {
  alert("❤️ Added to favorites");
};

const handleTip = () => {
  setShowSupportModal(true);
};

const handleCallClick = useCallback(
  async (type) => {
    if (!user?.id) return alert("Login required");
    if (!hasProfile) return alert("Create profile first");

    const relation = await getRelationship(user.id, user_id);
    if (!canCall(relation)) return alert("You need a connection");

    setCallType(type);
    setShowCallModal(true);
  },
  [user?.id, user_id, hasProfile]
);

return (
  <div style={card}>

      {/* BANNER */}
      <div
        style={{
          height: "100%",
          width: "100%",
          backgroundImage: banner_url
            ? `url(${banner_url})`
            : "linear-gradient(135deg,#7c3aed,#3b82f6)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "absolute",
          inset: 0,
        }}
        onClick={() => banner_url && handleMedia(banner_url)}
      />

  

      {/* TOP RIGHT - VIEW PROFILE */}
      <button
        style={viewProfileBtn}
        onClick={(e) => {
          e.stopPropagation();
          onViewProfile?.();
        }}
      >
        View Profile
      </button>

      <div style={actionRail}>

  <button
    style={railBtn}
    onClick={handleWave}
  >
    👋
  </button>

  <button
    style={railBtn}
    onClick={handleLove}
  >
    ❤️
  </button>

  <button
    style={railBtn}
    onClick={handleTip}
  >
    💰
  </button>

</div>

      {/* CONTENT */}
      {/* CONTENT */}
<div style={content}>

  <img
    src={avatarSrc}
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

  {/* MESSAGE */}
  <button
  style={messageButton}
  onClick={() => setShowMessageModal(true)}
>
  <span>Message</span>
  <MessageCircle size={28} color="#3b82f6" />
</button>

<button
  style={callButton}
  onClick={() => handleCallClick("video")}
>
  <span>Voice / Video</span>
  <Phone size={28} color="#22c55e" />
</button>

</div>

</div>   {/* 👈 THIS IS CRITICAL */}

      {/* MODALS */}
      {showMessageModal && (
        <MessagesModal host={host} user={user} onClose={() => setShowMessageModal(false)} />
      )}

      {showCallModal && (
        <CallModal host={host} user={user} callType={callType} onClose={() => setShowCallModal(false)} />
      )}

      {showSupportModal && (
        <SupportModal host={host} user={user} onClose={() => setShowSupportModal(false)} />
      )}
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

/* TOP BUTTONS */
const discoverBtn = {
  position: "absolute",
  top: 14,
  left: 14,
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 800,
  zIndex: 10,
};

const viewProfileBtn = {
  position: "absolute",
  top: 40,
  right: 16,

  background: "rgba(0,0,0,0.65)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.25)",

  padding: "14px 18px",   // 🔥 bigger
  borderRadius: 14,

  fontSize: 15,           // 🔥 bigger text
  fontWeight: 800,

  zIndex: 10,
};

/* WAVE */
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
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  fontSize: 18,
};

/* CONTENT */
const content = {
  position: "absolute",
  bottom: 170,   // ⬆ move UP (was 80)
  width: "100%",
  padding: 16,
  color: "#fff",
  zIndex: 5,
};

/* AVATAR (FIXED ROUND + BIGGER) */
const avatarStyle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  border: "4px solid white",
  objectFit: "cover",
};

/* TEXT */
const title = {
  fontSize: 22,
  fontWeight: 800,
  marginTop: 10,
};

/* TAGS */
const tagRow = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
  marginTop: 6,
};

const intentTag = {
  background: "#d1fae5",
  color: "#065f46",
  padding: "6px 10px",   // ⬆ bigger
  borderRadius: 10,
  fontSize: 12,          // ⬆ bigger
  fontWeight: 700,
};

const topicTag = {
  background: "#ede9fe",
  color: "#5b21b6",
  padding: "6px 10px",   // ⬆ bigger
  borderRadius: 10,
  fontSize: 12,          // ⬆ bigger
  fontWeight: 700,
};

/* BUTTON GRID */
const actionButtons = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 14,
};

const glassButton = {
  background: "rgba(255,255,255,0.12)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#fff",
  borderRadius: 14,
  padding: "14px 12px",
  fontWeight: 700,
  fontSize: 14,
};
const messageButton = {
  background: "rgba(59,130,246,0.12)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(59,130,246,0.35)",
  color: "#60a5fa",
  borderRadius: 14,
  padding: "14px 12px",
  fontWeight: 700,
  fontSize: 14,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const callButton = {
  background: "rgba(34,197,94,0.12)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(34,197,94,0.35)",
  color: "#22c55e",
  borderRadius: 14,
  padding: "14px 12px",
  fontWeight: 700,
  fontSize: 14,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};