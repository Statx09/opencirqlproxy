import React from "react";

export default function NotificationsModal({ notifications = [], onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 420,
          maxHeight: 520,
          overflowY: "auto",
          background: "#0f172a",
          borderRadius: 16,
          padding: 16,
          color: "white",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <h3 style={{ margin: 0 }}>Notifications</h3>

          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        {notifications.length === 0 ? (
          <div style={{ opacity: 0.6, fontSize: 13 }}>
            No notifications yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {notifications.map((n, i) => (
              <div
                key={i}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  fontSize: 13,
                  lineHeight: "18px",
                }}
              >
                {n.message || "Notification"}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}