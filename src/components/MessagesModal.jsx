import React, { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MessagesModal({ host, user, onClose }) {
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

      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      });
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