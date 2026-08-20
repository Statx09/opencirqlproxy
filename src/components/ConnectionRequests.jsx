import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { useTheme } from "../context/ThemeContext";

export default function ConnectionRequests({
  user,
  onUpdated,
  onOpenProfile,
}) {
  const { theme } = useTheme();

  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadRequests = useCallback(async () => {
    if (!user?.id) {
      setRequests([]);
      return;
    }

    const { data, error } = await supabase
      .from("connections")
      .select("*")
      .eq("user_b", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("CONNECTION REQUESTS LOAD ERROR:", error);
      return;
    }

    const rows = data || [];
    setRequests(rows);

    const senderIds = rows.map((request) => request.user_a);

    if (!senderIds.length) {
      setProfiles({});
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .in("user_id", senderIds);

    if (profileError) {
      console.error("CONNECTION REQUEST PROFILES ERROR:", profileError);
      return;
    }

    const map = {};

    (profileData || []).forEach((profile) => {
      map[profile.user_id] = profile;
    });

    setProfiles(map);
  }, [user?.id]);

  useEffect(() => {
    loadRequests();

    const interval = setInterval(loadRequests, 5000);

    return () => clearInterval(interval);
  }, [loadRequests]);

  async function acceptRequest(id) {
    if (processingId) return;

    console.log("ACCEPT REQUEST CLICKED:", id);

    setProcessingId(id);

    try {
      const { data, error } = await supabase
        .from("connections")
        .update({
          status: "accepted",
        })
        .eq("id", id)
        .eq("user_b", user.id)
        .eq("status", "pending")
        .select();

      console.log("ACCEPT REQUEST RESULT:", {
        data,
        error,
      });

      if (error) {
        console.error("ACCEPT REQUEST ERROR:", error);
        alert(`Failed to accept request: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error("ACCEPT REQUEST: NO ROW UPDATED");
        alert("The request could not be accepted. No row was updated.");
        return;
      }

      setRequests((current) =>
        current.filter((request) => request.id !== id)
      );

      onUpdated?.();

      await loadRequests();

      console.log("ACCEPT REQUEST SUCCESS:", data[0]);
    } catch (err) {
      console.error("ACCEPT REQUEST EXCEPTION:", err);
      alert("Failed to accept connection request.");
    } finally {
      setProcessingId(null);
    }
  }

  async function declineRequest(id) {
    if (processingId) return;

    console.log("DECLINE REQUEST CLICKED:", id);

    setProcessingId(id);

    try {
      const { data, error } = await supabase
        .from("connections")
        .delete()
        .eq("id", id)
        .eq("user_b", user.id)
        .eq("status", "pending")
        .select();

      console.log("DECLINE REQUEST RESULT:", {
        data,
        error,
      });

      if (error) {
        console.error("DECLINE REQUEST ERROR:", error);
        alert(`Failed to decline request: ${error.message}`);
        return;
      }

      if (!data || data.length === 0) {
        console.error("DECLINE REQUEST: NO ROW DELETED");
        alert("The request could not be declined. No row was deleted.");
        return;
      }

      setRequests((current) =>
        current.filter((request) => request.id !== id)
      );

      onUpdated?.();

      await loadRequests();

      console.log("DECLINE REQUEST SUCCESS:", data[0]);
    } catch (err) {
      console.error("DECLINE REQUEST EXCEPTION:", err);
      alert("Failed to decline connection request.");
    } finally {
      setProcessingId(null);
    }
  }

  if (!user) return null;

  return (
    <div
      style={{
        padding: 16,
        color: theme.text,
      }}
    >
      {requests.length === 0 ? (
        <div
          style={{
            opacity: 0.6,
            textAlign: "center",
            padding: 40,
          }}
        >
          No connection requests.
        </div>
      ) : (
        requests.map((request) => {
          const profile = profiles[request.user_a];

          const displayName =
            profile?.alias ||
            profile?.name ||
            "Unknown User";

          const avatar =
            profile?.avatar_url ||
            profile?.avatar ||
            "https://placehold.co/100";

          const processing = processingId === request.id;

          return (
            <div
              key={request.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 12,
                marginBottom: 12,
                borderRadius: 14,
                background: theme.surface,
                border: `1px solid ${theme.border}`,
              }}
            >
              <img
                src={avatar}
                alt={displayName}
                onClick={() => onOpenProfile?.(profile)}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  objectFit: "cover",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 700,
                    marginBottom: 3,
                  }}
                >
                  {displayName}
                </div>

                <div
                  style={{
                    opacity: 0.65,
                    fontSize: 13,
                  }}
                >
                  wants to connect
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  disabled={processing}
                  onClick={() => acceptRequest(request.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "none",
                    cursor: processing ? "default" : "pointer",
                    background: "#22c55e",
                    color: "#fff",
                    fontWeight: 700,
                    opacity: processing ? 0.6 : 1,
                  }}
                >
                  {processing ? "..." : "Accept"}
                </button>

                <button
                  type="button"
                  disabled={processing}
                  onClick={() => declineRequest(request.id)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "none",
                    cursor: processing ? "default" : "pointer",
                    background: "#ef4444",
                    color: "#fff",
                    fontWeight: 700,
                    opacity: processing ? 0.6 : 1,
                  }}
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
