import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient.js";

export default function ChatRequests() {
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });

    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("chat_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setRequests(data || []);
  };

  const handleCreateAd = async () => {
    if (!user) {
      alert("Please login to create a chat ad.");
      return;
    }

    if (!topic || !description) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    const avatar =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      "";

    const { error } = await supabase.from("chat_requests").insert({
      user_id: user.id,
      topic,
      description,
      avatar_url: avatar,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setTopic("");
      setDescription("");
      fetchRequests();
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
        Chat Requests
      </h2>

      {/* CREATE AD */}
      <div
        style={{
          background: "#f9fafb",
          padding: 16,
          borderRadius: 12,
          marginBottom: 24,
          border: "1px solid #e5e7eb",
        }}
      >
        <h3 style={{ fontWeight: 600, marginBottom: 8 }}>
          Create a Chat Ad
        </h3>

        {!user && (
          <p style={{ color: "#ef4444", marginBottom: 8 }}>
            Please login to create a chat ad.
          </p>
        )}

        <input
          type="text"
          placeholder="Topic (e.g. Learn English, Need advice, Depression)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={!user}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 8,
          }}
        />

        <textarea
          placeholder="Describe what you want to talk about..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!user}
          rows={3}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            marginBottom: 8,
          }}
        />

        <button
          onClick={handleCreateAd}
          disabled={!user || loading}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#22c55e",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            opacity: !user ? 0.6 : 1,
          }}
        >
          {loading ? "Posting..." : "Post Chat Ad"}
        </button>
      </div>

      {/* ADS LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {requests.map((req) => (
          <div
            key={req.id}
            style={{
              display: "flex",
              gap: 12,
              padding: 12,
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
            }}
          >
            <img
              src={req.avatar_url || "https://via.placeholder.com/40"}
              alt="avatar"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />

            <div>
              <div style={{ fontWeight: 600 }}>{req.topic}</div>
              <p style={{ margin: "4px 0", color: "#374151" }}>
                {req.description}
              </p>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                {new Date(req.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            No chat requests yet.
          </p>
        )}
      </div>
    </div>
  );
}

