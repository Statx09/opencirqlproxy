import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import useProfile from "../../hooks/useProfile";
import ExpressSection from "./ExpressSection";
import IdentitySection from "./IdentitySection";

export default function ProfileTab({ user, onLogout }) {
  const [tab, setTab] = useState("identity");
  const [loading, setLoading] = useState(false);

  const {
    profile,
    loading: profileLoading,
    updateProfile,
    uploadAvatar,
    uploadBanner,
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

  /* ================= EXPRESSIONS ================= */
 
const [expressions, setExpressions] = useState([]);

  /* ================= MONETIZATION ================= */
  const [paypal, setPaypal] = useState("");
  const [crypto, setCrypto] = useState("");

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

setExpressions(profile.expression_badges || []);

  setPaypal(profile.paypal_link || "");
  setCrypto(profile.usdtwallet || "");

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

  /* Expressions */
expression_badges: expressions,

  /* Monetization */
  paypal_link: paypal,
  usdtwallet: crypto,

  /* Links */
  social_links: [links],

  updated_at: new Date().toISOString(),
};

    const { error } = await supabase
  .from("profiles")
  .update(payload)
  .eq("user_id", user.id);

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
  <ExpressSection
    expressions={expressions}
    setExpressions={setExpressions}
  />
)}

{/* ================= MEDIA ================= */}

{tab === "media" && (
  <div style={section}>
    <p style={{ color: "#aaa" }}>Media uploads coming next</p>
  </div>
)}

      {/* ================= MONETIZATION ================= */}
      {tab === "payments" && (
        <div style={section}>
          <input
            value={paypal}
            onChange={(e) => setPaypal(e.target.value)}
            style={input}
            placeholder="PayPal"
          />

          <input
            value={crypto}
            onChange={(e) => setCrypto(e.target.value)}
            style={input}
            placeholder="Crypto wallet"
          />
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

        {onLogout && (
          <button onClick={onLogout} style={logoutBtn}>
            Logout
          </button>
        )}
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
  bottom: -30,
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 10,
  textAlign: "center",
};

const avatar = {
  width: 95,
  height: 95,
  borderRadius: "50%",
  border: "3px solid #fff",
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

const saveBtn = {
  flex: 1,
  padding: 12,
  background: "#22c55e",
  border: "none",
  borderRadius: 10,
  color: "#fff",
  fontWeight: 700,
};

const logoutBtn = {
  flex: 1,
  padding: 12,
  background: "#ef4444",
  border: "none",
  borderRadius: 10,
  color: "#fff",
};