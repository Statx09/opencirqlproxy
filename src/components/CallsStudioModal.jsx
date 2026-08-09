import React, { useState } from "react";
import JitsiRoom from "./jitsi/JitsiRoom";
import { getJitsiRoom } from "../utils/getJitsiRoom";
import ConnectionRequests from "./ConnectionRequests";
import SayThanksModal from "./SayThanksModal";

export default function CallsStudioModal({
  user,
  onClose,
}) {
  const [activePanel, setActivePanel] = useState(null);
  const [showThanks, setShowThanks] = useState(false);

  if (!user?.id) return null;

  const room = getJitsiRoom(user.id);

  return (
    <div style={overlay}>

      {/* ================= VIDEO ================= */}

      <div style={videoArea}>
        <JitsiRoom
          roomName={room.roomName}
          displayName={user.email || "Guest"}
        />
      </div>

      {/* ================= TOP BAR ================= */}

      <div style={topBar}>

        <div style={title}>
          🎥 OpenCall Studio
        </div>

        <button
          type="button"
          onClick={onClose}
          style={closeBtn}
          aria-label="Close Call Studio"
          title="Close"
        >
          ✕
        </button>

      </div>

      {/* ================= CONNECTIONS PANEL ================= */}

      {activePanel === "connections" && (
        <div style={panel}>
          <div style={panelHeader}>
            <span>Connections</span>

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              style={panelClose}
            >
              ✕
            </button>
          </div>

          <div style={panelBody}>
            <ConnectionRequests user={user} />
          </div>
        </div>
      )}

      {/* ================= CONTROLS PANEL ================= */}

      {activePanel === "controls" && (
        <div style={controlPanel}>

          <div style={panelHeader}>
            <span>Call Controls</span>

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              style={panelClose}
            >
              ✕
            </button>
          </div>

          <div style={controlButtons}>

            <button
              type="button"
              style={controlAction}
              onClick={() => {
                console.log("Toggle microphone");
              }}
            >
              🎤
              <span>Microphone</span>
            </button>

            <button
              type="button"
              style={controlAction}
              onClick={() => {
                console.log("Toggle camera");
              }}
            >
              📹
              <span>Camera</span>
            </button>

            <button
              type="button"
              style={controlAction}
              onClick={() => {
                console.log("Call controls");
              }}
            >
              ⚙️
              <span>Controls</span>
            </button>

          </div>

          <p style={panelHint}>
            Jitsi handles the active microphone and camera controls.
          </p>

        </div>
      )}

      {/* ================= BOTTOM BAR ================= */}

      <div style={bottomBar}>

        {/* CONNECTIONS */}

        <button
          type="button"
          style={studioButton}
          onClick={() =>
            setActivePanel(
              activePanel === "connections"
                ? null
                : "connections"
            )
          }
          aria-label="Connections"
          title="Connections"
        >
          <span style={icon}>👥</span>
          <span style={label}>Connections</span>
        </button>

        {/* CONTROLS */}

        <button
          type="button"
          style={studioButton}
          onClick={() =>
            setActivePanel(
              activePanel === "controls"
                ? null
                : "controls"
            )
          }
          aria-label="Call Controls"
          title="Call Controls"
        >
          <span style={icon}>🎛️</span>
          <span style={label}>Controls</span>
        </button>

        {/* TIP */}

        <button
          type="button"
          style={studioButton}
          onClick={() => setShowThanks(true)}
          aria-label="Tip"
          title="Tip"
        >
          <span style={icon}>💰</span>
          <span style={label}>Tip</span>
        </button>

        {/* QUICK CONNECT */}

        <button
          type="button"
          style={studioButton}
          onClick={() => {
            console.log("QUICK CONNECT REQUEST");
          }}
          aria-label="Quick Connect"
          title="Quick Connect"
        >
          <span style={icon}>🔀</span>
          <span style={label}>Quick Connect</span>
        </button>

      </div>

      {/* ================= TIP MODAL ================= */}

      {showThanks && (
        <SayThanksModal
          host={null}
          user={user}
          onClose={() => setShowThanks(false)}
        />
      )}

    </div>
  );
}

/* =========================================================
   STYLES
========================================================= */

const overlay = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
  background: "#000",
  zIndex: 99999,
  overflow: "hidden",
};

const videoArea = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  background: "#000",
};

const topBar = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,

  height: 64,

  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  padding: "0 18px",

  background:
    "linear-gradient(to bottom, rgba(0,0,0,.75), rgba(0,0,0,0))",

  zIndex: 20,
};

const title = {
  color: "#fff",
  fontSize: 18,
  fontWeight: 700,
  textShadow: "0 2px 8px rgba(0,0,0,.5)",
};

const closeBtn = {
  width: 42,
  height: 42,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,.15)",

  background: "rgba(20,20,25,.55)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  color: "#fff",
  fontSize: 18,

  cursor: "pointer",
};

const bottomBar = {
  position: "absolute",
  left: "50%",
  bottom: 20,

  transform: "translateX(-50%)",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  gap: 10,

  padding: "10px 12px",

  borderRadius: 24,

  background: "rgba(15,23,42,.65)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",

  border: "1px solid rgba(255,255,255,.12)",

  boxShadow:
    "0 12px 35px rgba(0,0,0,.45)",

  zIndex: 30,
};

const studioButton = {
  width: 64,
  height: 64,

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  gap: 4,

  borderRadius: "50%",

  border: "1px solid rgba(255,255,255,.12)",

  background: "rgba(255,255,255,.08)",

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  color: "#fff",

  cursor: "pointer",

  transition: "all .2s ease",
};

const icon = {
  fontSize: 20,
  lineHeight: 1,
};

const label = {
  fontSize: 9,
  opacity: 0.75,
  whiteSpace: "nowrap",
};

const panel = {
  position: "absolute",

  left: 16,
  right: 16,
  bottom: 110,

  maxHeight: "65vh",

  background: "rgba(15,23,42,.92)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",

  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 20,

  overflow: "auto",

  zIndex: 40,

  boxShadow:
    "0 20px 60px rgba(0,0,0,.5)",
};

const panelHeader = {
  height: 56,

  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",

  padding: "0 16px",

  color: "#fff",
  fontWeight: 700,

  borderBottom:
    "1px solid rgba(255,255,255,.08)",
};

const panelClose = {
  width: 34,
  height: 34,

  borderRadius: "50%",

  border: "none",

  background: "rgba(255,255,255,.08)",

  color: "#fff",

  cursor: "pointer",
};

const panelBody = {
  padding: 12,
};

const controlPanel = {
  position: "absolute",

  left: "50%",
  bottom: 110,

  transform: "translateX(-50%)",

  width: "min(420px, calc(100vw - 32px))",

  paddingBottom: 12,

  background: "rgba(15,23,42,.94)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",

  border:
    "1px solid rgba(255,255,255,.12)",

  borderRadius: 20,

  zIndex: 40,

  boxShadow:
    "0 20px 60px rgba(0,0,0,.5)",
};

const controlButtons = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 10,

  padding: 16,
};

const controlAction = {
  minHeight: 70,

  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",

  gap: 6,

  borderRadius: 14,

  border:
    "1px solid rgba(255,255,255,.1)",

  background: "rgba(255,255,255,.06)",

  color: "#fff",

  cursor: "pointer",

  fontSize: 13,
};

const panelHint = {
  margin: "0 16px",

  color: "#94a3b8",

  fontSize: 12,

  textAlign: "center",
};