import React, { useState } from "react";
import JitsiRoom from "./jitsi/JitsiRoom";
import { getJitsiRoom } from "../utils/getJitsiRoom";

export default function CallsStudioModal({
  user,
  onClose,
}) {
  const [calling, setCalling] = useState(false);

  if (!user?.id) return null;

  const room = getJitsiRoom(user.id);

  return (
    <div style={overlay}>

      {!calling ? (
        <>
          <div style={header}>
            <div style={title}>
              📹 OpenCall Studio
            </div>

            <button
              onClick={onClose}
              style={closeBtn}
            >
              ✕
            </button>
          </div>

          <div style={studio}>

            <div style={cameraPreview}>
              📷
              <div style={previewText}>
                Camera Preview
              </div>
            </div>

            <h2 style={heading}>
              Ready to start a conversation?
            </h2>

            <p style={subHeading}>
              Launch your private OpenCall Studio.
            </p>

            <button
              style={startBtn}
              onClick={() => setCalling(true)}
            >
              Start Video Studio
            </button>

          </div>
        </>
      ) : (
        <>
          <div style={header}>
            <div style={title}>
              📹 Live Studio
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
        </>
      )}

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

const studio = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: 30,
};

const cameraPreview = {
  width: 220,
  height: 140,
  borderRadius: 18,
  background: "#1f2937",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  color: "#fff",
  fontSize: 42,
  marginBottom: 28,
};

const previewText = {
  fontSize: 14,
  marginTop: 8,
  opacity: 0.7,
};

const heading = {
  color: "#fff",
  margin: 0,
  marginBottom: 12,
};

const subHeading = {
  color: "#94a3b8",
  textAlign: "center",
  maxWidth: 320,
  marginBottom: 40,
};

const startBtn = {
  width: 260,
  height: 54,
  border: "none",
  borderRadius: 16,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
};

const body = {
  flex: 1,
};