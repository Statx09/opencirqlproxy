import React from "react";

export default function ActionRail({ host, onAction }) {
  if (!host) return null;

  return (
    <div style={rail}>
      <button onClick={() => onAction("wave", host)} style={btn}>
        👋
      </button>

      <button onClick={() => onAction("like", host)} style={btn}>
        ❤️
      </button>

      <button onClick={() => onAction("support", host)} style={btn}>
        💰
      </button>
    </div>
  );
}

const rail = {
  position: "absolute",
  top: 100,
  right: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 99999,
  pointerEvents: "auto",
};

const btn = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};