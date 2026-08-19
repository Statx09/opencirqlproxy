import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import useProfile from "../../hooks/useProfile";
import ExpressSection from "./ExpressSection";
import IntentSection from "./IntentSection";
import IdentitySection from "./IdentitySection";

export default function ProfileTab({ user, onViewCard }) {
  const [tab, setTab] = useState("profile");
  const [loading, setLoading] = useState(false);

  const {
    profile,
    loading: profileLoading,
    updateProfile,
    uploadAvatar,
    uploadBanner,
    uploadGallery,
  } = useProfile(user?.id);

  /* ================= IDENTITY ================= */
  const [alias, setAlias] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("ZA");
  const [bio, setBio] = useState("");

const [languages, setLanguages] = useState([]);

const [isAI, setIsAI] = useState(false);

const [aiPersonality, setAiPersonality] = useState("");

  /* ================= MEDIA ================= */
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState([]);

  /* ================= EXPRESSIONS ================= */
 
const [expressions, setExpressions] = useState([]);
const [intents, setIntents] = useState([]);

  /* ================= MONETIZATION ================= */
  const [paypal, setPaypal] = useState("");
  const [crypto, setCrypto] = useState("");

  /* ================= PAYMENT SETTINGS ================= */
  const [paymentSettings, setPaymentSettings] = useState({
    currency: "USD",
    free: false,
    acceptTips: true,
    requestPayment: false,
    voice: {
      enabled: true,
      duration: 30,
      price: 10,
    },
    video: {
      enabled: true,
      duration: 30,
      price: 15,
    },
    enabled: [],
  });

  /* ================= LINKS ================= */
  const [links, setLinks] = useState({
    twitter: "",
    instagram: "",
    tiktok: "",
    website: "",
  });

  /* ================= UPLOAD ================= */
    
const uploadImage = async (file, bucket) => {
  if (!file || !user?.id) return null;

  const ext = file.name.split(".").pop();
  const fileName = `${user.id}-${Date.now()}.${ext}`;

  // ONLY FILE NAME (NOT folder/bucket mixed in)
  const filePath = fileName;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.log("UPLOAD ERROR:", error);
    return null;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data?.publicUrl || null;
};

  /* ================= PROFILE SYNC ================= */
useEffect(() => {
  console.log("PROFILE TAB USER:", user);
  console.log("PROFILE TAB USER ID:", user?.id);
  console.log("PROFILE TAB DATA:", JSON.stringify(profile, null, 2));

  if (!profile) return;

  setAlias(profile.alias || "");
  setHeadline(profile.headline || "");
  setLocation(profile.country || "ZA");

  setBio(profile.bio || "");

setLanguages(profile.languages || []);

setIsAI(profile.is_ai || false);

setAiPersonality(profile.ai_personality || "");

  setAvatarUrl(profile.avatar_url || "");
  setBannerUrl(profile.banner_url || "");
  setGalleryUrls(profile.gallery_urls || []);

setExpressions(profile.expression_badges || []);
  setIntents(
    Array.isArray(profile.intent_tags)
      ? profile.intent_tags
      : String(profile.intent_tags || "")
          .replace(/[{}"]/g, "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
  );

  setPaypal(profile.paypal_link || "");
  setCrypto(profile.usdtwallet || "");

  setPaymentSettings({
    currency: profile.payment_methods?.currency || "USD",
    free:
      profile.payment_methods?.free ?? false,
    acceptTips:
      profile.payment_methods?.acceptTips ?? true,
    requestPayment:
      profile.payment_methods?.requestPayment ?? false,
    voice: {
      enabled: profile.payment_methods?.voice?.enabled ?? true,
      duration: profile.payment_methods?.voice?.duration || 30,
      price: profile.payment_methods?.voice?.price || 10,
    },
    video: {
      enabled: profile.payment_methods?.video?.enabled ?? true,
      duration: profile.payment_methods?.video?.duration || 30,
      price: profile.payment_methods?.video?.price || 15,
    },
    enabled: profile.payment_methods?.enabled || [],
  });

  setLinks(
    profile.social_links?.[0] || {
      twitter: "",
      instagram: "",
      tiktok: "",
      website: "",
    }
  );
}, [profile]);

  /* ================= SAVE ================= */
  const saveProfile = async () => {
    if (!user?.id) return;
    setLoading(true);

    const payload = {
  user_id: user.id,
  email: user.email || null,

  /* Identity */
  alias,
  headline,
  bio,

  country: location,
  languages,

  is_ai: isAI,
  ai_personality: aiPersonality,

  /* Media */
  avatar_url: avatarUrl,
  banner_url: bannerUrl,
  gallery_urls: galleryUrls,

  /* Expressions */
expression_badges: expressions,
  intent_tags: intents,

  /* Monetization */
  paypal_link: paypal,
  usdtwallet: crypto,

  /* Payment Settings */
  payment_methods: paymentSettings,

  /* Links */
  social_links: [links],

  updated_at: new Date().toISOString(),
};

    const { data, error } = await supabase
  .from("profiles")
  .upsert(payload, {
    onConflict: "user_id",
  })
  .select()
  .single();

console.log("PROFILE UPSERT RESULT:", { data, error });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Profile saved");
  };

  return (
    <div style={wrap}>

      {/* ================= HERO ================= */}
<div style={hero}>

  {/* BANNER */}
  <div style={bannerBox}>
    <img
      src={bannerUrl || "https://via.placeholder.com/600x200"}
      style={banner}
    />

    <input
      type="file"
      accept="image/*"
      id="bannerUpload"
      style={{ display: "none" }}
      onChange={async (e) => {
        const file = e.target.files[0];
        const url = await uploadBanner(file);
        if (url) setBannerUrl(url);
      }}
    />

    <label htmlFor="bannerUpload" style={uploadBtn}>
      Upload Banner
    </label>
  </div>
      {/* VIEW MY CARD */}
      {onViewCard && (
        <div style={logoutRow}>
          <button
            type="button"
            onClick={onViewCard}
            style={{
              ...logoutTopBtn,
              border: "1px solid rgba(124,58,237,0.6)",
              background: "rgba(124,58,237,0.14)",
              color: "#c4b5fd",
            }}
          >
            View My Card
          </button>
        </div>
      )}

  {/* AVATAR */}
  <div style={avatarWrap}>
          <img
            src={avatarUrl || "https://via.placeholder.com/100"}
            style={avatar}
          />

          <input
            type="file"
            accept="image/*"
            id="avatarUpload"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files[0];
              const url = await uploadAvatar(file);
if (url) setAvatarUrl(url);
            }}
          />

          <label htmlFor="avatarUpload" style={uploadBtnSmall}>
            Upload Avatar
          </label>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div style={tabs}>
        {["profile", "identity", "media", "payments", "links"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              ...tabBtn,
              background: tab === t ? "#7c3aed" : "#222",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ================= IDENTITY ================= */}
{tab === "profile" && (
  <IdentitySection
    alias={alias}
    setAlias={setAlias}

    headline={headline}
    setHeadline={setHeadline}

    location={location}
    setLocation={setLocation}

    bio={bio}
    setBio={setBio}

    languages={languages}
    setLanguages={setLanguages}

    isAI={isAI}
    setIsAI={setIsAI}

    aiPersonality={aiPersonality}
    setAiPersonality={setAiPersonality}
  />
)}

      {/* ================= EXPRESSIONS ================= */}

{tab === "identity" && (
  <>
    <IntentSection
      intents={intents}
      setIntents={setIntents}
    />

    <div style={{ marginTop: 16 }}>
      <ExpressSection
        expressions={expressions}
        setExpressions={setExpressions}
      />
    </div>
  </>
)}

{/* ================= MEDIA ================= */}

{tab === "media" && (
  <div style={section}>

    <div style={mediaGrid}>
      {[0, 1, 2, 3, 4].map((index) => {
        const image = galleryUrls[index];

        return (
          <div key={index} style={mediaSlot}>
            {image ? (
              <img
                src={image}
                style={mediaImage}
                alt={`Gallery ${index + 1}`}
              />
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  id={`galleryUpload-${index}`}
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const file = e.target.files[0];

                    if (!file) return;

                    try {
                      const url = await uploadGallery(file, index);

                      if (url) {
                        setGalleryUrls((prev) => {
                          const updated = [...prev];
                          updated[index] = url;
                          return updated;
                        });
                      }
                    } catch (error) {
                      console.error("GALLERY UPLOAD ERROR:", error);
                      alert(error.message || "Gallery upload failed.");
                    }

                    e.target.value = "";
                  }}
                />

                <label
                  htmlFor={`galleryUpload-${index}`}
                  style={mediaAdd}
                >
                  <span style={mediaPlus}>+</span>
                  <span style={mediaAddText}>Add Photo</span>
                </label>
              </>
            )}
          </div>
        );
      })}
    </div>

    <p style={mediaCount}>
      {galleryUrls.filter(Boolean).length}/5 photos
    </p>

  </div>
)}

      {/* ================= MONETIZATION ================= */}
      {tab === "payments" && (
        <div style={section}>

          {/* PAYMENT OPTIONS */}
          <div style={paymentCard}>
            <h3 style={paymentTitle}>Payment Options</h3>
            <p style={paymentHelp}>
              Choose how you want people to pay or support you.
            </p>

            {/* FREE */}
            <div style={paymentMethodRow}>
              <div>
                <strong>Free</strong>
                <div style={mutedText}>
                  Offer calls without requiring payment.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    free: !prev.free
                  }))
                }
                style={toggleBtn(!!paymentSettings.free)}
              >
                {paymentSettings.free ? "ON" : "OFF"}
              </button>
            </div>

            {/* TIPS */}
            <div style={paymentMethodRow}>
              <div>
                <strong>Accept Tips</strong>
                <div style={mutedText}>
                  Let people support you with optional tips.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    acceptTips: !prev.acceptTips
                  }))
                }
                style={toggleBtn(!!paymentSettings.acceptTips)}
              >
                {paymentSettings.acceptTips ? "ON" : "OFF"}
              </button>
            </div>

            {/* PAYMENT REQUESTS */}
            <div style={paymentMethodRow}>
              <div>
                <strong>Request Payment</strong>
                <div style={mutedText}>
                  Allow payment requests for custom services.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    requestPayment: !prev.requestPayment
                  }))
                }
                style={toggleBtn(!!paymentSettings.requestPayment)}
              >
                {paymentSettings.requestPayment ? "ON" : "OFF"}
              </button>
            </div>
          </div>


          {/* RECEIVE PAYMENTS */}
          <div style={paymentCard}>
            <h3 style={paymentTitle}>Receive Payments</h3>
            <p style={paymentHelp}>
              Select the payment methods you want to accept.
            </p>

            {/* PAYPAL */}
            <div style={paymentMethodRow}>
              <div>
                <strong>PayPal</strong>
                <div style={mutedText}>
                  Receive payments through PayPal.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    enabled: prev.enabled.includes("paypal")
                      ? prev.enabled.filter(m => m !== "paypal")
                      : [...prev.enabled, "paypal"]
                  }))
                }
                style={toggleBtn(paymentSettings.enabled.includes("paypal"))}
              >
                {paymentSettings.enabled.includes("paypal") ? "ON" : "OFF"}
              </button>
            </div>

            {paymentSettings.enabled.includes("paypal") && (
              <input
                value={paypal}
                onChange={e => setPaypal(e.target.value)}
                style={input}
                placeholder="PayPal payment link"
              />
            )}


            {/* KO-FI */}
            <div style={paymentMethodRow}>
              <div>
                <strong>Ko-fi</strong>
                <div style={mutedText}>
                  Accept tips and payments through Ko-fi.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    enabled: prev.enabled.includes("kofi")
                      ? prev.enabled.filter(m => m !== "kofi")
                      : [...prev.enabled, "kofi"]
                  }))
                }
                style={toggleBtn(paymentSettings.enabled.includes("kofi"))}
              >
                {paymentSettings.enabled.includes("kofi") ? "ON" : "OFF"}
              </button>
            </div>


            {/* STRIPE */}
            <div style={paymentMethodRow}>
              <div>
                <strong>Card / Stripe</strong>
                <div style={mutedText}>
                  Accept card payments through Stripe.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    enabled: prev.enabled.includes("stripe")
                      ? prev.enabled.filter(m => m !== "stripe")
                      : [...prev.enabled, "stripe"]
                  }))
                }
                style={toggleBtn(paymentSettings.enabled.includes("stripe"))}
              >
                {paymentSettings.enabled.includes("stripe") ? "ON" : "OFF"}
              </button>
            </div>


            {/* USDT */}
            <div style={paymentMethodRow}>
              <div>
                <strong>USDT</strong>
                <div style={mutedText}>
                  Receive USDT directly to your wallet.
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    enabled: prev.enabled.includes("usdt")
                      ? prev.enabled.filter(m => m !== "usdt")
                      : [...prev.enabled, "usdt"]
                  }))
                }
                style={toggleBtn(paymentSettings.enabled.includes("usdt"))}
              >
                {paymentSettings.enabled.includes("usdt") ? "ON" : "OFF"}
              </button>
            </div>

            {paymentSettings.enabled.includes("usdt") && (
              <input
                value={crypto}
                onChange={e => setCrypto(e.target.value)}
                style={input}
                placeholder="USDT wallet address"
              />
            )}
          </div>


          {/* CALL RATES */}
          <div style={paymentCard}>
            <h3 style={paymentTitle}>Call Rates</h3>
            <p style={paymentHelp}>
              Set your availability, session length and rate.
            </p>

            {/* VOICE */}
            <div style={compactRateRow}>
              <div style={compactRateName}>
                <span style={compactRateIcon}>🎙</span>
                <strong>Voice</strong>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    voice: {
                      ...prev.voice,
                      enabled: !prev.voice.enabled
                    }
                  }))
                }
                style={toggleBtn(paymentSettings.voice.enabled)}
              >
                {paymentSettings.voice.enabled ? "ON" : "OFF"}
              </button>

              {paymentSettings.voice.enabled && (
                <>
                  <select
                    value={paymentSettings.voice.duration}
                    onChange={e =>
                      setPaymentSettings(prev => ({
                        ...prev,
                        voice: {
                          ...prev.voice,
                          duration: Number(e.target.value)
                        }
                      }))
                    }
                    style={compactRateSelect}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>

                  <div style={compactPriceWrap}>
                    <span>$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={paymentSettings.voice.price}
                      onChange={e =>
                        setPaymentSettings(prev => ({
                          ...prev,
                          voice: {
                            ...prev.voice,
                            price: e.target.value
                          }
                        }))
                      }
                      style={compactPriceInput}
                    />
                  </div>
                </>
              )}
            </div>


            {/* VIDEO */}
            <div style={compactRateRow}>
              <div style={compactRateName}>
                <span style={compactRateIcon}>🎥</span>
                <strong>Video</strong>
              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    video: {
                      ...prev.video,
                      enabled: !prev.video.enabled
                    }
                  }))
                }
                style={toggleBtn(paymentSettings.video.enabled)}
              >
                {paymentSettings.video.enabled ? "ON" : "OFF"}
              </button>

              {paymentSettings.video.enabled && (
                <>
                  <select
                    value={paymentSettings.video.duration}
                    onChange={e =>
                      setPaymentSettings(prev => ({
                        ...prev,
                        video: {
                          ...prev.video,
                          duration: Number(e.target.value)
                        }
                      }))
                    }
                    style={compactRateSelect}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>60 min</option>
                  </select>

                  <div style={compactPriceWrap}>
                    <span>$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={paymentSettings.video.price}
                      onChange={e =>
                        setPaymentSettings(prev => ({
                          ...prev,
                          video: {
                            ...prev.video,
                            price: e.target.value
                          }
                        }))
                      }
                      style={compactPriceInput}
                    />
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      )}
      {/* ================= LINKS ================= */}
      {tab === "links" && (
        <div style={section}>
          <input
            value={links.twitter}
            onChange={(e) =>
              setLinks({ ...links, twitter: e.target.value })
            }
            style={input}
            placeholder="Twitter"
          />
        </div>
      )}

      {/* ================= ACTIONS ================= */}
      <div style={actions}>
        <button onClick={saveProfile} style={saveBtn}>
          {loading ? "Saving..." : "Save Profile"}
        </button>

      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const wrap = {
  padding: 16,
  background: "#0b1220",
  minHeight: "100vh",
  color: "#fff",
};

const hero = {
  position: "relative",
  marginBottom: 50,
};

const bannerBox = {
  position: "relative",
  width: "100%",
  height: 200,
  overflow: "hidden",
  borderRadius: 14,
};

const banner = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const avatarWrap = {
  position: "absolute",
  bottom: 5,
  left: 24,

  zIndex: 10,
  textAlign: "left",
};

const avatar = {
  width: 120,
  height: 120,
  borderRadius: "50%",
  border: "4px solid #fff",
  objectFit: "cover",
  background: "#111",
};

const uploadBtn = {
  position: "absolute",
  bottom: 10,
  right: 10,
  padding: "6px 10px",
  borderRadius: 8,
  background: "#7c3aed",
  color: "#fff",
  fontSize: 12,
  cursor: "pointer",
  border: "none",
};

const uploadBtnSmall = {
  marginTop: 6,
  padding: "5px 8px",
  borderRadius: 6,
  background: "#333",
  color: "#fff",
  fontSize: 11,
  cursor: "pointer",
  border: "none",
};

const tabs = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 20,
};

const tabBtn = {
  padding: "6px 10px",
  borderRadius: 8,
  border: "none",
  color: "#fff",
  cursor: "pointer",
};

const section = {
  marginTop: 16,
};

const chip = {
  padding: "6px 10px",
  borderRadius: 999,
  border: "none",
  color: "#fff",
  marginRight: 6,
  marginTop: 6,
  cursor: "pointer",
};

const input = {
  width: "100%",
  marginTop: 10,
  padding: 10,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
};

const actions = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const paymentCard = {
  marginTop: 16,
  padding: 16,
  borderRadius: 14,
  background: "#111827",
  border: "1px solid #263244",
};

const paymentTitle = {
  margin: 0,
  fontSize: 18,
  fontWeight: 700,
};

const paymentHelp = {
  marginTop: 6,
  marginBottom: 14,
  color: "#9ca3af",
  fontSize: 13,
  lineHeight: 1.5,
};

const rateCard = {
  padding: 14,
  marginTop: 12,
  borderRadius: 12,
  background: "#0b1220",
  border: "1px solid #263244",
};

const rateHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const rateControls = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 12,
};

const fieldGroup = {
  minWidth: 0,
};

const fieldLabel = {
  display: "block",
  marginBottom: 5,
  fontSize: 12,
  color: "#9ca3af",
};

const paymentInput = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
  boxSizing: "border-box",
};


const selectInput = {
  width: "100%",
  padding: 10,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
};

const mutedText = {
  marginTop: 3,
  fontSize: 12,
  color: "#9ca3af",
};

const toggleBtn = (enabled) => ({
  minWidth: 52,
  padding: "7px 10px",
  borderRadius: 8,
  border: "none",
  background: enabled ? "#22c55e" : "#374151",
  color: "#fff",
  fontSize: 11,
  fontWeight: 700,
  cursor: "pointer",
});

const paymentMethodRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  padding: "13px 0",
  borderBottom: "1px solid #263244",
};
const saveBtn = {
  flex: 1,
  padding: 12,
  background: "#22c55e",
  border: "none",
  borderRadius: 10,
  color: "#fff",
  fontWeight: 700,
};

const compactRateRow = {
  display: "grid",
  gridTemplateColumns: "1fr auto 110px 90px",
  alignItems: "center",
  gap: 10,
  padding: "12px 0",
  borderBottom: "1px solid rgba(255,255,255,.07)",
};

const compactRateName = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  minWidth: 0,
};

const compactRateIcon = {
  fontSize: 18,
  width: 24,
  textAlign: "left",
};

const compactRateSelect = {
  width: "100%",
  padding: "8px 9px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(255,255,255,.06)",
  color: "#fff",
  fontSize: 12,
};

const compactPriceWrap = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  padding: "0 9px",
  height: 34,
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(255,255,255,.06)",
  color: "#aaa",
  fontSize: 12,
};

const compactPriceInput = {
  width: "100%",
  minWidth: 0,
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#fff",
  fontSize: 13,
  fontWeight: 600,
};
const logoutBtn = {
  flex: 1,
  padding: 12,
  background: "#ef4444",
  border: "none",
  borderRadius: 10,
  color: "#fff",
};

const logoutTopBtn = {
  padding: "7px 13px",
  borderRadius: 9,
  border: "1px solid rgba(239,68,68,0.6)",
  background: "rgba(239,68,68,0.12)",
  color: "#ef4444",
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const logoutRow = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 8,
  marginBottom: 8,
};
const imageThumb = {
  width: 90,
  height: 90,
  borderRadius: 12,
  objectFit: "cover",
  cursor: "pointer",
  flexShrink: 0,
};

const mediaGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(5, 1fr)",
  gap: 8,
  marginTop: 12,
};

const mediaSlot = {
  aspectRatio: "1 / 1",
  borderRadius: 12,
  overflow: "hidden",
  background: "#111",
  border: "1px solid #333",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const mediaImage = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const mediaAdd = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#aaa",
};

const mediaPlus = {
  fontSize: 30,
  lineHeight: 1,
  color: "#7c3aed",
  fontWeight: 300,
};

const mediaAddText = {
  fontSize: 11,
  marginTop: 6,
};

const mediaCount = {
  color: "#888",
  fontSize: 12,
  textAlign: "left",
  marginTop: 8,
  marginBottom: 0,
};































