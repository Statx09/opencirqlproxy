import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ChatsTab({
  user,
  hosts = [],
  onOpenChat,
  refreshKey,
}) {
  const [conversations, setConversations] = useState([]);

  const getHostIds = (host) =>
    [host?.user_id, host?.profile_id, host?.id].filter(Boolean);

  const findHost = (id) =>
    hosts.find((host) => getHostIds(host).includes(id));

  const getCurrentUserIds = () => {
    const currentProfile = hosts.find(
      (host) => host.user_id === user?.id || host.id === user?.id
    );

    return [
      user?.id,
      currentProfile?.id,
      currentProfile?.user_id,
    ].filter(Boolean);
  };

  const loadChats = useCallback(async () => {
    if (!user?.id) {
      setConversations([]);
      return;
    }

    const userIds = getCurrentUserIds();

    const filters = userIds.flatMap((id) => [
      `sender_id.eq.${id}`,
      `receiver_id.eq.${id}`,
    ]);

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(filters.join(","))
      .is("event", null)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CHATS LOAD ERROR:", error);
      return;
    }

    const map = new Map();

    for (const msg of data || []) {
      const senderIsUser = userIds.includes(msg.sender_id);
      const otherId = senderIsUser
        ? msg.receiver_id
        : msg.sender_id;

      const host = findHost(otherId);

      if (!host) continue;

      const hostKey = getHostIds(host).sort()[0];

      if (!map.has(hostKey)) {
        map.set(hostKey, {
          host,
          hostKey,
          preview: msg.text || "",
          created_at: msg.created_at,
        });
      }
    }

    setConversations(
      Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      )
    );
  }, [user?.id, hosts]);

  useEffect(() => {
    loadChats();
  }, [loadChats, refreshKey]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`chats-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const message = payload.new;

          if (message.event != null) return;

          const userIds = getCurrentUserIds();

          const senderIsUser = userIds.includes(message.sender_id);
          const receiverIsUser = userIds.includes(message.receiver_id);

          if (!senderIsUser && !receiverIsUser) return;

          const otherId = senderIsUser
            ? message.receiver_id
            : message.sender_id;

          const host = findHost(otherId);

          if (!host) {
            console.warn("CHAT REALTIME HOST NOT FOUND:", otherId);
            return;
          }

          const hostKey = getHostIds(host).sort()[0];

          setConversations((previous) => {
            const existing = previous.find(
              (conversation) => conversation.hostKey === hostKey
            );

            const updated = {
              host,
              hostKey,
              preview: message.text || "",
              created_at: message.created_at,
            };

            return [
              updated,
              ...previous.filter(
                (conversation) => conversation.hostKey !== hostKey
              ),
            ].sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime()
            );
          });
        }
      )
      .subscribe((status) => {
        console.log("CHATS REALTIME:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, hosts]);

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
        conversations.map(({ host, hostKey, preview }) => (
          <div
            key={hostKey}
            onClick={() => onOpenChat(host)}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: 12,
              cursor: "pointer",
              borderBottom: "1px solid rgba(255,255,255,.08)",
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

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>
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




