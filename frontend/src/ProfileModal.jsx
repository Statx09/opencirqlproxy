import React from "react";

export default function ProfileModal({ host, onClose, onJoin, onTip }) {
  if (!host) return null;

  const {
    name,
    avatar,
    bio,
    location,
    language,
    topics = [],
    intent_tags = [],
    usdt_wallet,
    kofi,
    stripe,
  } = host;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          width: "90%",
          maxWidth: 480,
          maxHeight: "85vh",
          borderRadius: 16,
          padding: 20,
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center" }}>
          <img
            src={avatar || "/default-avatar.png"}
            alt={name}
            style={{
              width: 96,
              height: 96,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <h2 style={{ marginTop: 12 }}>{name}</h2>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            {location} · {language}
          </p>
        </div>

        {/* Bio */}
        {bio && (
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.5 }}>
            {bio}
          </p>
        )}

        {/* Topics */}
        {topics.length > 0 && (
          <>
            <h4 style={{ marginTop: 20 }}>Topics</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {topics.map((t, i) => (
                <span
                  key={i}
                  style={{
                    background: "#e5e7eb",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Intents */}
        {intent_tags.length > 0 && (
          <>
            <h4 style={{ marginTop: 16 }}>Intent</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {intent_tags.map((t, i) => (
                <span
                  key={i}
                  style={{
                    background: "#ede9fe",
                    color: "#6d28d9",
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div
          style={{
            marginTop: 24,
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <button
            onClick={onJoin}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "#22c55e",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Call
          </button>

          {(usdt_wallet || kofi || stripe) && (
            <button
              onClick={onTip}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: "none",
                background: "#3b82f6",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Tip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
