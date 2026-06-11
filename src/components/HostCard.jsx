import React, { useState, useCallback, memo } from "react";

import MessagesModal from "./MessagesModal";
import CallModal from "./CallModal";
import SupportModal from "./SupportModal";
import { getRelationship, canCall } from "../lib/interactionRules";

function HostCard({
  host,
  user,
  onViewProfile,
  onOpenExplorer,   // ✅ ADDED for Discover button
  hasProfile,
  openMedia,
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

  const handleCallClick = useCallback(
    async (type) => {
      if (!user?.id) return alert("Login required");
      if (!hasProfile) return alert("Create profile first");

      const relation = await getRelationship(user.id, user_id);

      if (!canCall(relation)) {
        return alert("You need a connection");
      }

      setCallType(type);
      setShowCallModal(true);
    },
    [user, user_id, hasProfile]
  );

  return (
    <div style={card}>

      {/* BANNER */}
      <div
        style={{
          height: "100vh",
          backgroundImage: banner_url
            ? `url(${banner_url})`
            : "linear-gradient(135deg,#7c3aed,#3b82f6)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
        onClick={() => banner_url && handleMedia(banner_url)}
      >

        {/* 🔍 DISCOVER BUTTON (opens Explorer) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenExplorer?.();
          }}
          style={discoverBtn}
        >
          🔍 Discover
        </button>

        {/* 👤 VIEW PROFILE BUTTON (top right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewProfile?.();
          }}
          style={viewBtn}
        >
          View Profile
        </button>
      </div>

      {/* CONTENT */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: 14,
        }}
      >
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
          <button style={purpleBtn} onClick={() => setShowMessageModal(true)}>
            Message
          </button>
          <button style={greenBtn} onClick={() => handleCallClick("voice")}>
            Voice
          </button>
          <button style={blueBtn} onClick={() => handleCallClick("video")}>
            Video
          </button>
          <button style={darkBtn} onClick={() => setShowSupportModal(true)}>
            Support ❤️
          </button>
        </div>
      </div>

      {/* MODALS */}
      {showMessageModal && (
        <MessagesModal
          host={host}
          user={user}
          onClose={() => setShowMessageModal(false)}
        />
      )}

      {showCallModal && (
        <CallModal
          host={host}
          user={user}
          callType={callType}
          onClose={() => setShowCallModal(false)}
        />
      )}

      {showSupportModal && (
        <SupportModal
          host={host}
          user={user}
          onClose={() => setShowSupportModal(false)}
        />
      )}
    </div>
  );
}

export default memo(HostCard);

/* ================= STYLES ================= */

const card = {
  height: "100vh",
  width: "100%",
  overflow: "hidden",
  background: "#000",
  position: "relative",
};

const discoverBtn = {
  position: "absolute",
  top: 12,
  left: 12,
  background: "rgba(124, 58, 237, 0.95)",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
  zIndex: 10,
};

const viewBtn = {
  position: "absolute",
  top: 12,
  right: 12,
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "none",
  padding: "6px 10px",
  borderRadius: 10,
  fontSize: 12,
  fontWeight: 700,
  zIndex: 10,
};

const avatarStyle = {
  width: 70,
  height: 70,
  borderRadius: "50%",
  border: "3px solid white",
};

const title = {
  color: "#fff",
  fontSize: 18,
  marginTop: 10,
  fontWeight: 700,
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

const grid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 6,
  marginTop: 10,
};

const purpleBtn = { background: "#7c3aed", color: "#fff", border: "none", padding: 8 };
const greenBtn = { background: "#22c55e", color: "#fff", border: "none", padding: 8 };
const blueBtn = { background: "#0ea5e9", color: "#fff", border: "none", padding: 8 };
const darkBtn = { background: "#111827", color: "#fff", border: "none", padding: 8 };