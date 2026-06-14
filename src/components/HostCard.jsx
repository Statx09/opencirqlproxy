import React, { useState, useCallback, memo } from "react";

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

      {/* WAVE BUTTON */}
      <button style={waveBtn} onClick={handleWave}>
        👋
      </button>

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

        <div style={grid}>
          <button style={purpleBtn} onClick={() => setShowMessageModal(true)}>Message</button>
          <button style={greenBtn} onClick={() => handleCallClick("voice")}>Voice</button>
          <button style={blueBtn} onClick={() => handleCallClick("video")}>Video</button>
          <button style={darkBtn} onClick={() => setShowSupportModal(true)}>Support ❤️</button>
        </div>
      </div>

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
  height: "100%",
  minHeight: "100vh",   // ✅ key fix
  width: "100%",
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
  top: 14,
  right: 14,
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  padding: "10px 14px",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 700,
  zIndex: 10,
};

/* WAVE */
const waveBtn = {
  position: "absolute",
  top: 70,
  right: 14,
  width: 46,
  height: 46,
  borderRadius: "50%",
  background: "#111",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  fontSize: 18,
  zIndex: 10,
};

/* CONTENT */
const content = {
  position: "absolute",
  bottom: 80,   // ✅ IMPORTANT: creates space for dock
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
  padding: "3px 6px",
  borderRadius: 6,
  fontSize: 10,
};

const topicTag = {
  background: "#ede9fe",
  color: "#5b21b6",
  padding: "3px 6px",
  borderRadius: 6,
  fontSize: 10,
};

/* BUTTON GRID */
const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  marginTop: 12,
};

const purpleBtn = { background: "#7c3aed", color: "#fff", border: "none", padding: 10 };
const greenBtn = { background: "#22c55e", color: "#fff", border: "none", padding: 10 };
const blueBtn = { background: "#0ea5e9", color: "#fff", border: "none", padding: 10 };
const darkBtn = { background: "#111827", color: "#fff", border: "none", padding: 10 };