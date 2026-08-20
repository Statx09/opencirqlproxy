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
  const [kofi, setKofi] = useState("");
  const [stripe, setStripe] = useState("");
  const [crypto, setCrypto] = useState("");
  const [cryptoNetwork, setCryptoNetwork] = useState("Solana");

  /* ================= PAYMENT SETTINGS ================= */
  const [paymentSettings, setPaymentSettings] = useState({
    currency: "USD",
    enabled: [],
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

  const savedPayments = profile.payment_methods || {};

  setPaypal(
    savedPayments.paypal ||
    profile.paypal_link ||
    ""
  );

  setKofi(
    savedPayments.kofi ||
    ""
  );

  setStripe(
    savedPayments.stripe ||
    ""
  );

  setCrypto(
    savedPayments.usdt ||
    profile.usdtwallet ||
    ""
  );

  setCryptoNetwork(
    savedPayments.usdtNetwork ||
    "Solana"
  );

  setPaymentSettings({
    currency: savedPayments.currency || "USD",
    enabled: Array.isArray(savedPayments.enabled)
      ? savedPayments.enabled
      : [],
  });
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
  payment_methods: {
    currency: paymentSettings.currency,

    paypal: paypal.trim(),
    kofi: kofi.trim(),
    stripe: stripe.trim(),

    usdt: crypto.trim(),
    usdtNetwork: cryptoNetwork,

    enabled: [
      ...(paypal.trim() ? ["paypal"] : []),
      ...(kofi.trim() ? ["kofi"] : []),
      ...(stripe.trim() ? ["stripe"] : []),
      ...(crypto.trim() ? ["usdt"] : []),
    ],
  },
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
        {["profile", "identity", "media", "payments"].map((t) => (
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
          <div style={paymentCard}>

            <div style={paymentHeader}>
              <h3 style={paymentTitle}>Payments</h3>

              <select
                value={paymentSettings.currency}
                onChange={e =>
                  setPaymentSettings(prev => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
                style={paymentCurrency}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="ZAR">ZAR</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="NZD">NZD</option>
              </select>
            </div>

            <div style={paymentMethods}>

              {/* PAYPAL */}
              <div style={paymentRow}>
                <div style={paymentName}>PayPal</div>

                <input
                  type="url"
                  value={paypal}
                  onChange={e => setPaypal(e.target.value)}
                  style={paymentInput}
                  placeholder="paypal.me/username"
                />
              </div>

              {/* KO-FI */}
              <div style={paymentRow}>
                <div style={paymentName}>Ko-fi</div>

                <input
                  type="url"
                  value={kofi}
                  onChange={e => setKofi(e.target.value)}
                  style={paymentInput}
                  placeholder="ko-fi.com/username"
                />
              </div>

              {/* STRIPE */}
              <div style={paymentRow}>
                <div style={paymentName}>Card / Stripe</div>

                <input
                  type="url"
                  value={stripe}
                  onChange={e => setStripe(e.target.value)}
                  style={paymentInput}
                  placeholder="Stripe Payment Link"
                />
              </div>

              {/* USDT */}
              <div style={{
                ...paymentRow,
                borderBottom: "none",
                paddingBottom: 2,
              }}>
                <div style={paymentName}>USDT</div>

                <div style={paymentUsdt}>
                  <input
                    value={crypto}
                    onChange={e => setCrypto(e.target.value)}
                    style={paymentInput}
                    placeholder="Wallet address"
                  />

                  <select
                    value={cryptoNetwork}
                    onChange={e => setCryptoNetwork(e.target.value)}
                    style={paymentNetwork}
                  >
                    <option value="Solana">Solana</option>
                    <option value="TRC20">TRC20</option>
                    <option value="ERC20">ERC20</option>
                    <option value="BEP20">BEP20</option>
                    <option value="Polygon">Polygon</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
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

const compactPaymentToggle = (active) => ({
  flex: 1,
  padding: "10px 8px",
  borderRadius: 10,
  border: "1px solid #263244",
  background: active ? "rgba(124,58,237,.18)" : "#111827",
  color: "#fff",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 6,
  fontSize: 13,
  fontWeight: 600,
});

const compactPaymentRow = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  padding: "10px 0",
  borderBottom: "1px solid #263244",
};

const compactPaymentStatus = {
  marginTop: 2,
  fontSize: 11,
  color: "#9ca3af",
};
const paymentHeader = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 4,
};

const paymentCurrency = {
  padding: "6px 28px 6px 8px",
  borderRadius: 8,
  border: "1px solid #263244",
  background: "#0b1220",
  color: "#fff",
  fontSize: 12,
  cursor: "pointer",
};

const paymentMethods = {
  marginTop: 10,
};

const paymentRow = {
  display: "grid",
  gridTemplateColumns: "110px minmax(0, 1fr)",
  alignItems: "center",
  gap: 12,
  padding: "10px 0",
  borderBottom: "1px solid #263244",
};

const paymentName = {
  fontSize: 13,
  fontWeight: 600,
  color: "#e5e7eb",
};

const paymentInput = {
  width: "100%",
  minWidth: 0,
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #263244",
  background: "#0b1220",
  color: "#fff",
  fontSize: 12,
  outline: "none",
  boxSizing: "border-box",
};

const paymentUsdt = {
  display: "flex",
  gap: 8,
  minWidth: 0,
};

const paymentNetwork = {
  flex: "0 0 105px",
  padding: "8px 6px",
  borderRadius: 8,
  border: "1px solid #263244",
  background: "#0b1220",
  color: "#fff",
  fontSize: 11,
  cursor: "pointer",
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














































