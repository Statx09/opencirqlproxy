
import React, { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const styles = {
  root: {
    width: "min(100%, 900px)",
    height: "min(78vh, 720px)",
    minHeight: 420,
    display: "flex",
    flexDirection: "column",
    color: "var(--text, #f4f4f5)",
    background: "var(--surface, #15171c)",
    borderRadius: 16,
    overflow: "hidden",
  },
  toolbar: {
    display: "flex",
    gap: 10,
    padding: 14,
    borderBottom: "1px solid rgba(255,255,255,.12)",
  },
  select: {
    minWidth: 0,
    flex: 1,
    padding: "10px 12px",
    borderRadius: 9,
    color: "inherit",
    background: "#252832",
    border: "1px solid #454957",
  },
  body: {
    display: "flex",
    flex: 1,
    minHeight: 0,
  },
  conversations: {
    width: "38%",
    minWidth: 180,
    overflowY: "auto",
    borderRight: "1px solid rgba(255,255,255,.12)",
  },
  conversation: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: 12,
    color: "inherit",
    background: "transparent",
    border: 0,
    borderBottom: "1px solid rgba(255,255,255,.08)",
    cursor: "pointer",
  },
  conversationActive: {
    background: "rgba(120,140,255,.16)",
  },
  chat: {
    display: "flex",
    flex: 1,
    minWidth: 0,
    flexDirection: "column",
  },
  messages: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    padding: 14,
  },
  bubble: {
    maxWidth: "85%",
    padding: "9px 12px",
    marginBottom: 10,
    borderRadius: 12,
    overflowWrap: "anywhere",
    background: "#292d37",
  },
  ownBubble: {
    marginLeft: "auto",
    background: "#394b7b",
  },
  composer: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid rgba(255,255,255,.12)",
  },
  textarea: {
    flex: 1,
    minWidth: 0,
    resize: "vertical",
    minHeight: 42,
    maxHeight: 120,
    padding: 10,
    borderRadius: 9,
    color: "inherit",
    background: "#252832",
    border: "1px solid #454957",
    font: "inherit",
  },
  button: {
    padding: "10px 13px",
    borderRadius: 9,
    border: 0,
    cursor: "pointer",
    color: "#fff",
    background: "#596ee8",
  },
};

const idOf = (value) => value?.user_id ?? value?.id ?? null;

function conversationKey(message) {
  return `${message.host_user_id}:${message.other_user_id}`;
}

function formatTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TestingInbox({ user }) {
  const [hosts, setHosts] = useState([]);
  const [selectedHostId, setSelectedHostId] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadHosts = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc("testing_host_list");
    if (rpcError) throw rpcError;

    const safeHosts = (data || []).filter((host) => host.host_user_id);
    setHosts(safeHosts);

    setSelectedHostId((current) => {
      if (current && safeHosts.some((host) => host.host_user_id === current)) {
        return current;
      }
      return safeHosts[0]?.host_user_id || "";
    });
  }, []);

  const loadUsers = useCallback(async () => {
    const { data, error: rpcError } = await supabase.rpc(
      "testing_host_users"
    );

    if (rpcError) throw rpcError;

    const safeUsers = (data || []).filter(
      (item) => item.user_id
    );

    setUsers(safeUsers);

    setSelectedUserId((current) => {
      if (current && safeUsers.some((item) => item.user_id === current)) {
        return current;
      }

      return safeUsers[0]?.user_id || "";
    });
  }, []);
  const loadMessages = useCallback(async (hostId) => {
    if (!hostId) {
      setMessages([]);
      return;
    }

    const { data, error: rpcError } = await supabase.rpc(
      "testing_host_inbox",
      { p_host_user_id: hostId }
    );

    if (rpcError) throw rpcError;

    const safeMessages = (data || []).filter(
      (message) =>
        message.host_user_id === hostId &&
        message.event == null &&
        message.sender_id !== message.receiver_id
    );

    setMessages(safeMessages);
    setSelectedConversation((current) => {
      if (current && safeMessages.some((message) => conversationKey(message) === current)) {
        return current;
      }
      return safeMessages[0] ? conversationKey(safeMessages[0]) : "";
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError("");

      try {
        await Promise.all([
          loadHosts(),
          loadUsers(),
        ]);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load synthetic hosts.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    initialize();
    return () => {
      cancelled = true;
    };
  }, [loadHosts, loadUsers, user?.id]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      setError("");
      try {
        await loadMessages(selectedHostId);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not load conversations.");
      }
    }

    refresh();

    return () => {
      cancelled = true;
    };
  }, [loadMessages, selectedHostId]);

  const conversations = users.map((item) => {
    const userMessages = messages.filter(
      (message) => message.other_user_id === item.user_id
    );

    const latestMessage = userMessages.reduce((latest, message) => {
      if (
        !latest ||
        new Date(message.created_at || 0) >
          new Date(latest.created_at || 0)
      ) {
        return message;
      }

      return latest;
    }, null);

    return {
      key: `${selectedHostId}:${item.user_id}`,
      otherUserId: item.user_id,
      otherUserName: item.display_name || "User",
      avatar: item.avatar_url,
      latest: latestMessage?.created_at || null,
      messages: userMessages,
    };
  });

  const activeConversation = conversations.find(
    (conversation) => conversation.otherUserId === selectedUserId
  );

  const activeMessages = (activeConversation?.messages || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(a.created_at || 0) - new Date(b.created_at || 0)
    );
  async function sendReply(event) {
    event.preventDefault();
    if (!selectedHostId || !activeConversation || !draft.trim() || sending) return;

    setSending(true);
    setError("");
    setNotice("");

    try {
      const { data, error: rpcError } = await supabase.rpc("testing_host_reply", {
        p_host_user_id: selectedHostId,
        p_receiver_id: activeConversation.otherUserId,
        p_text: draft.trim(),
      });

      if (rpcError) throw rpcError;
      if (!data?.success) throw new Error("The reply was not confirmed.");

      setDraft("");
      setNotice("Reply sent as the selected synthetic host.");
      await loadMessages(selectedHostId);
    } catch (err) {
      setError(err.message || "Could not send reply.");
    } finally {
      setSending(false);
    }
  }

  if (user?.id !== "36802a31-ed44-4b15-8b90-1790e950b893") {
    return <div style={{ padding: 20 }}>Testing inbox access is not enabled for this account.</div>;
  }

  return (
    <div style={styles.root}>
      <div style={styles.toolbar}>
        <select
          aria-label="Select synthetic host"
          style={styles.select}
          value={selectedHostId}
          onChange={(event) => {
            setSelectedHostId(event.target.value);
            setSelectedConversation("");
            setNotice("");
          }}
        >
          {hosts.length === 0 && <option value="">No synthetic hosts found</option>}
          {hosts.map((host) => (
            <option key={host.host_user_id} value={host.host_user_id}>
              {host.host_name || "Unnamed host"}
            </option>
          ))}
        </select>
        <button
          type="button"
          style={styles.button}
          disabled={loading}
          onClick={() => {
            loadHosts()
              .then(() => loadMessages(selectedHostId))
              .catch((err) => setError(err.message || "Refresh failed."));
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div role="alert" style={{ padding: "8px 12px", color: "#ffaaaa" }}>
          {error}
        </div>
      )}
      {notice && (
        <div role="status" style={{ padding: "8px 12px", color: "#a9e6ba" }}>
          {notice}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 20 }}>Loading testing inbox…</div>
      ) : (
        <div style={styles.body}>
          <aside style={styles.conversations} aria-label="Conversations">
            {conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.key}
                style={{
                  ...styles.conversation,
                  ...(selectedUserId === conversation.otherUserId
                    ? styles.conversationActive
                    : {}),
                }}
                onClick={() => setSelectedUserId(conversation.otherUserId)}
              >
                <strong>{conversation.otherUserName}</strong>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                  {formatTime(conversation.latest)}
                </div>
              </button>
            ))}
            {conversations.length === 0 && (
              <div style={{ padding: 14, opacity: 0.7 }}>
                No conversations for this host yet.
              </div>
            )}
          </aside>

          <section style={styles.chat} aria-label="Selected conversation">
            <div style={styles.messages}>
              {activeConversation && (
                <div style={{ marginBottom: 14, fontSize: 13, opacity: 0.8 }}>
                  Replying as{" "}
                  <strong>
                    {hosts.find((host) => host.host_user_id === selectedHostId)?.host_name || "host"}
                  </strong>{" "}
                  to <strong>{activeConversation.otherUserName}</strong>
                </div>
              )}

              {activeMessages.map((message) => {
                const isHostMessage = message.sender_id === selectedHostId;
                return (
                  <div
                    key={message.message_id}
                    style={{
                      ...styles.bubble,
                      ...(isHostMessage ? styles.ownBubble : {}),
                    }}
                  >
                    <div>{message.message_text}</div>
                    <div style={{ marginTop: 5, fontSize: 10, opacity: 0.65 }}>
                      {isHostMessage ? "Host" : "User"} · {formatTime(message.created_at)}
                    </div>
                  </div>
                );
              })}
            </div>

            <form style={styles.composer} onSubmit={sendReply}>
              <textarea
                style={styles.textarea}
                aria-label="Reply message"
                placeholder={
                  activeConversation
                    ? `Reply as ${hosts.find((host) => host.host_user_id === selectedHostId)?.host_name || "host"}…`
                    : "Select a conversation first"
                }
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={!selectedHostId || !selectedUserId || sending}
                maxLength={5000}
              />
              <button
                type="submit"
                style={styles.button}
                disabled={!selectedHostId || !selectedUserId || !draft.trim() || sending}
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
