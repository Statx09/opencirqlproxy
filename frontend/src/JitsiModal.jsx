import React from "react";

export default function JitsiModal({ host, onClose }) {
  if (!host || !host.livelink) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "90%",
          maxWidth: 800,
          background: "#fff",
          borderRadius: 12,
          padding: 16,
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "red",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "4px 8px",
            cursor: "pointer",
          }}
        >
          Close
        </button>

        <iframe
          title={`Jitsi call - ${host.name}`}
          src={host.livelink}
          style={{ width: "100%", height: "500px", border: "none", borderRadius: 8 }}
          allow="camera; microphone; fullscreen; display-capture"
        />
      </div>
    </div>
  );
}
