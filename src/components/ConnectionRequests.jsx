import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ConnectionRequests({ user, onUpdated }) {
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({});

  const loadRequests = async () => {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .eq("user_b", user.id)
      .eq("status", "pending");

    if (error) {
      console.error(error);
      return;
    }

    setRequests(data || []);

    const senderIds = (data || []).map((r) => r.user_a);

    if (!senderIds.length) {
      setProfiles({});
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", senderIds);

    const map = {};

    (profileData || []).forEach((p) => {
      map[p.user_id] = p;
    });

    setProfiles(map);
  };

  useEffect(() => {
    loadRequests();

    const interval = setInterval(loadRequests, 5000);

    return () => clearInterval(interval);
  }, [user]);

  const acceptRequest = async (connectionId) => {
    const { error } = await supabase
      .from("connections")
      .update({
        status: "accepted",
      })
      .eq("id", connectionId);

    if (error) {
      console.error(error);
      return alert(error.message);
    }

    await loadRequests();

    if (onUpdated) onUpdated();
  };

  const declineRequest = async (connectionId) => {
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId);

    if (error) {
      console.error(error);
      return alert(error.message);
    }

    await loadRequests();

    if (onUpdated) onUpdated();
  };

  if (!requests.length) return null;

  return (
    <div style={{ marginBottom: 24 }}>
      <h2 style={{ marginBottom: 12 }}>
        Connection Requests
      </h2>

      <div style={{ display: "grid", gap: 12 }}>
        {requests.map((request) => {
          const profile = profiles[request.user_a];

          return (
            <div
              key={request.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 16,
                background: "#fff",
                boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              }}
            >
              <img
                src={
                  profile?.avatar_url ||
                  "https://placehold.co/100x100"
                }
                alt=""
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 700,
                  }}
                >
                  {profile?.alias ||
                    profile?.name ||
                    "Unknown User"}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#666",
                  }}
                >
                  wants to connect
                </div>
              </div>

              <button
                onClick={() =>
                  acceptRequest(request.id)
                }
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "none",
                  background: "#22c55e",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Accept
              </button>

              <button
                onClick={() =>
                  declineRequest(request.id)
                }
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  border: "none",
                  background: "#ef4444",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Decline
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}