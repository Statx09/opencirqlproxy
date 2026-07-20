import React from "react";

export default function HeroCallCard({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      style={button}
      title="Open Calls Studio"
    >
      📹
    </button>
  );
}

const button = {
  width: 72,
  height: 72,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: 18,

  cursor: "pointer",

  border: "1px solid rgba(255,255,255,.12)",

  background: "rgba(255,255,255,.08)",

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  color: "#fff",

  fontSize: 50,

  boxShadow: "0 8px 30px rgba(0,0,0,.35)",
};