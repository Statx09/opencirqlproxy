import React, { useEffect, useState } from "react";
import { getConnectionStatus } from "../api/getConnectionStatus";

export default function CallModal({
  host,
  user,
  callType,
  onClose,
}) {
  const [connection, setConnection] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    if (!user?.id || !host?.user_id)
      return;

    const loadConnection =
      async () => {
        const result =
          await getConnectionStatus(
            user.id,
            host.user_id
          );

        setConnection(result);
        setLoading(false);
      };

    loadConnection();
  }, [user, host]);

  const isConnected =
    connection?.status === "accepted";

  const callLink =
    host?.jitsi_link ||
    host?.livelink;

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div style={overlay}>
        <div style={loadingBox}>
          Checking connection...
        </div>
      </div>
    );
  }

  // ---------------- LOCKED ----------------
  if (!isConnected) {
    return (
      <div style={overlay}>
        <div style={lockedBox}>
          <div style={{ fontSize: 42 }}>
            🔒
          </div>

          <h2
            style={{
              marginTop: 12,
              marginBottom: 10,
            }}
          >
            Calls Locked
          </h2>

          <p
            style={{
              color: "#6b7280",
              lineHeight: 1.5,
              marginBottom: 18,
            }}
          >
            Message this host and request
            a connection to unlock voice
            and video calls.
          </p>

          <button
            onClick={onClose}
            style={backBtn}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  // ---------------- NO LINK ----------------
  if (!callLink) {
    return (
      <div style={overlay}>
        <div style={lockedBox}>
          <h2>No Call Link</h2>

          <p
            style={{
              color: "#6b7280",
              marginTop: 10,
            }}
          >
            This host has not added a
            Jitsi link yet.
          </p>

          <button
            onClick={onClose}
            style={backBtn}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // ---------------- LIVE CALL ----------------
  return (
    <div style={overlay}>
      <div style={container}>
        <button
          onClick={onClose}
          style={closeBtn}
        >
          ✕
        </button>

        <h3
          style={{
            marginBottom: 14,
          }}
        >
          {callType === "video"
            ? "📹 Video Call"
            : "🎙️ Voice Call"}
        </h3>

        <iframe
          src={callLink}
          allow="camera; microphone; fullscreen; display-capture"
          style={{
            width: "100%",
            height: "80vh",
            border: "none",
            borderRadius: 14,
          }}
        />
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
};

const container = {
  width: "95%",
  maxWidth: 1100,
  background: "#fff",
  borderRadius: 22,
  padding: 18,
  position: "relative",
};

const closeBtn = {
  position: "absolute",
  top: 12,
  right: 12,
  border: "none",
  background: "#111827",
  color: "#fff",
  width: 36,
  height: 36,
  borderRadius: "50%",
  cursor: "pointer",
  fontWeight: 700,
};

const lockedBox = {
  width: 340,
  background: "#fff",
  borderRadius: 24,
  padding: 28,
  textAlign: "center",
  boxShadow:
    "0 10px 30px rgba(0,0,0,0.18)",
};

const loadingBox = {
  background: "#fff",
  padding: 24,
  borderRadius: 18,
  fontWeight: 600,
};

const backBtn = {
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  padding: "12px 18px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 700,
  width: "100%",
};