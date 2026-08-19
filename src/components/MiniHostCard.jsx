import React, { memo, useMemo } from "react";
import { normalizeHost } from "../utils/normalizeHost";
import { Hand, Handshake } from "lucide-react";
import ExpressionBadges from "./expressions/ExpressionBadges";
import { useTheme } from "../context/ThemeContext";

function MiniHostCard({ host, user, onAction }) {

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
  <div style={identityRow}>
  <div
    style={{
      ...name,
      color: theme.text,
    }}
  >
    {h.alias || h.name}
  </div>

  {h.headline && (
    <div
      style={{
        ...headline,
        color: theme.text,
      }}
      title={h.headline}
    >
      {h.headline}
    </div>
  )}
</div>

 {/* EXPRESSIONS */}
<ExpressionBadges
  badges={h.expressions || []}
  max={5}
  size={32}
/>

        {/* INTENTS */}
<div style={chipRow}>
  {h.intents.slice(0, 5).map((t, i) => (
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

      {/* ACTION RAIL */}

<div style={rail}>

  <button
    type="button"
    style={{ ...railButton, ...waveButton }}
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
    style={{ ...railButton, ...connectButton }}
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

const card = {
  display: "flex",
  padding: 12,
  background: "#111827",
  borderRadius: 16,
  color: "#fff",
  position: "relative",
  alignItems: "center",
  gap: 12,
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
  flex: 1,
  display: "flex",
  flexDirection: "column",
  gap: 6,
};

const identityRow = {
  display: "flex",
  alignItems: "baseline",
  gap: 14,
  minWidth: 0,
  flexWrap: "wrap",
};

const name = {
  fontWeight: 700,
  fontSize: 14,
  whiteSpace: "nowrap",
};

const headline = {
  fontSize: 13,
  fontWeight: 500,
  fontFamily: "cursive",
  fontStyle: "italic",
  opacity: 0.72,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  maxWidth: 190,
};

/* TAGS */
const chipRow = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

const chip = {
  fontSize: 10,
  padding: "2px 6px",
  background: "#222",
  borderRadius: 999,
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
  flexShrink: 0,
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















