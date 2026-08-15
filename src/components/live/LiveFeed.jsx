import React, { useState } from "react";

function formatTime(date) {
  if (!date) return "";

  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);

  return `${days}d`;
}

export default function LiveFeed({
  statuses = [],
  onOpenProfile,
  onAction,
}) {
  const [liked, setLiked] = useState({});
  const [reposted, setReposted] = useState({});

  if (!statuses.length) {
    return (
      <div style={empty}>
        <div style={emptyTitle}>
          Nothing here yet
        </div>

        <div style={emptyText}>
          Be the first person to share something.
        </div>
      </div>
    );
  }

  const openProfile = (event, userId) => {
    event.stopPropagation();

    if (userId) {
      onOpenProfile?.(userId);
    }
  };

  const toggleLike = (event, status) => {
    event.stopPropagation();

    setLiked((previous) => ({
      ...previous,
      [status.id]: !previous[status.id],
    }));

    onAction?.("like", {
      user_id: status.user_id,
      id: status.user_id,
    });
  };

  const toggleRepost = (event, status) => {
    event.stopPropagation();

    setReposted((previous) => ({
      ...previous,
      [status.id]: !previous[status.id],
    }));

    onAction?.("wave", {
      user_id: status.user_id,
      id: status.user_id,
    });
  };

  const handleMessage = (event, userId) => {
    event.stopPropagation();

    if (userId) {
      onAction?.("messages", {
        user_id: userId,
      });
    }
  };

  const handleShare = async (event, status) => {
    event.stopPropagation();

    const shareText = status.content || "";
    const shareUrl = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          text: shareText,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          `${shareText}\n${shareUrl}`
        );

        alert("Post link copied.");
      }
    } catch (error) {
      console.log("Share cancelled:", error);
    }
  };

  return (
    <div style={feed}>

      {statuses.map((status) => {

        const profile =
          status.profile ||
          status.profiles ||
          null;

        const avatar =
          profile?.avatar_url ||
          "https://i.pravatar.cc/150";

        const name =
          profile?.name ||
          profile?.alias ||
          "Anonymous";

        const alias =
          profile?.alias ||
          "";

        const isLiked =
          !!liked[status.id];

        const isReposted =
          !!reposted[status.id];

        return (
          <article
            key={status.id}
            style={post}
          >

            {/* AVATAR */}

            <div style={avatarColumn}>

              <button
                type="button"
                style={avatarButton}
                onClick={(event) =>
                  openProfile(
                    event,
                    status.user_id
                  )
                }
              >
                <img
                  src={avatar}
                  alt={name}
                  style={avatarStyle}
                />
              </button>

            </div>


            {/* POST BODY */}

            <div style={body}>

              {/* HEADER */}

              <div style={header}>

                <button
                  type="button"
                  style={nameButton}
                  onClick={(event) =>
                    openProfile(
                      event,
                      status.user_id
                    )
                  }
                >
                  {name}
                </button>

                {alias && (
                  <span style={aliasStyle}>
                    @{alias}
                  </span>
                )}

                <span style={separator}>
                  �
                </span>

                <span style={time}>
                  {formatTime(
                    status.created_at
                  )}
                </span>

              </div>


              {/* CONTENT */}

              <div style={content}>
                {status.content}
              </div>


              {/* ACTIONS */}

              <div style={actions}>

                {/* LIKE */}

                <button
                  type="button"
                  style={{
                    ...actionButton,
                    color: isLiked
                      ? "#f91880"
                      : "#8b95a7",
                  }}
                  onClick={(event) =>
                    toggleLike(
                      event,
                      status
                    )
                  }
                  title="Like"
                >
                  <span style={actionIcon}>
                    {isLiked ? "?" : "?"}
                  </span>

                  <span>
                    {isLiked ? 1 : 0}
                  </span>
                </button>


                {/* REPOST */}

                <button
                  type="button"
                  style={{
                    ...actionButton,
                    color: isReposted
                      ? "#00ba7c"
                      : "#8b95a7",
                  }}
                  onClick={(event) =>
                    toggleRepost(
                      event,
                      status
                    )
                  }
                  title="Repost"
                >
                  <span style={actionIcon}>
                    ?
                  </span>

                  <span>
                    {isReposted ? 1 : 0}
                  </span>
                </button>


                {/* MESSAGE */}

                <button
                  type="button"
                  style={actionButton}
                  onClick={(event) =>
                    handleMessage(
                      event,
                      status.user_id
                    )
                  }
                  title="Message"
                >
                  <span style={actionIcon}>
                    ??
                  </span>

                  <span>
                    Message
                  </span>
                </button>


                {/* SHARE */}

                <button
                  type="button"
                  style={actionButton}
                  onClick={(event) =>
                    handleShare(
                      event,
                      status
                    )
                  }
                  title="Share"
                >
                  <span style={actionIcon}>
                    ?
                  </span>
                </button>

              </div>

            </div>

          </article>
        );
      })}

    </div>
  );
}


/* =====================================================
   FEED
===================================================== */

const feed = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  background: "transparent",
};


/* =====================================================
   POST
===================================================== */

const post = {
  display: "flex",
  width: "100%",
  boxSizing: "border-box",

  padding:
    "16px 18px 14px 18px",

  borderBottom:
    "1px solid rgba(255,255,255,.09)",

  background:
    "transparent",

  transition:
    "background .15s ease",
};


/* =====================================================
   AVATAR
===================================================== */

const avatarColumn = {
  width: 46,
  marginRight: 12,
  flexShrink: 0,
};

const avatarButton = {
  width: 46,
  height: 46,

  padding: 0,
  margin: 0,

  border: "none",
  borderRadius: "50%",

  background:
    "transparent",

  cursor: "pointer",

  overflow: "hidden",
};

const avatarStyle = {
  width: "100%",
  height: "100%",

  borderRadius: "50%",

  objectFit: "cover",

  display: "block",
};


/* =====================================================
   BODY
===================================================== */

const body = {
  flex: 1,
  minWidth: 0,
};


/* =====================================================
   HEADER
===================================================== */

const header = {
  display: "flex",
  alignItems: "center",

  minHeight: 22,

  gap: 6,

  flexWrap: "wrap",
};

const nameButton = {
  padding: 0,

  border: "none",

  background:
    "transparent",

  color: "#ffffff",

  fontSize: 15,

  fontWeight: 700,

  cursor: "pointer",
};

const aliasStyle = {
  color: "#8b95a7",

  fontSize: 14,

  fontWeight: 400,
};

const separator = {
  color: "#687385",

  fontSize: 14,
};

const time = {
  color: "#8b95a7",

  fontSize: 14,
};


/* =====================================================
   CONTENT
===================================================== */

const content = {
  marginTop: 4,

  color: "#f3f4f6",

  fontSize: 15,

  lineHeight: 1.55,

  whiteSpace: "pre-wrap",

  overflowWrap: "anywhere",
};


/* =====================================================
   ACTIONS
===================================================== */

const actions = {
  display: "flex",

  alignItems: "center",

  justifyContent: "space-between",

  maxWidth: 420,

  marginTop: 12,
};

const actionButton = {
  display: "flex",

  alignItems: "center",

  gap: 5,

  padding: "4px 8px",

  border: "none",

  background:
    "transparent",

  color: "#8b95a7",

  fontSize: 13,

  cursor: "pointer",

  borderRadius: 999,
};

const actionIcon = {
  fontSize: 17,

  lineHeight: 1,
};


/* =====================================================
   EMPTY
===================================================== */

const empty = {
  padding:
    "80px 30px",

  textAlign: "center",
};

const emptyTitle = {
  color: "#ffffff",

  fontSize: 18,

  fontWeight: 700,
};

const emptyText = {
  marginTop: 7,

  color: "#8b95a7",

  fontSize: 14,
};
