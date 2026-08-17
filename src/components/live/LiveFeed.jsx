import React, { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  UserRound,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { normalizeHost } from "../../utils/normalizeHost";

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
  user,
  onOpenProfile,
  onAction,
}) {
  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [comments, setComments] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentText, setCommentText] = useState({});
  const [postingComment, setPostingComment] = useState({});

  /*
   * Load comment counts whenever the status list changes.
   */
  useEffect(() => {
    if (!statuses.length) return;

    const loadCommentCounts = async () => {
      const statusIds = statuses
        .map((status) => status.id)
        .filter(Boolean);

      if (!statusIds.length) return;

      const { data, error } = await supabase
        .from("status_comments")
        .select("status_id")
        .in("status_id", statusIds);

      if (error) {
        console.error("COMMENT COUNT ERROR:", error);
        return;
      }

      const counts = {};

      (data || []).forEach((comment) => {
        counts[comment.status_id] =
          (counts[comment.status_id] || 0) + 1;
      });

      setCommentCounts(counts);
    };

    loadCommentCounts();
  }, [statuses]);

  /*
   * Load persistent like state and counts whenever
   * the status list or current user changes.
   */
  useEffect(() => {
    if (!statuses.length) return;

    const loadLikes = async () => {
      const statusIds = statuses
        .map((status) => status.id)
        .filter(Boolean);

      if (!statusIds.length) return;

      const { data, error } = await supabase
        .from("status_likes")
        .select("status_id, user_id")
        .in("status_id", statusIds);

      if (error) {
        console.error("LIKE LOAD ERROR:", error);
        return;
      }

      const counts = {};
      const userLikes = {};

      (data || []).forEach((like) => {
        counts[like.status_id] =
          (counts[like.status_id] || 0) + 1;

        if (like.user_id === user?.id) {
          userLikes[like.status_id] = true;
        }
      });

      setLikeCounts(counts);
      setLiked(userLikes);
    };

    loadLikes();
  }, [statuses, user?.id]);

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

  const openProfile = (event, status) => {
    console.log("LIVEFEED PROFILE CLICK", status?.id, status?.user_id);
    event.stopPropagation();

    const profile = status?.profile;

    if (profile) {
      const host = normalizeHost(profile);

      onAction?.("profile", {
        ...host,
        profile_id: profile.id,
      });
    }
  };

  const toggleLike = async (event, status) => {
    event.stopPropagation();

    if (!user?.id || !status?.id) {
      console.warn("LIKE: missing user or status", {
        userId: user?.id,
        statusId: status?.id,
      });
      return;
    }

    const statusId = status.id;
    const alreadyLiked = !!liked[statusId];

    console.log(
      "LIVEFEED LIKE CLICK",
      statusId,
      alreadyLiked ? "UNLIKE" : "LIKE"
    );

    if (alreadyLiked) {
      const { error } = await supabase
        .from("status_likes")
        .delete()
        .eq("status_id", statusId)
        .eq("user_id", user.id);

      if (error) {
        console.error("UNLIKE ERROR:", error);
        return;
      }

      setLiked((previous) => {
        const next = { ...previous };
        delete next[statusId];
        return next;
      });

      setLikeCounts((previous) => ({
        ...previous,
        [statusId]: Math.max(
          0,
          (previous[statusId] || 0) - 1
        ),
      }));

      return;
    }

    const { error } = await supabase
      .from("status_likes")
      .insert({
        status_id: statusId,
        user_id: user.id,
      });

    if (error) {
      console.error("LIKE INSERT ERROR:", error);
      return;
    }

    setLiked((previous) => ({
      ...previous,
      [statusId]: true,
    }));

    setLikeCounts((previous) => ({
      ...previous,
      [statusId]: (previous[statusId] || 0) + 1,
    }));

    /*
     * Notify the status owner only after
     * the like has successfully been stored.
     */
    if (
      status.user_id &&
      status.user_id !== user.id
    ) {
      onAction?.("statusLike", {
        ...status,
        liked_by: user.id,
      });
    }
  };

  const handleMessage = (event, status) => {
    event.stopPropagation();

    if (status) {
      const host = normalizeHost(status.profile || status);

      console.log("LIVEFEED MESSAGE CLICK", host);

      onAction?.("messages", host);
    }
  };

  const loadComments = async (statusId) => {
    if (!statusId) return;

    const { data, error } = await supabase
      .from("status_comments")
      .select("*")
      .eq("status_id", statusId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("LOAD COMMENTS ERROR:", error);
      return;
    }

    setComments((previous) => ({
      ...previous,
      [statusId]: data || [],
    }));

    setCommentCounts((previous) => ({
      ...previous,
      [statusId]: (data || []).length,
    }));
  };

  const toggleComments = async (event, statusId) => {
    event.stopPropagation();

    const willOpen = !openComments[statusId];

    setOpenComments((previous) => ({
      ...previous,
      [statusId]: willOpen,
    }));

    if (willOpen && !comments[statusId]) {
      await loadComments(statusId);
    }
  };

  const handleCommentChange = (event, statusId) => {
    event.stopPropagation();

    setCommentText((previous) => ({
      ...previous,
      [statusId]: event.target.value,
    }));
  };

  const submitComment = async (event, status) => {
    event.preventDefault();
    event.stopPropagation();

    const text = commentText[status.id]?.trim();

    if (!text || postingComment[status.id]) {
      return;
    }

    setPostingComment((previous) => ({
      ...previous,
      [status.id]: true,
    }));

    try {
      const {
        data: authData,
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("AUTH ERROR:", authError);
        return;
      }

      const user = authData?.user;

      if (!user) {
        alert("Please login to comment.");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("name, alias, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      const commentName =
        profile?.name ||
        profile?.alias ||
        user.email?.split("@")[0] ||
        "Anonymous";

      const { data, error } = await supabase
        .from("status_comments")
        .insert({
          status_id: status.id,
          user_id: user.id,
          content: text,
          name: commentName,
          avatar_url: profile?.avatar_url || null,
        })
        .select()
        .single();

      if (error) {
        console.error("POST COMMENT ERROR:", error);
        alert("Could not post comment.");
        return;
      }

      setComments((previous) => ({
        ...previous,
        [status.id]: [
          ...(previous[status.id] || []),
          data,
        ],
      }));

      setCommentCounts((previous) => ({
        ...previous,
        [status.id]:
          (previous[status.id] || 0) + 1,
      }));

      setCommentText((previous) => ({
        ...previous,
        [status.id]: "",
      }));
    } finally {
      setPostingComment((previous) => ({
        ...previous,
        [status.id]: false,
      }));
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
          status.avatar_url ||
          "https://i.pravatar.cc/150";

        const name =
          profile?.name ||
          profile?.alias ||
          status.name ||
          "Anonymous";

        const alias =
          profile?.alias ||
          "";

        const isLiked =
          !!liked[status.id];
const isCommentsOpen =
          !!openComments[status.id];

        const statusComments =
          comments[status.id] || [];

        const count =
          commentCounts[status.id] || 0;

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
                    status
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
                      status
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
                  ·
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
                  <Heart
                    size={17}
                    strokeWidth={2}
                    fill={
                      isLiked
                        ? "currentColor"
                        : "none"
                    }
                  />

                  <span>
                    {likeCounts[status.id] || 0}
                  </span>
                </button>

                {/* COMMENTS */}

                <button
                  type="button"
                  style={{
                    ...actionButton,
                    color: isCommentsOpen
                      ? "#1d9bf0"
                      : "#8b95a7",
                  }}
                  onClick={(event) =>
                    toggleComments(
                      event,
                      status.id
                    )
                  }
                  title="Comments"
                >
                  <MessageCircle
                    size={17}
                    strokeWidth={2}
                  />

                  <span>
                    {count}
                  </span>
                </button>


                {/* MESSAGE */}

                <button
                  type="button"
                  style={actionButton}
                  onClick={(event) =>
                    handleMessage(
                      event,
                      status
                    )
                  }
                  title="Message"
                >
                  <Send
                    size={17}
                    strokeWidth={2}
                  />

                </button>

                {/* SHARE */}

                <button
                  type="button"
                  style={actionButton}
                  onClick={(event) =>
                    openProfile(
                      event,
                      status
                    )
                  }
                  title="View Profile"
                >
                  <UserRound
                    size={17}
                    strokeWidth={2}
                  />
                </button>

              </div>

              {/* COMMENTS */}

              {isCommentsOpen && (
                <div style={commentsPanel}>

                  <div style={commentsTitle}>
                    Comments
                  </div>

                  {statusComments.length > 0 ? (
                    <div style={commentsList}>
                      {statusComments.map(
                        (comment) => (
                          <div
                            key={comment.id}
                            style={commentRow}
                          >
                            <img
                              src={
                                comment.avatar_url ||
                                "https://i.pravatar.cc/80"
                              }
                              alt=""
                              style={commentAvatar}
                            />

                            <div style={commentBody}>
                              <div style={commentHeader}>
                                <strong>
                                  {comment.name ||
                                    "Anonymous"}
                                </strong>

                                <span>
                                  {formatTime(
                                    comment.created_at
                                  )}
                                </span>
                              </div>

                              <div style={commentContent}>
                                {comment.content}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div style={noComments}>
                      No comments yet.
                    </div>
                  )}

                  <form
                    style={commentForm}
                    onSubmit={(event) =>
                      submitComment(
                        event,
                        status
                      )
                    }
                  >
                    <input
                      value={
                        commentText[status.id] ||
                        ""
                      }
                      onChange={(event) =>
                        handleCommentChange(
                          event,
                          status.id
                        )
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                      placeholder="Write a comment..."
                      style={commentInput}
                      maxLength={500}
                    />

                    <button
                      type="submit"
                      disabled={
                        !commentText[
                          status.id
                        ]?.trim() ||
                        postingComment[
                          status.id
                        ]
                      }
                      style={{
                        ...commentSend,
                        opacity:
                          !commentText[
                            status.id
                          ]?.trim() ||
                          postingComment[
                            status.id
                          ]
                            ? 0.45
                            : 1,
                      }}
                    >
                      {postingComment[
                        status.id
                      ]
                        ? "..."
                        : "Send"}
                    </button>
                  </form>

                </div>
              )}

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
  padding: "16px 18px 14px 18px",
  borderBottom:
    "1px solid rgba(255,255,255,.09)",
  background: "transparent",
  transition: "background .15s ease",
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
  background: "transparent",
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
  background: "transparent",
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
  maxWidth: 470,
  marginTop: 12,
};

const actionButton = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 5,
  minWidth: 42,
  padding: "6px 8px",
  border: "none",
  background: "transparent",
  color: "#8b95a7",
  fontSize: 13,
  cursor: "pointer",
  borderRadius: 999,
  transition:
    "background .15s ease, color .15s ease",
};


/* =====================================================
   COMMENTS
===================================================== */

const commentsPanel = {
  marginTop: 10,
  paddingTop: 10,
  borderTop:
    "1px solid rgba(255,255,255,.07)",
};

const commentsTitle = {
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 700,
  marginBottom: 10,
};

const commentsList = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const commentRow = {
  display: "flex",
  gap: 9,
};

const commentAvatar = {
  width: 30,
  height: 30,
  borderRadius: "50%",
  objectFit: "cover",
  flexShrink: 0,
};

const commentBody = {
  minWidth: 0,
  flex: 1,
};

const commentHeader = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  fontSize: 13,
};

const commentHeaderTime = {
  color: "#8b95a7",
};

const commentContent = {
  marginTop: 2,
  color: "#d7dce5",
  fontSize: 14,
  lineHeight: 1.45,
  whiteSpace: "pre-wrap",
  overflowWrap: "anywhere",
};

const noComments = {
  color: "#7f8999",
  fontSize: 13,
  padding: "4px 0 10px",
};

const commentForm = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  marginTop: 12,
};

const commentInput = {
  flex: 1,
  minWidth: 0,
  height: 38,
  boxSizing: "border-box",
  padding: "0 12px",
  borderRadius: 999,
  border:
    "1px solid rgba(255,255,255,.1)",
  background:
    "rgba(255,255,255,.05)",
  color: "#ffffff",
  outline: "none",
  fontSize: 13,
};

const commentSend = {
  height: 38,
  padding: "0 15px",
  borderRadius: 999,
  border:
    "1px solid rgba(255,255,255,.1)",
  background:
    "rgba(255,255,255,.09)",
  color: "#ffffff",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};


/* =====================================================
   EMPTY
===================================================== */

const empty = {
  padding: "80px 30px",
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
