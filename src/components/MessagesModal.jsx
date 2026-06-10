import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MessagesModal({ host, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  const displayName = host?.alias || host?.name || "Host";

  const avatar =
    host?.avatar_url ||
    host?.avatar ||
    "https://placehold.co/100x100";

  const hostId = host?.user_id ?? host?.id ?? null;

  // ---------------- SAFETY GUARD ----------------
  if (!user?.id || !hostId) return null;

  // ---------------- LOAD MESSAGES ----------------
  useEffect(() => {
    loadMessages();
  }, [user?.id, hostId]);

  const loadMessages = async () => {
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

    scrollToBottom();
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  // ---------------- SEND MESSAGE (USES API) ----------------
  const sendMessage = async () => {
    if (!message.trim() || !user?.id || !hostId) return;

    try {
      const res = await fetch("/api/message", {
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to send message");
      }

      setMessages((prev) => [...prev, data.message]);
      setMessage("");

      scrollToBottom();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // ---------------- CONNECTION REQUEST ----------------
  const requestConnection = async () => {
    if (!user?.id || !hostId) return;

    if (hostId === user.id) {
      return alert("You cannot connect with yourself");
    }

    const { data: existing } = await supabase
      .from("connections")
      .select("*")
      .or(
        `and(user_a.eq.${user.id},user_b.eq.${hostId}),and(user_a.eq.${hostId},user_b.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      return alert("Connection already exists 💜");
    }

    const { error } = await supabase.from("connections").insert({
      user_a: user.id,
      user_b: hostId,
      status: "pending",
    });

    if (error) {
      console.error(error);
      return alert(error.message || "Failed to send request");
    }

    alert("Connection request sent 💜");
  };

  return (
    <div style={overlay}>
      <div style={modal}>
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

        {/* CONNECTION CTA */}
        <div style={connectionBar}>
          <button onClick={requestConnection} style={connectBtn}>
            💜 Request Connection (Unlock Calls)
          </button>
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
  borderRadius: 0,
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
};

const chatArea = {
  flex: 1,
  padding: 12,
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  background: "#fafafa",
};

const bubble = {
  padding: "10px 12px",
  borderRadius: 14,
  maxWidth: "70%",
};

const connectionBar = {
  padding: 10,
  borderTop: "1px solid #eee",
};

const connectBtn = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  fontWeight: 700,
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
};