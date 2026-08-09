import React, { useState } from "react";
import JitsiRoom from "./jitsi/JitsiRoom";
import { getJitsiRoom } from "../utils/getJitsiRoom";
import ConnectionRequests from "./ConnectionRequests";
import SayThanksModal from "./SayThanksModal";
import {
  Users,
  SlidersHorizontal,
  Heart,
  Shuffle,
  X,
  Mic,
  Video,
  Settings,
} from "lucide-react";

export default function CallsStudioModal({ user, onClose }) {
  const [activePanel, setActivePanel] = useState(null);
  const [showThanks, setShowThanks] = useState(false);

  if (!user?.id) return null;

  const room = getJitsiRoom(user.id);

  const togglePanel = (panelName) => {
    setActivePanel((current) =>
      current === panelName ? null : panelName
    );
  };

  return (
    <div style={overlay}>

      {/* VIDEO */}
      <div style={videoArea}>
        <JitsiRoom
          roomName={room.roomName}
          displayName={user.email || "Guest"}
        />
      </div>

      {/* TOP BAR */}
      <div style={topBar}>
        <div style={title}>OpenCall Studio</div>

        <button
          type="button"
          onClick={onClose}
          style={closeBtn}
          aria-label="Close Call Studio"
          title="Close"
        >
          <X size={20} strokeWidth={2.2} />
        </button>
      </div>

      {/* RIGHT ACTION RAIL */}
      <div style={actionRail}>

        <button
          type="button"
          style={{
            ...actionButton,
            ...(activePanel === "connections"
              ? activeButton
              : {}),
          }}
          onClick={() => togglePanel("connections")}
          aria-label="Connections"
          title="Connections"
        >
          <Users size={20} strokeWidth={2.1} />
        </button>

        <button
          type="button"
          style={{
            ...actionButton,
            ...(activePanel === "controls"
              ? activeButton
              : {}),
          }}
          onClick={() => togglePanel("controls")}
          aria-label="Call Controls"
          title="Call Controls"
        >
          <SlidersHorizontal size={20} strokeWidth={2.1} />
        </button>

        <button
          type="button"
          style={actionButton}
          onClick={() => setShowThanks(true)}
          aria-label="Tip"
          title="Tip"
        >
          <Heart size={20} strokeWidth={2.1} />
        </button>

        <button
          type="button"
          style={actionButton}
          onClick={() => {
            console.log("QUICK CONNECT REQUEST");
          }}
          aria-label="Quick Connect"
          title="Quick Connect"
        >
          <Shuffle size={20} strokeWidth={2.1} />
        </button>

      </div>

      {/* CONNECTIONS PANEL */}
      {activePanel === "connections" && (
        <div style={panel}>

          <div style={panelHeader}>
            <span>Connections</span>

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              style={panelClose}
              aria-label="Close Connections"
            >
              <X size={17} />
            </button>
          </div>

          <div style={panelBody}>
            <ConnectionRequests user={user} />
          </div>

        </div>
      )}

      {/* CALL CONTROLS PANEL */}
      {activePanel === "controls" && (
        <div style={controlPanel}>

          <div style={panelHeader}>
            <span>Call Controls</span>

            <button
              type="button"
              onClick={() => setActivePanel(null)}
              style={panelClose}
              aria-label="Close Call Controls"
            >
              <X size={17} />
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
              <Mic size={22} />
              <span>Microphone</span>
            </button>

            <button
              type="button"
              style={controlAction}
              onClick={() => {
                console.log("Toggle camera");
              }}
            >
              <Video size={22} />
              <span>Camera</span>
            </button>

            <button
              type="button"
              style={controlAction}
              onClick={() => {
                console.log("Open settings");
              }}
            >
              <Settings size={22} />
              <span>Settings</span>
            </button>

          </div>

          <p style={panelHint}>
            Jitsi manages the active microphone and camera controls.
          </p>

        </div>
      )}

      {/* TIP */}
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
  pointerEvents: "none",
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
  cursor: "pointer",
  pointerEvents: "auto",
  boxShadow:
    "0 4px 18px rgba(0,0,0,.28), inset 0 1px rgba(255,255,255,.05)",
};

const actionRail = {
  position: "absolute",
  right: 16,
  top: "50%",
  transform: "translateY(-50%)",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  zIndex: 35,
};

const actionButton = {
  width: 48,
  height: 48,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,.15)",
  background: "rgba(20,20,25,.55)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  color: "#fff",
  cursor: "pointer",
  boxShadow:
    "0 4px 18px rgba(0,0,0,.30), inset 0 1px rgba(255,255,255,.05)",
  transition: "all .2s ease",
};

const activeButton = {
  background: "rgba(124,58,237,.65)",
  border: "1px solid rgba(167,139,250,.55)",
  boxShadow: "0 4px 20px rgba(124,58,237,.30)",
};

const panel = {
  position: "absolute",
  left: 16,
  right: 80,
  bottom: 100,
  maxHeight: "65vh",
  background: "rgba(15,23,42,.92)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 20,
  overflow: "auto",
  zIndex: 40,
  boxShadow: "0 20px 60px rgba(0,0,0,.5)",
};

const panelHeader = {
  height: 56,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 16px",
  color: "#fff",
  fontWeight: 700,
  borderBottom: "1px solid rgba(255,255,255,.08)",
};

const panelClose = {
  width: 34,
  height: 34,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  right: 80,
  top: "50%",
  transform: "translateY(-50%)",
  width: "min(360px, calc(100vw - 110px))",
  paddingBottom: 12,
  background: "rgba(15,23,42,.94)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,.12)",
  borderRadius: 20,
  zIndex: 40,
  boxShadow: "0 20px 60px rgba(0,0,0,.5)",
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
  border: "1px solid rgba(255,255,255,.1)",
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