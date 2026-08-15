import React from "react";

export default function NotificationsModal({
  notifications = [],
  onNotificationClick,
}) {
  const getNotificationText = (notification) => {
    switch (notification.event) {
      case "status_like":
        return notification.text || "Someone liked your post";

      case "like":
        return "Someone liked you";

      case "wave":
        return "Someone waved at you";

      default:
        return notification.text || "You have a new notification.";
    }
  };

  const getNotificationTitle = (notification) => {
    switch (notification.event) {
      case "status_like":
        return "Post liked";

      case "like":
        return "New like";

      case "wave":
        return "New wave";

      default:
        return "Notification";
    }
  };

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
          No notifications yet
        </div>
      ) : (
        notifications.map((notification, index) => (
          <button
            type="button"
            key={notification.id || index}
            onClick={() => onNotificationClick?.(notification)}
            style={{
              width: "100%",
              textAlign: "left",
              cursor: "pointer",
              color: "#fff",
              font: "inherit",
              padding: 14,
              borderRadius: 14,
              background: notification.read_at
                ? "rgba(255,255,255,0.04)"
                : "rgba(255,255,255,0.08)",
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
              {getNotificationTitle(notification)}
            </div>

            <div
              style={{
                fontSize: 13,
                opacity: 0.85,
                lineHeight: 1.45,
              }}
            >
              {getNotificationText(notification)}
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
          </button>
        ))
      )}
    </div>
  );
}

