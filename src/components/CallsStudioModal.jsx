import React from "react";
import JitsiRoom from "./jitsi/JitsiRoom";
import { getJitsiRoom } from "../utils/getJitsiRoom";

export default function CallsStudioModal({
  user,
  onClose,
}) {
  if (!user?.id) return null;

  const room = getJitsiRoom(user.id);

  return (
    <div style={overlay}>
      <div style={header}>
        <div style={title}>
          📹 Your Studio
        </div>

        <button
          onClick={onClose}
          style={closeBtn}
        >
          ✕
        </button>
      </div>

      <div style={body}>
        <JitsiRoom
          roomName={room.roomName}
          displayName={user.email || "Guest"}
        />
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "#0b1220",
  zIndex: 99999,

  display: "flex",
  flexDirection: "column",
};

const header = {
  height: 64,

  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  padding: "0 20px",

  borderBottom: "1px solid rgba(255,255,255,.08)",

  background: "rgba(17,24,39,.92)",

  backdropFilter: "blur(16px)",
};

const title = {
  color: "#fff",
  fontWeight: 700,
  fontSize: 18,
};

const closeBtn = {
  width: 40,
  height: 40,

  borderRadius: 999,

  border: "none",

  cursor: "pointer",

  background: "#1f2937",

  color: "#fff",

  fontSize: 18,
};

const body = {
  flex: 1,
};