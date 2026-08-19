import React, { useState, useEffect } from "react";
import { X, MessageCircle, Handshake, Phone, Video } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

import MessagesModal from "./MessagesModal";
import CallsStudioModal from "./CallsStudioModal";
import TipHostButton from "./TipHostButton";
import ImageModal from "./ImageModal";
import ExpressionBadges from "./expressions/ExpressionBadges";

export default function ProfileModal({ host, onClose, onAction }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sessionUser, setSessionUser] = useState(null);

  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState(null);
  const [showImageModal, setShowImageModal] = useState(null);
  const [showTipModal, setShowTipModal] = useState(false);

  // ---------------- AUTH ----------------
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      setSessionUser(data?.user || null);
    };
    loadUser();
  }, []);

// ---------------- PROFILE LOAD ----------------
useEffect(() => {
  console.log("PROFILE MODAL HOST:", host);

  if (!host?.id) {
    console.log("âŒ No profile id on host");
    setLoading(false);
    return;
  }

  const fetchProfile = async () => {
    console.log("Fetching profile for:", host.user_id);

    setLoading(true);

    const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", host.id)
  .maybeSingle();

console.log("PROFILE QUERY");
console.log("host.id =", host.id);
console.log("host.user_id =", host.user_id);
console.log("data =", data);
console.log("error =", error);

    console.log("PROFILE DATA:", data);
    console.log("PROFILE ERROR:", error);

    setProfile(data || null);
    setLoading(false);
  };

  fetchProfile();
}, [host]);

  // ---------------- STATES ----------------
  if (loading) {
    return (
      <div style={overlay}>
        <div style={modal}>Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={overlay}>
        <div style={modal}>Profile not found</div>
      </div>
    );
  }

  // ---------------- DATA ----------------
  const images = profile.gallery_urls || [];
  const topics = profile.topics || [];
  const intents = profile.intent_tags || [];
  const expressions = profile.expression_badges || [];
  const location = profile.country || profile.location || "";
  const languages = Array.isArray(profile.languages)
    ? profile.languages
    : profile.languages
      ? String(profile.languages)
          .replace(/[{}"]/g, "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
      : [];

    // ---------------- ACTIONS ----------------
  const handleMessage = () => {
    if (!sessionUser?.id) {
      alert("Please login to message.");
      return;
    }
    setShowMessageModal(true);
  };

  const handleCall = (type) => {
    if (!sessionUser?.id) {
      alert("Please login to continue.");
      return;
    }
    setCallType(type);
    setShowCallModal(true);
  };

  console.log("PROFILE OBJECT:", profile);
  console.log("BANNER URL:", profile.banner_url);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>

        <button onClick={onClose} style={closeBtn}>✕</button>

        {/* BANNER */}
        <div style={bannerWrap}>
          <img
            src={profile.banner_url || "https://placehold.co/600x200"}
            style={bannerImg}
          />
        </div>

        {/* HEADER */}
        <div style={header}>
          <img
            src={profile.avatar_url || "https://placehold.co/120"}
            style={avatarStyle}
          />

          <div style={{ textAlign: "center" }}>
            <h2>{profile.alias || profile.name}</h2>
            {profile.headline && (
              <p style={headlineText}>{profile.headline}</p>
            )}

            <p style={bioText}>{profile.bio}</p>

            {(location || languages.length > 0) && (
              <div style={metaText}>
                {location && <span>{location}</span>}
                {location && languages.length > 0 && <span> | </span>}
                {languages.length > 0 && (
                  <span>{languages.join(", ")}</span>
                )}
              </div>
            )}
            {/* EXPRESSIONS */}

{expressions.length > 0 && (
  <div
    style={{
      marginTop: 18,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <ExpressionBadges
      badges={expressions}
      max={999}
      showLabels
    />
  </div>
)}
          </div>
        </div>


        {/* INTENTS */}
        <div style={tagWrap}>
          {intents.map((t, i) => (
            <span key={i} style={intentTag}>{t}</span>
          ))}
        </div>

        {/* TOPICS */}
        <div style={tagWrap}>
          {topics.map((t, i) => (
            <span key={i} style={topicTag}>{t}</span>
          ))}
        </div>

        {/* GALLERY */}
        <div style={imageScroll}>
          {images.length === 0 ? (
            <p style={{ color: "#aaa" }}>No images uploaded</p>
          ) : (
            images.map((img, i) => (
              <img
                key={i}
                src={img}
                style={imageThumb}
                onClick={() =>
                  setShowImageModal({
                    images,
                    initialIndex: i,
                  })
                }
              />
            ))
          )}
        </div>

        {/* SOCIAL / LINKS */}
        {profile.social_links?.[0] &&
          Object.values(profile.social_links[0]).some(Boolean) && (
            <div style={linksSection}>
              <div style={linksTitle}>Links</div>

              <div style={linksRow}>
                {profile.social_links[0].website && (
                  <button
                    type="button"
                    style={glassLinkButton}
                    onClick={() =>
                      window.open(
                        profile.social_links[0].website,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Website
                  </button>
                )}

                {profile.social_links[0].twitter && (
                  <button
                    type="button"
                    style={glassLinkButton}
                    onClick={() =>
                      window.open(
                        profile.social_links[0].twitter,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Twitter
                  </button>
                )}

                {profile.social_links[0].instagram && (
                  <button
                    type="button"
                    style={glassLinkButton}
                    onClick={() =>
                      window.open(
                        profile.social_links[0].instagram,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    Instagram
                  </button>
                )}

                {profile.social_links[0].tiktok && (
                  <button
                    type="button"
                    style={glassLinkButton}
                    onClick={() =>
                      window.open(
                        profile.social_links[0].tiktok,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                  >
                    TikTok
                  </button>
                )}
              </div>
            </div>
          )}

        {/* BOTTOM PROFILE ACTIONS */}
        <div style={bottomActionRow}>

          <button
            type="button"
            style={glassActionButton}
            onClick={handleMessage}
            title="Message"
            aria-label="Message"
          >
            <MessageCircle size={19} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            style={glassActionButton}
            onClick={() => {
              if (!sessionUser?.id) {
                alert("Please login to connect.");
                return;
              }

              if (!onAction) {
                alert("Connection action unavailable.");
                return;
              }

              onAction("connect", host);
            }}
            title="Request Connection"
            aria-label="Request Connection"
          >
            <Handshake size={21} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            style={glassActionButton}
            onClick={() => handleCall("voice")}
            title="Voice Call"
            aria-label="Voice Call"
          >
            <Phone size={19} strokeWidth={1.8} />
          </button>

          <button
            type="button"
            style={glassActionButton}
            onClick={() => handleCall("video")}
            title="Video Call"
            aria-label="Video Call"
          >
            <Video size={19} strokeWidth={1.8} />
          </button>

        </div>
        {/* MODALS */}
        {showMessageModal && (
          <MessagesModal
            host={host}
            user={sessionUser}
            onClose={() => setShowMessageModal(false)}
          />
        )}
        {showCallModal && (
          <CallsStudioModal
            host={host}
            user={sessionUser}
            onClose={() => setShowCallModal(false)}
          />
        )}

        {showTipModal && (
          <TipHostButton
            host={host}
            onClose={() => setShowTipModal(false)}
          />
        )}
        {showImageModal && (
          <ImageModal
            images={showImageModal.images}
            initialIndex={showImageModal.initialIndex}
            onClose={() => setShowImageModal(null)}
          />
        )}

      </div>
    </div>
  );
}

const bannerWrap = { width: "100%", height: 140, overflow: "hidden" };
const bannerImg = { width: "100%", height: "100%", objectFit: "cover" };

const header = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginTop: -40,
  paddingBottom: 10,
};

const avatarStyle = {
  width: 90,
  height: 90,
  borderRadius: "50%",
  border: "4px solid #111827",
  objectFit: "cover",
};

const headlineText = {
  fontSize: 14,
  color: "#fff",
  fontWeight: 600,
  marginTop: 6,
  marginBottom: 0,
  maxWidth: 420,
  textAlign: "center",
};

const metaText = {
  fontSize: 12,
  color: "#888",
  marginTop: 6,
  textAlign: "center",
};

const bioText = {
  fontSize: 13,
  color: "#aaa",
  marginTop: 6,
  maxWidth: 420,
  textAlign: "center",
};

const badgeWrap = {
  display: "flex",
  gap: 6,
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: 8,
};

const badgeStyle = {
  background: "#1f2937",
  color: "#fbbf24",
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  border: "1px solid #374151",
};

const actionRow = {
  display: "flex",
  justifyContent: "center",
  gap: 8,
  flexWrap: "wrap",
  padding: "10px 16px",
};

const primaryBtn = {
  background: "#7c3aed",
  color: "#fff",
  border: "none",
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};

const secondaryBtn = {
  background: "#111827",
  color: "#fff",
  border: "1px solid #333",
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
};

const tipBtn = {
  background: "#fbbf24",
  color: "#111",
  border: "none",
  padding: "10px 12px",
  borderRadius: 10,
  cursor: "pointer",
  fontWeight: 700,
};

const tagWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
  justifyContent: "center",
  padding: "8px 16px",
};

const intentTag = {
  background: "#2dd4bf",
  padding: "4px 8px",
  borderRadius: 8,
  fontSize: 12,
};

const topicTag = {
  background: "#c8a2f2",
  padding: "4px 8px",
  borderRadius: 8,
  fontSize: 12,
};

const imageScroll = {
  display: "flex",
  gap: 8,
  overflowX: "auto",
  padding: "10px 16px",
};

const imageThumb = {
  width: 90,
  height: 90,
  borderRadius: 12,
  objectFit: "cover",
  cursor: "pointer",
  flexShrink: 0,
};
const linksSection = {
  width: "100%",
  padding: "10px 16px 4px",
  boxSizing: "border-box",
};

const linksTitle = {
  fontSize: 11,
  fontWeight: 700,
  color: "rgba(255,255,255,0.55)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 8,
};

const linksRow = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
};

const glassLinkButton = {
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.82)",
  border: "1px solid rgba(255,255,255,0.10)",
  padding: "7px 11px",
  borderRadius: 9,
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 600,
  backdropFilter: "blur(10px)",
};

const bottomActionRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 14,
  width: "100%",
  padding: "16px 16px 10px",
  boxSizing: "border-box",
  overflowX: "auto",
};

const glassActionButton = {
  flex: "0 0 50px",
  width: 50,
  height: 50,
  minWidth: 50,
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.045)",
  color: "rgba(255,255,255,0.9)",
  border: "1px solid rgba(255,255,255,0.11)",
  borderRadius: 13,
  cursor: "pointer",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
  transition: "background 0.15s ease, border-color 0.15s ease, transform 0.15s ease",
};
const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.65)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 100001,
};

const modal = {
  width: "95%",
  maxWidth: 650,
  maxHeight: "90vh",
  background: "#111827",
  borderRadius: 18,
  overflowY: "auto",
  color: "#fff",
  position: "relative",
  paddingBottom: 20,
};

const closeBtn = {
  position: "absolute",
  right: 12,
  top: 12,
  background: "#000",
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "6px 10px",
  cursor: "pointer",
};













