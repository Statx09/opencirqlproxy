import React, { memo, useMemo, useCallback, useState } from "react";
import { MessageCircle, Phone, UserRound, Hand, Heart, CircleDollarSign, Image, Mic, Video, X, BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { normalizeArray } from "../utils/profileHelpers";
import ExpressionBadges from "./expressions/ExpressionBadges";
import ImageModal from "./ImageModal";

function HostCard({ host, onAction, onNext, onPrev, onClose, variant = "swipe" }) {
  if (!host) return null;

  const {
    name,
    alias,
    avatar,
    banner,
    topics,
  } = host;

  const displayName = name || alias || "Unnamed";
  const avatarSrc = avatar || "";

  const payment = host?.payment_methods || {};
  const messageRate = payment.messages?.enabled ? Number(payment.messages?.ratePerMessage ?? 0) : 0;
  const pictureRate = payment.pictures?.enabled ? Number(payment.pictures?.ratePerPicture ?? 0) : 0;
  const voiceNoteRate = payment.voiceNotes?.enabled ? Number(payment.voiceNotes?.ratePerNote ?? 0) : 0;
  const voiceRate = payment.voice?.enabled ? Number(payment.voice?.ratePerMinute ?? 0) : 0;
  const videoRate = payment.video?.enabled ? Number(payment.video?.ratePerMinute ?? 0) : 0;

  const flags = normalizeArray(host?.flags);
  const expressions = normalizeArray(
  host?.expressions || host?.expression_badges
);

  const intents = normalizeArray(
    host?.intents || host?.intent_tags
  ).slice(0, 5);
  const normalizedTopics = useMemo(() => {
    if (!topics) return [];
    if (Array.isArray(topics)) return topics;
    return String(topics).split(",").map(t => t.trim()).filter(Boolean);
  }, [topics]);


  const [actionFeedback, setActionFeedback] = useState(null);
  const [showImageModal, setShowImageModal] = useState(null);
  const galleryImages = normalizeArray(host?.gallery_urls).filter(Boolean);

  const showActionFeedback = useCallback((type) => {
    setActionFeedback(type);

    window.clearTimeout(window.__hostCardFeedbackTimer);

    window.__hostCardFeedbackTimer = window.setTimeout(() => {
      setActionFeedback(null);
    }, 1400);
  }, []);
  const handle = useCallback(
    (type) => {
      onAction?.(type, host);
    },
    [onAction, host]
  );

console.log("HOSTCARD HOST", host);
console.log("HOSTCARD user_id:", host.user_id);
console.log("HOSTCARD id:", host.id);
console.log("HOSTCARD expression_badges", host.expression_badges);
console.log("HOSTCARD expressions", host.expressions);
console.log("HOSTCARD normalized", expressions);

  return (
    <div style={container}>

      {/* BANNER */}
      {banner ? (
        <img src={banner} style={bannerStyle} />
      ) : (
        <div style={fallbackBanner} />
      )}
{actionFeedback && (
        <div style={actionFeedbackStyle}>
          <span style={actionFeedbackIcon} aria-hidden="true">
            {actionFeedback === "wave" ? (
              <Hand size={18} strokeWidth={1.8} />
            ) : actionFeedback === "like" ? (
              <Heart size={18} strokeWidth={1.8} />
            ) : (
              "âœ“"
            )}
          </span>

          <span>
            {actionFeedback === "wave"
              ? "Wave sent"
              : actionFeedback === "like"
              ? "Like sent"
              : "Support opened"}
          </span>
        </div>
      )}
      {variant === "expanded" && (
        <button
          type="button"
          aria-label="Close expanded profile"
          title="Close"
          onClick={(e) => {
            e.stopPropagation();
            onClose?.();
          }}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            zIndex: 100,
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.35)",
            background: "rgba(0,0,0,0.65)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          <X size={21} />
        </button>
      )}
      {/* ACTION RAIL */}
      <div style={rail}>
        <button style={railBtn} onClick={() => { showActionFeedback("wave"); handle("wave"); }} title="Wave" aria-label="Wave"><Hand size={19} strokeWidth={1.8} /></button>
        <button style={railBtn} onClick={() => { showActionFeedback("like"); handle("like"); }} title="Like" aria-label="Like"><Heart size={19} strokeWidth={1.8} /></button>
        <button style={railBtn} onClick={() => { showActionFeedback("support"); handle("support"); }} title="Support" aria-label="Support"><CircleDollarSign size={19} strokeWidth={1.8} /></button>
      </div>

      {/* CONTENT */}
      <div style={variant === "expanded" ? { ...content, bottom: 100 } : content}>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", boxSizing: "border-box" }}>
          <img
            src={avatarSrc}
            alt={`${displayName} avatar`}
            style={{ ...avatarStyle, cursor: avatarSrc ? "zoom-in" : "default" }}
            role={avatarSrc ? "button" : undefined}
            tabIndex={avatarSrc ? 0 : undefined}
            onClick={(e) => {
              e.stopPropagation();
              if (avatarSrc) {
                setShowImageModal({ images: [avatarSrc], initialIndex: 0 });
              }
            }}
            onKeyDown={(e) => {
              if ((e.key === "Enter" || e.key === " ") && avatarSrc) {
                e.preventDefault();
                e.stopPropagation();
                setShowImageModal({ images: [avatarSrc], initialIndex: 0 });
              }
            }}
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 0, marginLeft: "auto", paddingRight: 55, position: "relative", top: variant === "expanded" ? 0 : 108 }}>
            {messageRate > 0 && <span style={rateItem}><MessageCircle size={16} strokeWidth={2.2} />${messageRate.toFixed(2)}</span>}
            {pictureRate > 0 && <span style={rateItem}><Image size={16} strokeWidth={2.2} />${pictureRate.toFixed(2)}</span>}
            {voiceNoteRate > 0 && <span style={rateItem}><Mic size={16} strokeWidth={2.2} />${voiceNoteRate.toFixed(2)}</span>}
            {voiceRate > 0 && <span style={rateItem}><Phone size={16} strokeWidth={2.2} />${voiceRate.toFixed(2)}/min</span>}
            {videoRate > 0 && <span style={rateItem}><Video size={16} strokeWidth={2.2} />${videoRate.toFixed(2)}/min</span>}
          </div>
        </div>

        <div style={nameStyle}>{displayName}{host.is_verified && <span title="Selfie verified" aria-label="Selfie verified" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: 12, color: "#38BDF8", fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", verticalAlign: "middle" }}><BadgeCheck size={22} color="#38BDF8" style={{ flexShrink: 0 }} /><span>Verified</span></span>}</div>

{host.headline && (
  <div style={headlineStyle}>
    {host.headline}
  </div>
)}

        {/* IDENTITY */}
<div style={identityRow}>

  <ExpressionBadges
    badges={expressions}
    max={5}
    size={56}
  />

  {flags.map((flag) => (
    <div
      key={flag}
      style={flagBubble}
    >
      {flag}
    </div>
  ))}

</div>



        {/* INTENTS */}
        {intents.length > 0 && (
          <div style={intentTags}>
            {intents.map((intent, i) => (
              <span key={`${intent}-${i}`} style={intentTag}>
                {intent}
              </span>
            ))}
          </div>
        )}

        {/* TOPICS */}
        <div style={tags}>
          {normalizedTopics.map((t, i) => (
            <span key={i} style={topicTag}>{t}</span>
          ))}
        </div>


        {/* PHOTO GALLERY */}
        {galleryImages.length > 0 && (
          <div
            style={{
              position: "relative",
              display: "flex",
              gap: 6,
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              overflowX: "auto",
              padding: 4,
              marginTop: 10,
              marginBottom: 8,
              borderRadius: 10,
              background: "transparent",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {galleryImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={"Gallery photo " + (i + 1)}
                onClick={() => setShowImageModal({ images: galleryImages, initialIndex: i })}
                style={{
                  width: 48,
                  height: 48,
                  flex: "0 0 48px",
                  objectFit: "cover",
                  borderRadius: 7,
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.65)",
                }}
              />
            ))}
          </div>
        )}
        {/* MESSAGE + CALL */}
        {(variant === "swipe" || variant === "expanded") && (
          <div style={buttons}>

            <button
              style={msgBtn}
              onClick={(e) => {
                e.stopPropagation();
                handle("messages");
              }}
            >
              <MessageCircle size={16} />
              Message
            </button>

            <button
              style={callBtn}
              onClick={(e) => {
                e.stopPropagation();
                handle("call");
              }}
            >
              <Phone size={16} />
              Call
            </button>

          </div>
        )}

        {/* ARROWS (FIXED LOGIC) */}
        {variant === "swipe" && (
          <div style={arrowRow}>

            <button
              style={arrowBtn}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPrev?.();
              }}
            >
              <ChevronLeft size={22} strokeWidth={2} aria-hidden="true" />
            </button>

            <button
              style={arrowBtn}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onNext?.();
              }}
            >
              <ChevronRight size={22} strokeWidth={2} aria-hidden="true" />
            </button>

          </div>
        )}

      </div>
      {showImageModal && <ImageModal images={showImageModal.images} initialIndex={showImageModal.initialIndex} onClose={() => setShowImageModal(null)} />}
    </div>
  );
}

export default memo(HostCard);

/* ================= ONLY ADDITIONS (NO LAYOUT CHANGE) ================= */

const leftArrow = {
  position: "absolute",
  left: 10,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 50,
  width: 50,
  height: 50,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  fontSize: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const rightArrow = {
  position: "absolute",
  right: 10,
  top: "50%",
  transform: "translateY(-50%)",
  zIndex: 50,
  width: 50,
  height: 50,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.5)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.2)",
  fontSize: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/* keep your existing styles BELOW unchanged */
const container = {
  height: "100dvh",
  width: "100vw",
  position: "relative",
  overflow: "hidden",
  background: "#000",
};

const bannerStyle = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  zIndex: 0,        
};

const fallbackBanner = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(135deg,#7c3aed,#3b82f6)",
};

const glassTopButton = {
  position: "absolute",
  top: 16,
  right: 16,

  width: 44,
  height: 44,
  padding: 0,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  borderRadius: "50%",

  background: "rgba(20,20,25,.72)",

  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",

  border: "1px solid rgba(255,255,255,0.14)",

  boxShadow:
    "0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",

  color: "#fff",

  cursor: "pointer",
};

const actionFeedbackStyle = {
  position: "absolute",
  right: 18,
  bottom: 170,

  display: "flex",
  alignItems: "center",
  gap: 8,

  padding: "9px 13px",

  borderRadius: 999,

  background: "rgba(10,10,14,0.82)",
  border: "1px solid rgba(255,255,255,0.12)",

  color: "#fff",
  fontSize: 12,
  fontWeight: 650,

  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  boxShadow:
    "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",

  zIndex: 10001,

  transform: "translateY(0) scale(1)",
  opacity: 1,
  transition: "transform .25s ease, opacity .25s ease",

  pointerEvents: "none",
};

const actionFeedbackIcon = {
  fontSize: 12,
  lineHeight: 1,
};
const rail = {
  position: "absolute",
  top: 125,
  right: 14,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  zIndex: 9999,        // Ã°Å¸â€Â¥ ADD THIS
  pointerEvents: "auto"
};

const railBtn = {
  width: 46,
  height: 46,

  borderRadius: "50%",

  background: "rgba(20,20,25,.72)",

  border: "1px solid rgba(255,255,255,0.14)",

  color: "#ffffff",

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  cursor: "pointer",

  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",

  boxShadow:
    "0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",

  transition:
    "transform .18s ease, box-shadow .18s ease",
};

const content = {
  position: "absolute",
  bottom: 80,   // lower card content

  width: "100%",
  padding: 16,

  color: "#fff",
  zIndex: 5,
};

const avatarStyle = {
  width: 140,
  height: 140,
  borderRadius: "50%",
  border: "4px solid rgba(255,255,255,.95)",

  objectFit: "cover",

  boxShadow:
    "0 12px 28px rgba(0,0,0,.45)",

  marginBottom: 8,
};

const nameStyle = {
  fontSize: 20,
  fontWeight: 800,
  marginTop: 10,
};

const tags = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const intentTags = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  marginTop: 8,
  marginBottom: 4,
};

const intentTag = {
  background: "rgba(124,58,237,.28)",
  border: "1px solid rgba(124,58,237,.55)",
  color: "#ddd6fe",
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700,
};
const topicTag = {
  background: "rgba(45,212,191,.12)",
  border: "1px solid rgba(45,212,191,.28)",
  color: "#99f6e4",
  padding: "4px 8px",
  borderRadius: 999,
  fontSize: 10,
  fontWeight: 700,
};

const buttons = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 12,
};

const msgBtn = {
  background: "rgba(20,20,25,.82)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  color: "#60a5fa",
  border: "1px solid rgba(96,165,250,.35)",

  boxShadow: "0 8px 20px rgba(0,0,0,.35)",

  padding: 10,
  borderRadius: 12,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  gap: 8,
  cursor: "pointer",
};

const callBtn = {
  background: "rgba(20,20,25,.82)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",

  color: "#4ade80",
  border: "1px solid rgba(74,222,128,.35)",

  boxShadow: "0 8px 20px rgba(0,0,0,.35)",

  padding: 10,
  borderRadius: 12,

  display: "flex",
  alignItems: "center",
  justifyContent: "center",

  gap: 8,
  cursor: "pointer",
};

const headlineStyle = {
  marginTop: 6,
  marginBottom: 10,
  fontSize: 15,
  color: "rgba(255,255,255,0.9)",
  fontWeight: 500,
  lineHeight: 1.4,
  textShadow: "0 1px 4px rgba(0,0,0,0.35)",
};

const arrowRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: 14,
  padding: "0 10px",
};

const arrowBtn = {
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.25)",
  fontSize: 28,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const expressionChip = {
  padding: "4px 8px",
  borderRadius: 999,
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  fontSize: 12,
  marginRight: 6,
  display: "inline-block",
};

const rateItem = {
  color: "rgba(255,255,255,0.95)",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 7,
};

const identityRow = {
  display: "flex",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 8,
  marginTop: 8,
  marginBottom: 8,
};

const flagBubble = {
  padding: "3px 8px",

  borderRadius: 999,

  background: "rgba(255,255,255,.08)",

  border: "1px solid rgba(255,255,255,.10)",

  backdropFilter: "blur(12px)",

  fontSize: 11,

  color: "#fff",
};

























































