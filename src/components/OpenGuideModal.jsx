import React, { useState } from "react";

export default function OpenGuideModal({
  onClose,
  messages,
  setMessages,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = {
      role: "user",
      content: text,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      const reply =
        data.reply || "⚠️ No response from server.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Something went wrong. Try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          zIndex: 99998,
        }}
      />

      {/* RIGHT PANEL */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: 380,
          background: "#0f172a",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          zIndex: 99999,
          color: "white",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontWeight: 800,
          }}
        >
          <span>Open Guide</span>

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

        {/* CHAT */}
        <div
          style={{
            flex: 1,
            padding: 12,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf:
                  m.role === "user"
                    ? "flex-end"
                    : "flex-start",
                maxWidth: "80%",
                padding: 10,
                borderRadius: 12,
                background:
                  m.role === "user"
                    ? "rgba(124,58,237,0.25)"
                    : "rgba(255,255,255,0.06)",
                fontSize: 13,
                lineHeight: "18px",
              }}
            >
              <strong
                style={{
                  fontSize: 11,
                  opacity: 0.7,
                }}
              >
                {m.role === "user"
                  ? "You"
                  : "Guide"}
              </strong>

              <div>{m.content}</div>
            </div>
          ))}

          {loading && (
            <div
              style={{
                fontSize: 12,
                opacity: 0.6,
              }}
            >
              Guide is typing...
            </div>
          )}
        </div>

        {/* INPUT */}
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: 10,
            borderTop:
              "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage(input);
              }
            }}
            placeholder="Ask something..."
            style={{
              flex: 1,
              padding: 10,
              borderRadius: 10,
              border:
                "1px solid rgba(255,255,255,0.08)",
              background: "#111827",
              color: "white",
              outline: "none",
            }}
          />

          <button
            onClick={() => sendMessage(input)}
            disabled={loading}
            style={{
              background: "#7c3aed",
              border: "none",
              color: "white",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
}