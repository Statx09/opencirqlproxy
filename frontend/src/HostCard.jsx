import React, { useState } from "react";
import MessagesModal from "./MessagesModal";

export default function HostCard({ host, onJoin, onTip }) {
  const { name, avatar, topics, islive } = host;
  const [showMessageModal, setShowMessageModal] = useState(false);

  return (
    <div
      style={{
        border: `2px solid ${islive ? "#22c55e" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: 16,
        textAlign: "center",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <img
        src={avatar || "/default-avatar.png"}
        alt={name}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          marginBottom: 8,
          objectFit: "cover",
        }}
      />

      <h3 style={{ margin: "8px 0 4px" }}>{name}</h3>
      <p style={{ fontSize: 14, color: "#6b7280" }}>{topics}</p>

      <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 8 }}>
        <button
          onClick={onJoin}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#22c55e",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Call
        </button>

        <button
          onClick={() => setShowMessageModal(true)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#7c3aed",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Message
        </button>

        <button
          onClick={onTip}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            backgroundColor: "#3b82f6",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Tip
        </button>
      </div>

      {islive && (
        <div style={{ marginTop: 10, color: "#22c55e", fontWeight: 700, fontSize: 13 }}>● LIVE</div>
      )}

      {showMessageModal && (
        <MessagesModal host={host} onClose={() => setShowMessageModal(false)} />
      )}
    </div>
  );
}

