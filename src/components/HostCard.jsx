import React, { memo, useMemo, useCallback } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { normalizeArray } from "../utils/profileHelpers";
import ExpressionBadges from "./expressions/ExpressionBadges";

function HostCard({ host, onAction, variant = "swipe" }) {
  if (!host) return null;

  const {
  name,
  alias,
  avatar_url,
  avatar: avatarImage,
  banner_url,
  topics,
} = host;

  const displayName = name || alias || "Unnamed";
  const avatarSrc = avatar_url || avatarImage || "";

  const flags = normalizeArray(host?.flags);
  const expressions = normalizeArray(
  host?.expressions || host?.expression_badges
);

  const normalizedTopics = useMemo(() => {
    if (!topics) return [];
    if (Array.isArray(topics)) return topics;
    return String(topics).split(",").map(t => t.trim()).filter(Boolean);
  }, [topics]);


  const handle = useCallback(
    (type) => {
      onAction?.(type, host);
    },
    [onAction, host]
  );

console.log("HOSTCARD HOST", host);
console.log("HOSTCARD user_id:", host.user_id);
console.log("HOSTCARD id:", host.id);
console.log("HOSTCARD expression_badges", host.expression_badges);
console.log("HOSTCARD expressions", host.expressions);
console.log("HOSTCARD normalized", expressions);

  return (
    <div style={container}>

      {/* BANNER */}
      {banner_url ? (
        <img src={banner_url} style={banner} />
      ) : (
        <div style={fallbackBanner} />
      )}

      {/* PROFILE BUTTON */}
      <button
        style={viewProfileBtn}
        onClick={() => handle("profile")}
      >
        View Profile
      </button>

      {/* ACTION RAIL */}
      <div style={rail}>
        <button style={railBtn} onClick={() => handle("wave")}>👋</button>
        <button style={railBtn} onClick={() => handle("like")}>❤️</button>
        <button style={railBtn} onClick={() => handle("support")}>💰</button>
      </div>

      {/* CONTENT */}
      <div style={content}>

        <img src={avatarSrc} style={avatarStyle} />

        <div style={nameStyle}>{displayName}</div>

{host.headline && (
  <div style={headlineStyle}>
    {host.headline}
  </div>
)}

{host.headline && (
  <div
    style={{
      opacity: 0.85,
      fontSize: 14,
      marginTop: 4,
      marginBottom: 10,
    }}
  >
    {host.headline}
  </div>
)}

        {/* IDENTITY */}
<div style={identityRow}>

  <ExpressionBadges
    badges={expressions}
    max={5}
  />

  {flags.map((flag) => (
    <div
      key={flag}
      style={flagBubble}
    >
      {flag}
    </div>
  ))}

</div>


        {/* TOPICS */}
        <div style={tags}>
          {normalizedTopics.map((t, i) => (
            <span key={i} style={topicTag}>{t}</span>
          ))}
        </div>

        {/* MESSAGE + CALL */}
        {variant === "swipe" && (
          <div style={buttons}>

            <button
              style={msgBtn}
              onClick={(e) => {
                e.stopPropagation();
                handle("messages");
              }}
            >
              <MessageCircle size={16} />
              Message
            </button>

            <button
              style={callBtn}
              onClick={(e) => {
                e.stopPropagation();
                handle("call");
              }}
            >
              <Phone size={16} />
              Call
            </button>

          </div>
        )}

        {/* ARROWS (FIXED LOGIC) */}
        {variant === "swipe" && (
          <div style={arrowRow}>

            <button
              style={arrowBtn}
              onClick={(e) => {
                e.stopPropagation();
                handle("prev");
              }}
            >
              ‹
            </button>

            <button
              style={arrowBtn}
              onClick={(e) => {
                e.stopPropagation();
                handle("next");
              }}
            >
              ›
            </button>

          </div>
        )}

      </div>
    </div>
  );
}

export default memo(HostCard);

/* ================= ONLY ADDITIONS (NO LAYOUT CHANGE) ================= */

const leftArrow = {
  position: "absolute",
  left: 10,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 50,
  width: 50,
  height: 50,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  fontSize: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const rightArrow = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 50,
  width: 50,
  height: 50,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  fontSize: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/* keep your existing styles BELOW unchanged */
const container = {
  height: "100dvh",
  width: "100vw",
  position: "relative",
  overflow: "hidden",
  background: "#000",
};

const banner = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: 0,        
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
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
};

const rail = {
  position: "absolute",
  top: 100,
  right: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 9999,        // 🔥 ADD THIS
  pointerEvents: "auto"
};

const railBtn = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "auto"
};

const content = {
  position: "absolute",
  bottom: 140,
  width: "100%",
  padding: 16,
  color: "#fff",
  zIndex: 5,        
};

const avatarStyle = {
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
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const callBtn = {
  background: "rgba(34,197,94,0.2)",
  color: "#22c55e",
  border: "1px solid rgba(34,197,94,0.4)",
  padding: 10,
  borderRadius: 10,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const headlineStyle = {
  marginTop: 6,
  marginBottom: 10,
  fontSize: 15,
  color: "rgba(255,255,255,0.9)",
  fontWeight: 500,
  lineHeight: 1.4,
  textShadow: "0 1px 4px rgba(0,0,0,0.35)",
};

const arrowRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 14,
  padding: "0 10px",
};

const arrowBtn = {
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.25)",
  fontSize: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const expressionChip = {
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  fontSize: 12,
  marginRight: 6,
  display: "inline-block",
};

const identityRow = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
  marginBottom: 8,
};

const flagBubble = {
  padding: "3px 8px",

  borderRadius: 999,

  background: "rgba(255,255,255,.08)",

  border: "1px solid rgba(255,255,255,.10)",

  backdropFilter: "blur(12px)",

  fontSize: 11,

  color: "#fff",
};
