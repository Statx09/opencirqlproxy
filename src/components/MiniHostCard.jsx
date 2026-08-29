import React, { memo, useMemo } from "react";
import { normalizeHost } from "../utils/normalizeHost";
import { Hand, Handshake } from "lucide-react";
import ExpressionBadges from "./expressions/ExpressionBadges";
import { useTheme } from "../context/ThemeContext";

function MiniHostCard({ host, user, onAction }) {

  const [actionFeedback, setActionFeedback] = React.useState(null);

  const showActionFeedback = (type) => {
    setActionFeedback(type);
    window.clearTimeout(showActionFeedback.timer);
    showActionFeedback.timer = window.setTimeout(() => {
      setActionFeedback(null);
    }, 1200);
  };

  const { theme } = useTheme();

  console.log(
    "CARD RECEIVED:",
    host.alias,
    host.name,
    host.id
  );

  const h = useMemo(() => normalizeHost(host), [host]);

console.log("NORMALIZED", h.expressions);
console.log("BANNER:", h.banner);

  console.log("MiniHostCard:", h);

  if (!h) return null;

  const actionAnimationStyle = `
    @keyframes miniHostActionPop {
      from {
        opacity: 0;
        transform: translateY(5px) scale(0.94);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;


  return (
    <div
  style={{
    ...card,

    background: theme.card,
    color: theme.text,

    border:
  h.presence === "in_studio"
    ? "1px solid rgba(139,92,246,.65)"
    : `1px solid ${theme.border}`,

    boxShadow:
      h.presence === "in_studio"
        ? "0 0 22px rgba(139,92,246,.35)"
        : "none",
  }}
  onClick={() => { console.log("MINI CARD PROFILE CLICK:", h); onAction?.("profile", h); }}
>
      {/* AVATAR */}
      <div
  style={{
    ...avatarWrap,

    border:
      h.presence === "online"
        ? "2px solid #22c55e"
        : h.presence === "busy"
        ? "2px solid #ef4444"
        : h.presence === "in_studio"
        ? "2px solid #8b5cf6"
        : "2px solid transparent",

    boxShadow:
      h.presence === "online"
        ? "0 0 12px rgba(34,197,94,.45)"
        : h.presence === "busy"
        ? "0 0 12px rgba(239,68,68,.45)"
        : h.presence === "in_studio"
        ? "0 0 14px rgba(139,92,246,.5)"
        : "none",
  }}
>
  {h.avatar ? (
    <img
      src={h.avatar}
      style={avatarImg}
    />
  ) : (
    <div style={avatarFallback} />
  )}

  {h.presence !== "offline" && (
    <div
      style={{
        ...statusDot,

        background:
          h.presence === "online"
            ? "#22c55e"
            : h.presence === "busy"
            ? "#ef4444"
            : "#8b5cf6",
      }}
    />
  )}

  {h.presence === "in_studio" && (
    <div style={studioBadge}>
      📹
    </div>
  )}
</div>

      {/* CENTER INFO */}
      <div
  style={{
    ...info,
    color: theme.text,
  }}
>
  <div style={identityStack}>
    <div
      style={{
        ...name,
        color: theme.text,
      }}
      title={h.alias || h.name}
    >
      {h.alias || h.name}
    </div>

    <div
      style={{
        ...headline,
        color: theme.text,
      }}
      title={h.headline || ""}
    >
      {h.headline || "\u00A0"}
    </div>
  </div>

 {/* EXPRESSIONS */}
<ExpressionBadges
  badges={h.expressions || []}
  max={5}
  size={36}
/>

        {/* INTENTS */}
<div style={chipRow}>
  {h.intents.slice(0, 3).map((t, i) => (
    <span
      key={i}
      style={{
        ...chip,
        background: theme.surface,
        color: theme.text,
      }}
    >
      {t}
    </span>
  ))}
</div>
        
      </div>

      {actionFeedback && (
        <div
          style={{
            position: "absolute",
            right: 12,
            bottom: 58,
            zIndex: 20,
            padding: "7px 11px",
            borderRadius: 999,
            background: "rgba(15,23,42,0.82)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {actionFeedback === "wave" ? "👋 Waved" : "🤝 Connection sent"}
        </div>
      )}

      {/* ACTION RAIL */}

<div style={rail}>

  <button
    type="button"
    style={{
      ...railButton,
      ...waveButton,
      ...(actionFeedback === "wave" ? feedbackActive : {}),
    }}
    onPointerDown={(e) => {
      e.stopPropagation();
      showActionFeedback("wave");
    }}
    onClick={(e) => {
      e.stopPropagation();
      onAction?.("wave", h);
    }}
    title="Wave"
    aria-label="Wave"
  >
    <Hand size={18} strokeWidth={2} />
  </button>  <button
    type="button"
    style={{
      ...railButton,
      ...connectButton,
      ...(actionFeedback === "connect" ? feedbackActive : {}),
    }}
    onPointerDown={(e) => {
      e.stopPropagation();
      showActionFeedback("connect");
    }}
    onClick={(e) => {
      e.stopPropagation();
      onAction?.("connect", h);
    }}
    title="Connect"
    aria-label="Connect"
  >
    <Handshake size={18} strokeWidth={2} />
  </button>

</div>

    </div>
  );
}

export default memo(MiniHostCard);

/* ================= STYLES ================= */

const feedbackActive = {
  background: "rgba(139,92,246,0.28)",
  border: "1px solid rgba(167,139,250,0.75)",
  boxShadow:
    "0 0 0 3px rgba(139,92,246,0.12), 0 0 18px rgba(139,92,246,0.35)",
  transform: "scale(1.08)",
};

const card = {
  display: "flex",
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  padding: 12,
  background: "#111827",
  borderRadius: 16,
  color: "#fff",
  position: "relative",
  alignItems: "center",
  gap: 12,
  overflow: "hidden",
};

/* AVATAR */
const avatarWrap = {
  width: 75,
  height: 75,
  borderRadius: "50%",
  overflow: "hidden",
  flexShrink: 0,
  position: "relative",
};

const avatarImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const avatarFallback = {
  width: "100%",
  height: "100%",
  background: "#333",
};

const statusDot = {
  position: "absolute",

  right: 2,
  bottom: 2,

  width: 10,
  height: 10,

  borderRadius: "50%",

  border: "2px solid #111827",

  boxShadow: "0 0 8px currentColor",
};

const studioBadge = {
  position: "absolute",

  left: -2,
  top: -2,

  width: 18,
  height: 18,

  borderRadius: "50%",

  background: "#8b5cf6",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: 9,

  border: "2px solid #111827",

  boxShadow: "0 0 12px rgba(139,92,246,.6)",
};

/* INFO */
const info = {
  flex: "1 1 0",
  minWidth: 0,
  maxWidth: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 6,
  overflow: "hidden",
};

const identityStack = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  minWidth: 0,
  width: "100%",
  gap: 2,
};

const name = {
  fontWeight: 700,
  fontSize: 13,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "100%",
  lineHeight: "18px",
};

const headline = {
  fontSize: 12,
  fontWeight: 500,
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontStyle: "italic",
  opacity: 0.72,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "100%",
  lineHeight: "16px",
  minHeight: 16,
};

/* TAGS */
const chipRow = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  flexWrap: "nowrap",
  minWidth: 0,
  width: "100%",
  overflow: "hidden",
};

const chip = {
  fontSize: 10,
  padding: "3px 7px",
  background: "#222",
  borderRadius: 999,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 78,
  minWidth: 0,
  flex: "0 1 auto",
};

/* EXPRESSIONS */
const expressionRow = {
  display: "flex",
  gap: 4,
};

const exprDot = {
  width: 6,
  height: 6,
  borderRadius: 999,
  background: "#7c3aed",
};

/* ACTION BUTTONS (HOSTCARD STYLE FIX) */
const actionRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 8,
  marginTop: 8,
};

const connectButton = {
  color: "#fff",
  background: "rgba(255,255,255,.08)",
  border: "1px solid rgba(255,255,255,.12)",
  boxShadow:
    "0 8px 20px rgba(255,255,255,.08), 0 10px 24px rgba(0,0,0,.28)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};
const messageBtn = {
  background: "rgba(59,130,246,0.2)",
  color: "#3b82f6",
  border: "1px solid rgba(59,130,246,0.4)",

  padding: "4px 0",

  borderRadius: 10,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: 12,
  fontWeight: 600,

  cursor: "pointer",
};

const callBtn = {
  background: "rgba(34,197,94,0.2)",
  color: "#22c55e",
  border: "1px solid rgba(34,197,94,0.4)",

  padding: "4px 0",

  borderRadius: 10,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: 12,
  fontWeight: 600,

  cursor: "pointer",
};

const rail = {
  display: "flex",
  flexDirection: "column",
  gap: 5,
  justifyContent: "center",
  alignItems: "center",
  flex: "0 0 38px",
  width: 38,
  minWidth: 38,
};


const railButton = {
  width: 38,
  height: 38,

  borderRadius: "50%",

  background: "rgba(255,255,255,0.06)",

  border: "1px solid rgba(255,255,255,0.14)",

  color: "#ffffff",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  fontSize: 14,

  cursor: "pointer",

  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",

  boxShadow:
    "0 8px 24px rgba(0,0,0,0.35)",

  transition:
    "transform .2s ease, box-shadow .2s ease",
};

const waveIcon = {
  fontSize: 18,
  lineHeight: 1,
  display: "inline-block",
  transform: "rotate(-8deg)",
};
const waveButton = {
  boxShadow:
    "0 0 14px rgba(255,255,255,.18), 0 10px 24px rgba(0,0,0,.32)",
};


const tipButton = {
  boxShadow:
    "0 0 14px rgba(250,204,21,.55)",
};
































