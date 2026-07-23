import React from "react";

export default function HeroCallCard({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      style={button}
      title="Open Calls Studio"
    >
      <span style={title}>
        Calls Studio
      </span>
    </button>
  );
}

const button = {
  flex: 1,

  minHeight: 72,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  cursor: "pointer",

  borderRadius: 18,

  border: "1px solid rgba(255,255,255,.08)",

  background: "rgba(255,255,255,.08)",

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  boxShadow: "0 10px 28px rgba(0,0,0,.35)",

  transition: ".25s",
};

const title = {
  color: "#22c55e",
  fontSize: 18,
  fontWeight: 700,
  letterSpacing: "0.3px",
};