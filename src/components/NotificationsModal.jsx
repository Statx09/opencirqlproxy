import React from "react";

export default function NotificationsModal({
  notifications = [],
}) {
  return (
    <div
      style={{
        padding: 16,
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {notifications.length === 0 ? (
        <div
          style={{
            opacity: 0.6,
            textAlign: "center",
            padding: "40px 20px",
            fontSize: 14,
          }}
        >
          🔔 No notifications yet
        </div>
      ) : (
        notifications.map((notification, index) => (
          <div
            key={notification.id || index}
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {notification.title || "Notification"}
            </div>

            <div
              style={{
                fontSize: 13,
                opacity: 0.85,
                lineHeight: 1.45,
              }}
            >
              {notification.body ||
                notification.message ||
                "You have a new notification."}
            </div>

            {notification.created_at && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 11,
                  opacity: 0.5,
                }}
              >
                {new Date(notification.created_at).toLocaleString()}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}