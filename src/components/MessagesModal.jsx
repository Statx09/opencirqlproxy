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
  const [sendError, setSendError] = useState("");
  const { theme } = useTheme();

  const hostId = host?.user_id ?? host?.profile_id ?? host?.id;

  const displayName = host?.alias || host?.name || "Host";

  const avatar =
    host?.avatar_url ||
    host?.avatar ||
    "https://placehold.co/100x100";

const chatRef = useRef(null);
const inputRef = useRef(null);
const fileInputRef = useRef(null);
const recorderRef = useRef(null);
const recordedChunksRef = useRef([]);
const [mediaUrls, setMediaUrls] = useState({});
const [recording, setRecording] = useState(false);
const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
const [showEmojiPicker, setShowEmojiPicker] = useState(false);

const scrollToBottom = () => {
  requestAnimationFrame(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  });
};
  /* PAID MEDIA HANDLERS */

  async function sendPaidMedia(file, mediaType) {
    if (!user?.id || !hostId || !file || sending) return;

    if (file.size > 10 * 1024 * 1024) {
      setSendError("Media must be 10 MB or smaller.");
      return;
    }

    setSending(true);
    setSendError("");

    let storagePath;
    let paymentSucceeded = false;

    try {
      const extension = (file.name?.split(".").pop() || "webm")
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(0, 10);

      storagePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-media")
        .upload(storagePath, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data, error } = await supabase.rpc("send_paid_media", {
        p_receiver_id: hostId,
        p_media_type: mediaType,
        p_storage_path: storagePath,
      });

      if (error) throw error;
      if (!data?.success || !data?.message_id) {
        throw new Error("Media message was not confirmed.");
      }

      paymentSucceeded = true;

      setMessages((previous) => {
        if (previous.some((item) => item.id === data.message_id)) return previous;
        return [...previous, {
          id: data.message_id,
          sender_id: user.id,
          receiver_id: hostId,
          text: mediaType === "picture" ? "Picture" : "Voice note",
          created_at: new Date().toISOString(),
          payload: {
            media_type: mediaType,
            storage_path: storagePath,
            charge: data.charged,
          },
        }];
      });

      if (onMessageSent) onMessageSent();
      scrollToBottom();
    } catch (error) {
      console.error("Paid media send failed:", { message: error?.message, code: error?.code, details: error?.details, hint: error?.hint, status: error?.status });

      if (storagePath && !paymentSucceeded) {
        await supabase.storage.from("chat-media").remove([storagePath]);
      }

      const detail = String(error?.message || error);
      setSendError(
        detail.includes("INSUFFICIENT_BALANCE")
          ? "Insufficient balance to send this media."
          : detail.includes("MEDIA_PAYMENTS_DISABLED")
            ? "This user is not accepting paid media."
            : "Could not send media. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  async function handlePictureSelected(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file && !file.type.startsWith("image/")) {
      setSendError("Please select an image file.");
      return;
    }
    if (file) await sendPaidMedia(file, "picture");
  }
  async function toggleVoiceRecording() {
    if (sending) return;

    if (recording) {
      recorderRef.current?.stop();
      return;
    }

    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setSendError("Voice recording is not supported by this browser.");
      return;
    }

    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recordedChunksRef.current = [];
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data?.size) recordedChunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setSendError("Voice recording failed. Please try again.");
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
        recorderRef.current = null;

        const chunks = recordedChunksRef.current;
        recordedChunksRef.current = [];

        if (!chunks.length) {
          setSendError("No voice audio was recorded.");
          return;
        }

        const type = recorder.mimeType || "audio/webm";
        const extension = type.includes("mp4") ? "m4a" : "webm";
        const file = new File(chunks, `voice-note-${Date.now()}.${extension}`, {
          type,
        });

        await sendPaidMedia(file, "voice_note");
      };

      recorder.start();
      setRecording(true);
      setSendError("");
    } catch (error) {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      console.error("Voice recording could not start:", error);
      setSendError("Allow microphone access to record a voice note.");
    }
  }
  useEffect(() => {
    let cancelled = false;

    async function loadMediaUrls() {
      const missing = messages.filter((msg) =>
        msg.payload?.storage_path &&
        ["picture", "voice_note"].includes(msg.payload?.media_type) &&
        !mediaUrls[msg.id]
      );

      const results = await Promise.all(
        missing.map(async (msg) => {
          const { data, error } = await supabase.storage
            .from("chat-media")
            .createSignedUrl(msg.payload.storage_path, 3600);

          return {
            id: msg.id,
            url: error ? null : data?.signedUrl,
          };
        })
      );

      if (cancelled) return;

      const found = Object.fromEntries(
        results.filter((item) => item.url).map((item) => [item.id, item.url])
      );

      if (Object.keys(found).length) {
        setMediaUrls((previous) => ({ ...previous, ...found }));
      }
    }

    loadMediaUrls().catch((error) =>
      console.error("Could not load chat media:", error)
    );

    return () => {
      cancelled = true;
    };
  }, [messages, mediaUrls]);




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
  console.log("MESSAGE ID DIAGNOSTIC", {
    senderId: user?.id,
    hostId: host?.id,
    hostUserId: host?.user_id,
    resolvedHostId: hostId,
  });

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
    const isEsihleTesterChat =
      hostId === "bb60e294-da5a-445c-ab61-85bf11b2acac" &&
      [
        "36802a31-ed44-4b15-8b90-1790e950b893",
        "f2bb2d6b-a203-4363-9087-01a4dfe0e984",
      ].includes(user.id);

    let rpcData;
    let error;

    if (isEsihleTesterChat) {
      const result = await supabase.rpc("testing_send_message", {
        p_receiver_profile_id: hostId,
        p_text: text,
      });

      rpcData = result.data;
      error = result.error;

      if (!error && rpcData?.success === false) {
        error = new Error(
          rpcData.error || "Test message could not be sent."
        );
      }
    } else {
      const result = await supabase.rpc("send_message", {
        p_receiver_id: hostId,
        p_text: text,
      });

      rpcData = result.data;
      error = result.error;
    }

    const data = rpcData
      ? {
          id: rpcData.message_id,
          sender_id: user.id,
          receiver_id: hostId,
          text,
          payload:
            !isEsihleTesterChat && rpcData.charged > 0
              ? {
                  charge: rpcData.charged,
                  payment_type: "message",
                }
              : null,
        }
      : null;

    if (error) {
      console.error("MESSAGE INSERT ERROR:", error);
      setMessage(text);
      setSendError(error.message || "Message could not be sent.");
      return;
    }

    console.log("MESSAGE INSERT SUCCESS:", data);

    if (host?.is_ai) {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const token = sessionData?.session?.access_token;

        if (!token) {
          console.error("AI REPLY: No signed-in session token.");
        } else {
          const apiUrl =
            window.location.hostname === "localhost"
              ? "http://localhost:3000/api/ai-reply"
              : "https://cirql-ai-chatbot.vercel.app/api/ai-reply";

          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              sender_id: user.id,
              receiver_id: hostId,
              text,
            }),
          });

          const result = await response.json();

          if (!response.ok) {
            console.error("AI REPLY FAILED:", response.status, result);
          } else if (result.ai_message) {
            setMessages((current) =>
              current.some((msg) => msg.id === result.ai_message.id)
                ? current
                : [...current, result.ai_message]
            );
            console.log("AI REPLY RECEIVED:", result.ai_message);
          }
        }
      } catch (aiError) {
        console.error("AI REPLY REQUEST FAILED:", aiError);
      }
    }

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
                    className={mine ? "" : "messages-modal-incoming"}
                    style={{
                      ...bubble,
                      background: mine ? "#7c3aed" : theme.surface,
                      color: mine ? "#fff" : theme.text,
                    }}
                  >
                    {msg.payload?.media_type === "picture" ? (
                      mediaUrls[msg.id] ? (
                        <img
                          src={mediaUrls[msg.id]}
                          alt="Paid picture"
                          style={{ display: "block", maxWidth: "100%", maxHeight: 320, borderRadius: 8, objectFit: "contain" }}
                        />
                      ) : (
                        <span>Loading picture...</span>
                      )
                    ) : msg.payload?.media_type === "voice_note" ? (
                      mediaUrls[msg.id] ? (
                        <audio controls preload="none" src={mediaUrls[msg.id]} style={{ display: "block", maxWidth: "100%" }} />
                      ) : (
                        <span>Loading voice note...</span>
                      )
                    ) : (
                      msg.text
                    )}

                    {msg.payload?.charge > 0 && (
                      <div
                        style={{
                          fontSize: 11,
                          marginTop: 5,
                          color: mine ? "#ef4444" : "#22c55e",
                          fontWeight: 600,
                        }}
                      >
                        {mine
                          ? `- $${Number(msg.payload.charge).toFixed(2)}`
                          : `+ $${Number(msg.payload.charge).toFixed(2)}`}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

        </div>

        {sendError && <div style={{ color: "#ef4444", fontSize: 13, padding: "6px 12px", textAlign: "center" }}>{sendError}</div>}

        {/* INPUT */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handlePictureSelected}
        />

        <div
          className="messages-modal-input-area"
          style={{
            ...inputArea,
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 10px",
            background: theme.surface,
            borderTopColor: theme.border
          }}
        >
          {showAttachmentMenu && (
            <div style={{
              position: "absolute",
              bottom: "100%",
              left: 10,
              zIndex: 20,
              display: "flex",
              flexDirection: "column",
              gap: 5,
              padding: 8,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              background: theme.surface,
              boxShadow: "0 4px 18px rgba(0,0,0,0.16)"
            }}>
              <button
                type="button"
                disabled={sending || recording}
                onClick={() => {
                  setShowAttachmentMenu(false);
                  fileInputRef.current?.click();
                }}
                style={composerMenuButton}
              >
                🖼️ Picture
              </button>
              <button
                type="button"
                disabled={sending}
                onClick={() => {
                  setShowAttachmentMenu(false);
                  toggleVoiceRecording();
                }}
                style={composerMenuButton}
              >
                {recording ? "⏹️ Stop recording" : "🎙️ Voice note"}
              </button>
            </div>
          )}

          {showEmojiPicker && (
            <div style={{
              position: "absolute",
              bottom: "100%",
              right: 48,
              zIndex: 20,
              display: "grid",
              gridTemplateColumns: "repeat(6, 34px)",
              gap: 4,
              padding: 8,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              background: theme.surface,
              boxShadow: "0 4px 18px rgba(0,0,0,0.16)"
            }}>
              {["\u{1F600}", "\u{1F602}", "\u{1F970}", "\u{1F979}", "\u{1F60E}", "\u{1F62D}", "\u{1F44B}", "\u{2764}\u{FE0F}", "\u{1F525}", "\u{1F389}", "\u{1F64F}", "\u{1F609}"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setMessage((previous) => previous + emoji);
                    setShowEmojiPicker(false);
                    inputRef.current?.focus();
                  }}
                  style={{
                    border: 0,
                    borderRadius: 6,
                    background: "transparent",
                    fontSize: 21,
                    padding: 4,
                    cursor: "pointer"
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            aria-label="Attachments"
            title="Attachments"
            disabled={sending}
            onClick={() => {
              setShowAttachmentMenu((value) => !value);
              setShowEmojiPicker(false);
            }}
            style={composerIconButton}
          >
            📎
          </button>

          <input
            ref={inputRef}
            className="messages-modal-input"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setSendError("");
            }}
            placeholder="Send a message..."
            style={{
              ...input,
              flex: 1,
              minWidth: 0,
              background: theme.surface,
              color: theme.text,
              borderColor: theme.border
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
          />

          <button
            type="button"
            aria-label="Emoji"
            title="Emoji"
            onClick={() => {
              setShowEmojiPicker((value) => !value);
              setShowAttachmentMenu(false);
              inputRef.current?.focus();
            }}
            style={composerIconButton}
          >
            😊
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            disabled={sending}
            style={{ ...sendBtn, opacity: sending ? 0.6 : 1 }}
          >
            Send
          </button>
        </div>      </div>
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

const composerIconButton = {
  flexShrink: 0,
  width: 36,
  height: 40,
  padding: 0,
  border: "none",
  borderRadius: "50%",
  background: "transparent",
  color: "inherit",
  fontSize: 23,
  cursor: "pointer",
};

const composerMenuButton = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "10px 12px",
  border: "none",
  borderRadius: 8,
  background: "transparent",
  color: "inherit",
  whiteSpace: "nowrap",
  textAlign: "left",
  cursor: "pointer",
};

const sendBtn = {
  padding: "10px 16px",
  borderRadius: 10,
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};
