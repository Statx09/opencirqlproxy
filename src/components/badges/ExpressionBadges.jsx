// src/components/badges/ExpressionBadges.jsx

import React from "react";

export default function ExpressionBadges({ badges = [] }) {
  if (!badges?.length) return null;

  return (
    <div style={wrap}>
      {badges.map((b, i) => (
        <span key={i} style={badge}>
          {b}
        </span>
      ))}
    </div>
  );
}

const wrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 6,
};

const badge = {
  fontSize: 11,
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "white",
};