// src/HostCard.jsx
import React, { useState } from "react";
import MessagesModal from "./MessagesModal";

export default function HostCard({ host, onJoin, onTip, onViewProfile }) {
  const { name, avatar, topics, intent_tags, islive } = host;
  const [showMessageModal, setShowMessageModal] = useState(false);

  return (
    <div
      style={{
        border: `2px solid ${islive ? "#22c55e" : "#e5e7eb"}`,
        borderRadius: 12,
        padding: 16,
        backgroundColor: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center"
      }}
    >
      {/* Online/Offline Pill Top-Left */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          padding: "4px 8px",
          borderRadius: 8,
          fontWeight: 600,
          backgroundColor: islive ? "#22c55e" : "#ef4444",
          color: "#fff",
          fontSize: 12
        }}
      >
        {islive ? "Online" : "Offline"}
      </div>

      {/* View Profile button Top-Right */}
      <button
        onClick={onViewProfile}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          backgroundColor: "#000",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          padding: "4px 8px",
          fontSize: 10,
          cursor: "pointer",
        }}
      >
        View Profile
      </button>

      {/* Avatar */}
      <img
        src={avatar}
        alt={name}
        style={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          marginBottom: 8,
          objectFit: "cover",
        }}
      />

      <h3 style={{ margin: "8px 0 12px" }}>{name}</h3>

      {/* Topics and Intent Tags */}
      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        {/* Intent tags on the left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {intent_tags.map((tag) => (
            <span
              key={tag}
              style={{
                backgroundColor: "#2dd4bf", // light teal
                color: "#065f46",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Topics on the right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {topics.map((topic) => (
            <span
              key={topic}
              style={{
                backgroundColor: "#c8a2f2", // lilac
                color: "#4b0082",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
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
            backgroundColor: "#7c3aed", // normal purple
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

      {/* Messages Modal */}
      {showMessageModal && (
        <MessagesModal host={host} onClose={() => setShowMessageModal(false)} />
      )}
    </div>
  );
}


