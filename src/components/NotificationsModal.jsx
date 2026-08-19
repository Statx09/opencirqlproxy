import React from "react";


export default function NotificationsModal({
  notifications = [],
  onNotificationClick,
}) {
  const getProfile = (notification) => {
    return notification.sender_profile || {};
  };

  const getName = (notification) => {
    const profile = getProfile(notification);

    return (
      profile.alias ||
      profile.name ||
      notification.sender_name ||
      "Someone"
    );
  };

  const getAlias = (notification) => {
    const profile = getProfile(notification);

    if (!profile.alias) return null;

    return profile.alias.startsWith("@")
      ? profile.alias
      : `@${profile.alias}`;
  };

  const getAvatar = (notification) => {
    const profile = getProfile(notification);

    return (
      profile.avatar_url ||
      profile.avatar ||
      null
    );
  };
  const getNotificationText = (notification) => {
    switch (notification.event) {
      case "status_like":
        return "liked your post";

      case "like":
        return "liked your profile";

      case "wave":
        return "waved at you";

      case "message":
        return "sent you a message";

      default:
        return (
          notification.text ||
          "sent you a notification"
        );
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.max(
      0,
      now - date
    );

    const seconds = Math.floor(
      diff / 1000
    );

    const minutes = Math.floor(
      seconds / 60
    );

    const hours = Math.floor(
      minutes / 60
    );

    const days = Math.floor(
      hours / 24
    );

    if (seconds < 60) {
      return "just now";
    }

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    if (hours < 24) {
      return `${hours}h ago`;
    }

    if (days < 7) {
      return `${days}d ago`;
    }

    return date.toLocaleDateString(
      undefined,
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  return (
    <div
      style={{
        padding: "10px 12px 16px",
        color: "#fff",
      }}
    >
      {notifications.length === 0 ? (
        <div
          style={{
            opacity: 0.55,
            textAlign: "center",
            padding: "48px 20px",
            fontSize: 14,
          }}
        >
          No notifications yet
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {notifications.map(
            (notification, index) => {
              const profile =
                getProfile(notification);

              const name =
                getName(notification);

              const alias =
                getAlias(notification);

              const avatar =
                getAvatar(notification);

              const unread =
                !notification.read_at;

              return (
                <button
                  type="button"
                  key={
                    notification.id ||
                    index
                  }
                  onClick={() =>
                    onNotificationClick?.(
                      notification
                    )
                  }
                  style={{
                    width: "100%",
                    border: unread
                      ? "1px solid rgba(255,255,255,0.11)"
                      : "1px solid rgba(255,255,255,0.055)",
                    borderRadius: 14,
                    padding:
                      "11px 12px",
                    background: unread
                      ? "rgba(255,255,255,0.075)"
                      : "rgba(255,255,255,0.025)",
                    color: "#fff",
                    display: "flex",
                    alignItems:
                      "center",
                    gap: 12,
                    textAlign: "left",
                    font: "inherit",
                    cursor: "pointer",
                    transition:
                      "background 0.15s ease",
                  }}
                >
                  {/* AVATAR */}

                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius:
                        "50%",
                      overflow: "hidden",
                      flexShrink: 0,
                      background:
                        "rgba(255,255,255,0.08)",
                      border:
                        "1px solid rgba(255,255,255,0.10)",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                    }}
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit:
                            "cover",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: 18,
                          opacity: 0.55,
                        }}
                      >
                        👤
                      </span>
                    )}
                  </div>

                  {/* CONTENT */}

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "baseline",
                        gap: 7,
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight:
                            unread
                              ? 700
                              : 550,
                          whiteSpace:
                            "nowrap",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {name}
                      </span>

                      {alias && (
                        <span
                          style={{
                            fontSize: 12,
                            opacity: 0.48,
                            whiteSpace:
                              "nowrap",
                            overflow:
                              "hidden",
                            textOverflow:
                              "ellipsis",
                          }}
                        >
                          {alias}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 3,
                        fontSize: 13,
                        lineHeight: 1.35,
                        opacity:
                          unread
                            ? 0.78
                            : 0.58,
                      }}
                    >
                      {getNotificationText(
                        notification
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 11,
                        opacity: 0.38,
                      }}
                    >
                      {formatTime(
                        notification.created_at
                      )}
                    </div>
                  </div>

                  {/* UNREAD DOT */}

                  {unread && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius:
                          "50%",
                        flexShrink: 0,
                        background:
                          "#fff",
                        boxShadow:
                          "0 0 8px rgba(255,255,255,0.55)",
                      }}
                    />
                  )}
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}




