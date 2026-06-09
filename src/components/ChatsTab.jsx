import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import MessagesModal from "./MessagesModal";

export default function ChatsTab({
  user,
  hosts,
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedHost, setSelectedHost] =
    useState(null);

  useEffect(() => {
    if (!user?.id) return;

    loadChats();
  }, [user, hosts]);

  const loadChats = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
      )
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const map = new Map();

    for (const msg of data || []) {
      const otherUserId =
        msg.sender_id === user.id
          ? msg.receiver_id
          : msg.sender_id;

      if (!map.has(otherUserId)) {
        const host = hosts.find(
          (h) => h.user_id === otherUserId
        );

        if (host) {
          map.set(otherUserId, {
            host,
            lastMessage: msg,
          });
        }
      }
    }

    setConversations(
      Array.from(map.values())
    );

    setLoading(false);
  };

  if (!user) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
        }}
      >
        <h2>Please login first</h2>

        <p>
          Your chats and connections
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginTop: 20 }}>
        <h2
          style={{
            marginBottom: 20,
          }}
        >
          Chats
        </h2>

        {loading && <p>Loading chats...</p>}

        {!loading &&
          conversations.length === 0 && (
            <div
              style={{
                background: "#fff",
                padding: 24,
                borderRadius: 20,
                boxShadow:
                  "0 2px 12px rgba(0,0,0,0.08)",
              }}
            >
              <h3>No conversations yet</h3>

              <p>
                Start messaging people from
                the directory.
              </p>
            </div>
          )}

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {conversations.map(
            ({ host, lastMessage }) => {
              const avatar =
                host.avatar_url ||
                host.avatar ||
                "https://placehold.co/100x100";

              const displayName =
                host.alias ||
                host.name ||
                "Unnamed";

              return (
                <div
                  key={host.user_id}
                  onClick={() =>
                    setSelectedHost(host)
                  }
                  style={{
                    background: "#fff",
                    borderRadius: 18,
                    padding: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "pointer",
                    boxShadow:
                      "0 2px 12px rgba(0,0,0,0.06)",
                  }}
                >
                  <img
                    src={avatar}
                    alt={displayName}
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      {displayName}
                    </div>

                    <div
                      style={{
                        fontSize: 14,
                        color: "#6b7280",
                      }}
                    >
                      {lastMessage.text}
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {selectedHost && (
        <MessagesModal
          host={selectedHost}
          user={user}
          onClose={() =>
            setSelectedHost(null)
          }
        />
      )}
    </>
  );
}