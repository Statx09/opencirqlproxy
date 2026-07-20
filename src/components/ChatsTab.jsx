import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ChatsTab({
  user,
  hosts = [],
  onOpenChat,
}) {
  const [conversations, setConversations] = useState([]);

  const loadChats = useCallback(async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    const map = new Map();

    for (const msg of data || []) {
      const otherId =
        msg.sender_id === user.id
          ? msg.receiver_id
          : msg.sender_id;

      if (map.has(otherId)) continue;

      const host = hosts.find((h) => h.user_id === otherId);

      if (!host) continue;

      const isMe = msg.sender_id === user.id;

      let preview = msg.text || "";

      switch (msg.event) {
        case "wave":
          preview = isMe
            ? "You waved 👋"
            : "👋 Waved at you";
          break;

        case "like":
          preview = isMe
            ? "You liked ❤️"
            : "❤️ Liked you";
          break;

        case "support":
          preview = isMe
            ? "You sent support 💰"
            : "💰 Sent you support";
          break;
      }

      map.set(otherId, {
        host,
        preview,
      });
    }

    setConversations([...map.values()]);
  }, [user?.id, hosts]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  return (
    <div
      style={{
        padding: 16,
        color: "#fff",
      }}
    >
      {conversations.length === 0 ? (
        <div
          style={{
            opacity: 0.6,
            textAlign: "center",
            padding: 40,
          }}
        >
          No conversations yet.
        </div>
      ) : (
        conversations.map(({ host, preview }) => (
          <div
            key={host.user_id}
            onClick={() => onOpenChat(host)}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: 12,
              cursor: "pointer",
              borderBottom:
                "1px solid rgba(255,255,255,.08)",
            }}
          >
            <img
              src={host.avatar_url || host.avatar}
              alt=""
              style={{
                width: 52,
                height: 52,
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
                }}
              >
                {host.alias || host.name}
              </div>

              <div
                style={{
                  opacity: 0.7,
                  fontSize: 13,
                  marginTop: 4,
                }}
              >
                {preview}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}