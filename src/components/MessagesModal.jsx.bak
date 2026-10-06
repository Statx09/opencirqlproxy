import React, { useEffect, useRef, useState, useCallback } from "react";
import { X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../lib/supabaseClient";

export default function MessagesModal({
  host,
  user,
  onClose,
  onMessageSent,
  onMessagesRead,
}) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { theme } = useTheme();

  const hostId = host?.user_id ?? host?.id;

  const displayName = host?.alias || host?.name || "Host";

  const avatar =
    host?.avatar_url ||
    host?.avatar ||
    "https://placehold.co/100x100";

const chatRef = useRef(null);
const inputRef = useRef(null);

const scrollToBottom = () => {
  requestAnimationFrame(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  });
};

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

    scrollToBottom();

  }, [user?.id, hostId]);

  /* ================= MARK MESSAGES READ ================= */

  const markMessagesRead = useCallback(async () => {
    if (!user?.id || !hostId) return;

    const { error } = await supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("receiver_id", user.id)
      .eq("sender_id", hostId)
      .is("event", null)
      .is("read_at", null);

    if (error) {
      console.error("MARK MESSAGES READ ERROR:", error);
      return;
    }

    console.log("MESSAGES MARKED READ");

    if (onMessagesRead) {
      onMessagesRead();
    }
  }, [user?.id, hostId]);

  useEffect(() => {
    loadMessages();
    markMessagesRead();
  }, [loadMessages, markMessagesRead]);

  /* ================= REALTIME MESSAGES ================= */

  useEffect(() => {
    if (!user?.id || !hostId) return;

    const channel = supabase
      .channel(`messages-${user.id}-${hostId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new;

          const belongsToChat =
            (newMessage.sender_id === user.id &&
              newMessage.receiver_id === hostId) ||
            (newMessage.sender_id === hostId &&
              newMessage.receiver_id === user.id);

          if (!belongsToChat) return;

          setMessages((current) => {
            if (current.some((msg) => msg.id === newMessage.id)) {
              return current;
            }

            return [...current, newMessage];
          });

          requestAnimationFrame(() => {
            if (chatRef.current) {
              chatRef.current.scrollTop =
                chatRef.current.scrollHeight;
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, hostId]);

/* ================= SEND MESSAGE ================= */

const sendMessage = async () => {
  console.log("SEND CLICKED");

  if (sending) {
    console.log("SEND ALREADY IN PROGRESS");
    return;
  }

  const text = message.trim();

  if (!text || !user?.id || !hostId) {
    console.log("FAILED CHECK", {
      message,
      user,
      hostId,
    });
    return;
  }

  setMessage("");
  setSending(true);

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        receiver_id: hostId,
        text,
      })
      .select("*")
      .single();

    if (error) {
      console.error("MESSAGE INSERT ERROR:", error);
      setMessage(text);
      return;
    }

    console.log("MESSAGE INSERT SUCCESS:", data);

    if (data) {
      setMessages((current) => {
        if (current.some((msg) => msg.id === data.id)) {
          return current;
        }

        return [...current, data];
      });
    }

    requestAnimationFrame(() => {
      inputRef.current?.focus();
      scrollToBottom();
    });

    onMessageSent?.();

  } catch (err) {
    console.error("MESSAGE SEND EXCEPTION:", err);
    setMessage(text);
  } finally {
    setSending(false);
  }
};
/* ================= EARLY SAFE GUARD (FIXED) ================= */

  if (!host || !user) return null;

  /* ================= UI ================= */

  return (
    <div style={overlay} onClick={onClose}>
      <div className="messages-modal" style={{ ...modal, background: theme.background, color: theme.text }} onClick={(e) => e.stopPropagation()}>{/* HEADER */}
        <div className="messages-modal-header" style={{ ...header, borderBottomColor: theme.border }}>
          <div style={headerLeft}>
            <img src={avatar} alt={displayName} style={avatarStyle} />

            <div>
              <h3 style={{ margin: 0 }}>{displayName}</h3>
              <p style={{ ...statusText, color: theme.text }}>@{host?.alias || displayName}</p>
            </div>
          </div>

          <button onClick={onClose} style={{ ...closeBtn, background: theme.surface, color: theme.text, border: `1px solid ${theme.border}` }} aria-label="Close messages"><X size={20} /></button>
        </div>

        {/* CHAT */}
        <div className="messages-modal-chat" ref={chatRef} style={{ ...chatArea, background: theme.background }}>
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
                    className={mine ? "" : "messages-modal-incoming"} style={{ ...bubble, background: mine ? "#7c3aed" : theme.surface, color: mine ? "#fff" : theme.text }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

        </div>

        {/* INPUT */}
        <div className="messages-modal-input-area" style={{ ...inputArea, background: theme.surface, borderTopColor: theme.border }}>
          <input ref={inputRef} className="messages-modal-input" value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Send a message..."
            style={{ ...input, background: theme.surface, color: theme.text, borderColor: theme.border }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button
            type="button"
            onClick={(e) => {
              console.log("BUTTON TOUCH/CLICK");
              e.preventDefault();
              sendMessage();
            }}
            disabled={sending}
            style={{ ...sendBtn, opacity: sending ? 0.6 : 1 }}
          >
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
  zIndex: 100002,
};

const modal = {
  width: "100%",
  maxWidth: 700,
  height: "100dvh",
  maxHeight: "100dvh",
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
  flex: "1 1 auto",
  minHeight: 0,
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

const inputArea = {
  display: "flex",
  flexShrink: 0,
  gap: 10,
  padding: 16,
  paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
  borderTop: "1px solid #eee",
  background: "#fff",
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

