import React, { useState } from "react";

export default function MessagesModal({ host, onClose }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    // demo messages
    { from: host.name, text: "Hi! How can I help?" },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { from: "You", text: message }]);
    setMessage("");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          width: 360,
          maxHeight: "80vh",
          backgroundColor: "#fff",
          borderRadius: 12,
          padding: 16,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>{host.name} Messages</h3>
          <button onClick={onClose} style={{ cursor: "pointer" }}>
            ✖
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            marginTop: 12,
            paddingRight: 4,
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 8,
                textAlign: m.from === "You" ? "right" : "left",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: 12,
                  backgroundColor: m.from === "You" ? "#3b82f6" : "#e5e7eb",
                  color: m.from === "You" ? "#fff" : "#111827",
                  maxWidth: "80%",
                }}
              >
                {m.text}
              </span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", marginTop: 8 }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              marginRight: 8,
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: "8px 16px",
              borderRadius: 12,
              border: "none",
              backgroundColor: "#7c3aed",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
