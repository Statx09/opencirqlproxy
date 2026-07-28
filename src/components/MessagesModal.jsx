import React, { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MessagesModal({
  host,
  user,
  onClose,
  onMessageSent, 
}) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  const hostId = host?.user_id ?? host?.id;

  const displayName = host?.alias || host?.name || "Host";

  const avatar =
    host?.avatar_url ||
    host?.avatar ||
    "https://placehold.co/100x100";

  /* ================= LOAD MESSAGES ================= */

  const loadMessages = useCallback(async () => {
    if (!user?.id || !hostId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${hostId}),and(sender_id.eq.${hostId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    if (error) console.error(error);

    setMessages(data || []);
    setLoading(false);

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, [user?.id, hostId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

/* ================= SEND MESSAGE ================= */

const sendMessage = async () => {
  if (!message.trim() || !user?.id || !hostId) return;

  try {
    const res = await fetch("http://localhost:3000/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender_id: user.id,
        receiver_id: hostId,
        text: message,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json.error || "Failed to send message");
    }

    const data = json.message;

    setMessages((prev) => [
      ...prev,
      data,
      ...(json.ai_message ? [json.ai_message] : []),
    ]);

    setMessage("");

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    });

    if (onMessageSent) {
      onMessageSent();
    }

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};



  /* ================= EARLY SAFE GUARD (FIXED) ================= */

  if (!host || !user) return null;

  /* ================= UI ================= */

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        {/* HEADER */}
        <div style={header}>
          <div style={headerLeft}>
            <img src={avatar} alt={displayName} style={avatarStyle} />

            <div>
              <h3 style={{ margin: 0 }}>{displayName}</h3>
              <p style={statusText}>💬 Open chat</p>
            </div>
          </div>

          <button onClick={onClose} style={closeBtn}>
            ✕
          </button>
        </div>

        {/* CHAT */}
        <div style={chatArea}>
          {loading && <p>Loading...</p>}

          {!loading &&
            messages.map((msg) => {
              const mine = msg.sender_id === user.id;

              return (
                <div
                  key={msg.id}
                  style={{
                    display: "flex",
                    justifyContent: mine ? "flex-end" : "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      ...bubble,
                      background: mine ? "#7c3aed" : "#f3f4f6",
                      color: mine ? "#fff" : "#111",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div style={inputArea}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            style={input}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button onClick={sendMessage} style={sendBtn}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const modal = {
  width: "100%",
  maxWidth: 700,
  height: "100vh",
  background: "#fff",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const header = {
  padding: 16,
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
};

const headerLeft = {
  display: "flex",
  gap: 10,
  alignItems: "center",
};

const avatarStyle = {
  width: 45,
  height: 45,
  borderRadius: "50%",
};

const statusText = {
  margin: 0,
  fontSize: 12,
  color: "#666",
};

const closeBtn = {
  border: "none",
  background: "#111827",
  color: "#fff",
  width: 34,
  height: 34,
  borderRadius: "50%",
  cursor: "pointer",
};

const chatArea = {
  flex: 1,
  padding: 12,
  overflowY: "auto",
  background: "#fafafa",
};

const bubble = {
  padding: "10px 12px",
  borderRadius: 14,
  maxWidth: "70%",
};

const inputArea = {
  display: "flex",
  gap: 10,
  padding: 16,
  borderTop: "1px solid #eee",
};

const input = {
  flex: 1,
  padding: 10,
  borderRadius: 10,
  border: "1px solid #ddd",
};

const sendBtn = {
  padding: "10px 16px",
  borderRadius: 10,
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};