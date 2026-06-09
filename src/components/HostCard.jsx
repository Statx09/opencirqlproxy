import React, { useState, useCallback, memo } from "react";

import MessagesModal from "./MessagesModal";
import CallModal from "./CallModal";
import SupportModal from "./SupportModal";
import { getRelationship, canCall } from "../lib/interactionRules";

function HostCard({ host, user, onViewProfile, hasProfile, openMedia }) {
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
    if (!user?.id) return alert("Please login.");
    if (!user_id) return alert("Invalid host.");

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

      if (!canCall(relation)) {
        return alert("You need a connection");
      }

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
          height: 90,
          backgroundImage: banner_url
            ? `url(${banner_url})`
            : "linear-gradient(135deg,#7c3aed,#3b82f6)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          cursor: "pointer",
        }}
        onClick={() => banner_url && handleMedia(banner_url)}
      >
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
      <div style={{ position: "relative", padding: "0 14px 14px" }}>
        <img
          src={avatarSrc}
          loading="lazy"
          decoding="async"
          onClick={() => handleMedia(avatarSrc)}
          style={avatarStyle}
        />

        <button onClick={handleWave} style={waveFloat}>
          👋
        </button>

        <h3 style={title}>{displayName}</h3>

        <div style={tagRow}>
          {normalizedIntent.map((t, i) => (
            <span key={i} style={intentTag}>
              {t}
            </span>
          ))}
        </div>

        <div style={tagRow}>
          {normalizedTopics.map((t, i) => (
            <span key={i} style={topicTag}>
              {t}
            </span>
          ))}
        </div>

        <div style={grid}>
          <button onClick={() => setShowMessageModal(true)} style={purpleBtn}>
            Message
          </button>
          <button onClick={() => handleCallClick("voice")} style={greenBtn}>
            Voice
          </button>
          <button onClick={() => handleCallClick("video")} style={blueBtn}>
            Video
          </button>
          <button onClick={() => setShowSupportModal(true)} style={darkBtn}>
            Support ❤️
          </button>
        </div>
      </div>

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
  width: 220,
  borderRadius: 18,
  overflow: "hidden",
  background: "#fff",
  boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
};

const viewBtn = {
  position: "absolute",
  top: 8,
  right: 8,
  background: "rgba(0,0,0,0.7)",
  color: "#fff",
  border: "none",
  padding: "5px 8px",
  borderRadius: 8,
  fontSize: 11,
};

const avatarStyle = {
  width: 72,
  height: 72,
  borderRadius: "50%",
  marginTop: -36,
  cursor: "pointer",
  border: "4px solid white",
};

const waveFloat = {
  position: "absolute",
  top: 6,
  right: 10,
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "#000",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const title = {
  marginTop: 10,
  marginBottom: 8,
  fontSize: 15,
  fontWeight: 700,
};

const tagRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginBottom: 8,
};

const intentTag = {
  background: "#d1fae5",
  color: "#065f46",
  padding: "3px 6px",
  borderRadius: 6,
  fontSize: 10,
  fontWeight: 600,
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
};

const purpleBtn = { background: "#7c3aed", color: "#fff", border: "none", padding: 8 };
const greenBtn = { background: "#22c55e", color: "#fff", border: "none", padding: 8 };
const blueBtn = { background: "#0ea5e9", color: "#fff", border: "none", padding: 8 };
const darkBtn = { background: "#111827", color: "#fff", border: "none", padding: 8 };