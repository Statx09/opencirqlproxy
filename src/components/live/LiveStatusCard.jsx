import React, { useEffect, useState } from "react";
import ExpressionBadges from "../expressions/ExpressionBadges";

export default function LiveStatusCard({
  statuses = [],
  onOpen,
}) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (statuses.length <= 1) return;

    const interval = setInterval(() => {
      setVisible(false);

      setTimeout(() => {
        setIndex((i) => (i + 1) % statuses.length);
        setVisible(true);
      }, 220);
    }, 5000);

    return () => clearInterval(interval);
  }, [statuses]);

  if (!statuses.length) return null;

  const status = statuses[index];

  const profile =
    status.profile || status.profiles || {};

  const avatar =
    profile.avatar_url ||
    "https://i.pravatar.cc/150";

  const name =
    profile.alias ||
    profile.name ||
    "Anonymous";

  return (
    <div
      style={{
        ...card,
        opacity: visible ? 1 : 0,
        transform: visible
          ? "translateY(0)"
          : "translateY(-6px)",
      }}
      onClick={() => onOpen?.(status.user_id)}
    >
      <div style={content}>

        <img
          src={avatar}
          style={avatarStyle}
          alt={name}
        />

        <div style={{ flex: 1 }}>

          <div style={headerRow}>

            <div style={nameStyle}>
              {name}
            </div>

            <div style={timeStyle}>
              Just now
            </div>

          </div>

          <ExpressionBadges
            badges={
              status.expression
                ? [status.expression]
                : []
            }
            max={3}
          />

          <div style={message}>
            {status.content}
          </div>

        </div>

      </div>
    </div>
  );
}

/* ====================== */

const card = {
  width: "100%",
  maxWidth: 520,

  margin: "0 auto",

  padding: 16,

  borderRadius: 22,

  background: "rgba(17,24,39,.72)",

  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",

  border: "1px solid rgba(255,255,255,.08)",

  boxShadow: "0 12px 40px rgba(0,0,0,.35)",

  cursor: "pointer",

  transition: "all .25s ease",
};

const content = {
  display: "flex",
  gap: 18,
  alignItems: "flex-start",
};

const avatarStyle = {
  width: 64,
  height: 64,

  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,

  boxShadow: "0 6px 18px rgba(0,0,0,.35)",
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 6,
};

const nameStyle = {
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
};

const timeStyle = {
  color: "#9ca3af",
  fontSize: 12,
};

const message = {
  marginTop: 8,
  color: "#f3f4f6",
  fontSize: 14,
  lineHeight: 1.55,
};