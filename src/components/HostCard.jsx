import React, { useCallback, memo, useMemo } from "react";
import { MessageCircle, Phone } from "lucide-react";
import { getRelationship, canCall } from "../lib/interactionRules";

function HostCard({
  host,
  user,
  onViewProfile,
  openMedia,
  hasProfile,
  onOpenMessage,
  onOpenCall,
  onOpenSupport,
}) {
  if (!host) return null;

  const {
    name,
    alias,
    avatar,
    avatar_url,
    banner_url,
    intent_tags,
    topics,
    user_id,
  } = host;

  const displayName = name || alias || "Unnamed";
  const avatarSrc = avatar_url || avatar;

  /* ================= NORMALIZATION ================= */

  const normalizedTopics = useMemo(() => {
    if (!topics) return [];
    if (Array.isArray(topics)) return topics;

    return String(topics)
      .replace(/[{}"]/g, "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 3);
  }, [topics]);

  const normalizedIntent = useMemo(() => {
    if (!intent_tags) return [];
    if (Array.isArray(intent_tags)) return intent_tags;

    return String(intent_tags)
      .replace(/[{}"]/g, "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 2);
  }, [intent_tags]);

  /* ================= ACTIONS ================= */

  const handleMedia = useCallback(
    (url) => {
      openMedia?.({ type: "image", items: [url], index: 0 });
    },
    [openMedia]
  );

  const handleWave = useCallback(() => {
    console.log("WAVE CLICKED");

    if (!user?.id || !user_id) return;

    fetch("/api/wave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_user: user.id,
        to_user: user_id,
      }),
    }).catch((err) => console.log(err));

    onOpenMessage?.({
      host,
      context: "wave",
    });
  }, [user?.id, user_id, host, onOpenMessage]);

  const handleLike = useCallback(() => {
    console.log("LIKE CLICKED");

    onOpenMessage?.({
      host,
      context: "like",
    });
  }, [host, onOpenMessage]);

  const handleSupport = useCallback(() => {
    console.log("SUPPORT CLICKED");
    console.log("SUPPORT HOST:", host);

    onOpenSupport?.(host);
  }, [host, onOpenSupport]);

  /* ================= RENDER ================= */

  return (
    <div style={card}>

      {/* BANNER */}
      {banner_url ? (
        <img
          src={banner_url}
          loading="lazy"
          decoding="async"
          style={bannerImg}
          onClick={() => handleMedia(banner_url)}
        />
      ) : (
        <div style={fallbackBanner} />
      )}

      {/* VIEW PROFILE */}
      <button
        style={viewProfileBtn}
        onClick={(e) => {
          e.stopPropagation();
          onViewProfile?.();
        }}
      >
        View Profile
      </button>

      {/* ================= ACTION RAIL ================= */}
      <div style={actionRail}>

        <button style={railBtn} onClick={handleWave}>
          👋
        </button>

        <button style={railBtn} onClick={handleLike}>
          ❤️
        </button>

        <button style={railBtn} onClick={handleSupport}>
          💰
        </button>

      </div>

      {/* ================= CONTENT ================= */}
      <div style={content}>

        <img
          src={avatarSrc}
          loading="lazy"
          decoding="async"
          onClick={() => handleMedia(avatarSrc)}
          style={avatarStyle}
        />

        <h3 style={title}>{displayName}</h3>

        <div style={tagRow}>
          {normalizedIntent.map((t, i) => (
            <span key={i} style={intentTag}>{t}</span>
          ))}
        </div>

        <div style={tagRow}>
          {normalizedTopics.map((t, i) => (
            <span key={i} style={topicTag}>{t}</span>
          ))}
        </div>

        <div style={actionButtons}>

  <button
  style={{
    ...messageButton,
    background: "rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.45)",
    color: "#3b82f6",
    backdropFilter: "blur(10px)",
  }}
  onClick={() => {
    console.log("MESSAGE CLICKED");
    onOpenMessage?.(host);
  }}
>
  <MessageCircle size={22} color="#3b82f6" />
  <span style={{ color: "#3b82f6" }}>Message</span>
</button>

  <button
  style={{
    ...callButton,
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.45)",
    color: "#22c55e",
    backdropFilter: "blur(10px)",
  }}
  onClick={() => {
    console.log("CALL CLICKED");
    onOpenCall?.({ host, type: "video" });
  }}
>
  <Phone size={22} color="#22c55e" />
  <span style={{ color: "#22c55e" }}>Call</span>
</button>

</div>

      </div>
    </div>
  );
}

export default memo(HostCard);

/* ================= STYLES ================= */

const card = {
  height: "100dvh",
  width: "100vw",
  position: "relative",
  background: "#000",
  overflow: "hidden",
};

const bannerImg = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  position: "absolute",
  inset: 0,
};

const fallbackBanner = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
};

const viewProfileBtn = {
  position: "absolute",
  top: 40,
  right: 16,
  zIndex: 10,
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
};

const actionRail = {
  position: "absolute",
  top: 100,
  right: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 20,
};

const railBtn = {
  width: 48,
  height: 48,
  borderRadius: "50%",
  border: "1px solid rgba(255,255,255,0.15)",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
};

const content = {
  position: "absolute",
  bottom: 170,
  width: "100%",
  padding: 16,
  color: "#fff",
  zIndex: 10,
};

const avatarStyle = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  border: "3px solid #fff",
};

const title = { fontSize: 22, fontWeight: 800, marginTop: 10 };

const tagRow = {
  display: "flex",
  flexWrap: "wrap",
  gap: "6px 8px",   // 👈 IMPORTANT: row gap + column gap
  marginTop: 8,     // 👈 adds separation between rows
  alignItems: "flex-start",
};

const intentTag = {
  background: "#d1fae5",
  color: "#065f46",
  padding: "4px 8px",
  borderRadius: 8,
};

const topicTag = {
  background: "#ede9fe",
  color: "#5b21b6",
  padding: "4px 8px",
  borderRadius: 8,
};

const actionButtons = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 12,
};

const messageButton = {
  background: "#1e3a8a",
  color: "#fff",
  padding: 12,
  borderRadius: 12,
  border: "none",
  display: "flex",
  justifyContent: "space-between",
};

const callButton = {
  background: "#14532d",
  color: "#fff",
  padding: 12,
  borderRadius: 12,
  border: "none",
  display: "flex",
  justifyContent: "space-between",
};