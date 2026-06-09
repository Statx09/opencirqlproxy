import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import MessagesModal from "./MessagesModal";
import CallModal from "./CallModal";

import { getRelationship, canCall } from "../lib/interactionRules";

export default function ConnectionsTab({ user, onOpenProfile }) {
  const [connections, setConnections] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [messages, setMessages] = useState({});
  const [activeChat, setActiveChat] = useState(null);
  const [activeCall, setActiveCall] = useState(null);

  // ---------------- LOAD CONNECTIONS ----------------
  const loadConnections = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .eq("status", "accepted");

    if (error || !data) return;

    data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const partnerIds = data.map((c) =>
      c.user_a === user.id ? c.user_b : c.user_a
    );

    if (partnerIds.length === 0) {
      setConnections([]);
      setProfiles({});
      setMessages({});
      return;
    }

    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", partnerIds);

    const profileMap = {};
    (profs || []).forEach((p) => {
      profileMap[p.user_id] = p;
    });

    setProfiles(profileMap);
    setConnections(data);

    const msgMap = {};

    for (const id of partnerIds) {
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${user.id},receiver_id.eq.${id}),and(sender_id.eq.${id},receiver_id.eq.${user.id})`
        )
        .order("created_at", { ascending: false })
        .limit(1);

      msgMap[id] = lastMsg?.[0] || null;
    }

    setMessages(msgMap);
  };

  useEffect(() => {
    loadConnections();
    const interval = setInterval(loadConnections, 8000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) {
    return <div style={{ padding: 20 }}>Login to view connections</div>;
  }

  // ---------------- CALL GUARD ----------------
  const handleCall = async (profile, type) => {
    try {
      const relation = await getRelationship(user.id, profile.user_id);

      if (!canCall(relation)) {
        return alert("🔒 You need a confirmed connection before calling.");
      }

      setActiveCall({ ...profile, callType: type });
    } catch (err) {
      console.error(err);
      alert("Failed to start call");
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <h2 style={{ marginBottom: 16 }}>Your Connections</h2>

      {connections.length === 0 && <p>No connections yet.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {connections.map((c) => {
          const partnerId =
            c.user_a === user.id ? c.user_b : c.user_a;

          const profile = profiles[partnerId];
          const lastMsg = messages[partnerId];

          if (!profile) return null;

          return (
            <div key={c.id} style={card}>
              {/* AVATAR */}
              <img
                src={
                  profile.avatar_url ||
                  "https://placehold.co/100x100"
                }
                style={avatar}
                onClick={() => onOpenProfile?.(profile)}
              />

              {/* INFO */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div style={{ fontWeight: 700 }}>
                  {profile.alias || profile.name}
                </div>

                <div style={lastMsgStyle}>
                  {lastMsg?.text || "No messages yet"}
                </div>
              </div>

              {/* ACTIONS */}
              <div style={actions}>
                <button
                  onClick={() => setActiveChat(profile)}
                  style={primaryBtn}
                >
                  Message
                </button>

                <button
                  onClick={() => handleCall(profile, "voice")}
                  style={secondaryBtn}
                >
                  Voice
                </button>

                <button
                  onClick={() => handleCall(profile, "video")}
                  style={secondaryBtn}
                >
                  Video
                </button>

                <button
                  onClick={() => alert("Say Thanks coming next 💛")}
                  style={thanksBtn}
                >
                  💛 Thanks
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODALS */}
      {activeChat && (
        <MessagesModal
          host={activeChat}
          user={user}
          onClose={() => setActiveChat(null)}
        />
      )}

      {activeCall && (
        <CallModal
          host={activeCall}
          user={user}
          callType={activeCall.callType}
          onClose={() => setActiveCall(null)}
        />
      )}
    </div>
  );
}

/* ================= STYLES (UNCHANGED) ================= */

const card = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 12,
  borderRadius: 16,
  background: "#fff",
  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
};

const avatar = {
  width: 52,
  height: 52,
  borderRadius: "50%",
  objectFit: "cover",
  cursor: "pointer",
};

const lastMsgStyle = {
  fontSize: 13,
  color: "#666",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const actions = {
  display: "flex",
  gap: 6,
  flexWrap: "wrap",
};

const primaryBtn = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryBtn = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "none",
  background: "#111827",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const thanksBtn = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "none",
  background: "#fbbf24",
  color: "#111",
  fontWeight: 800,
  cursor: "pointer",
};