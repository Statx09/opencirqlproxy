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
  style={{
    ...glassTopButton,
    right: 16,
  }}
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

const glassTopButton = {
  position: "absolute",
  top: 16,

  height: 48,
  padding: "0 18px",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: 16,

  background: "rgba(15,18,28,.72)",

  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",

  border: "1px solid rgba(255,255,255,.10)",

  boxShadow:
    "0 10px 28px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.05)",

  color: "#fff",
  fontWeight: 600,
  fontSize: 15,

  cursor: "pointer",
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
  bottom: 95,   // was 140

  width: "100%",
  padding: 16,

  color: "#fff",
  zIndex: 5,
};

const avatarStyle = {
  width: 140,
  height: 140,
  borderRadius: "50%",
  border: "4px solid rgba(255,255,255,.95)",

  objectFit: "cover",

  boxShadow:
    "0 12px 28px rgba(0,0,0,.45)",

  marginBottom: 8,
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
  background: "rgba(20,20,25,.82)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  color: "#60a5fa",
  border: "1px solid rgba(96,165,250,.35)",

  boxShadow: "0 8px 20px rgba(0,0,0,.35)",

  padding: 10,
  borderRadius: 12,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  gap: 8,
  cursor: "pointer",
};

const callBtn = {
  background: "rgba(20,20,25,.82)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  color: "#4ade80",
  border: "1px solid rgba(74,222,128,.35)",

  boxShadow: "0 8px 20px rgba(0,0,0,.35)",

  padding: 10,
  borderRadius: 12,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  gap: 8,
  cursor: "pointer",
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
