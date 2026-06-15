import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

import { COUNTRIES } from "../lib/countries";
import { LANGUAGES } from "../lib/languages";

const INTENTS = [
  "Friendship",
  "Dating",
  "Business",
  "Networking",
  "Gaming",
  "Crypto",
  "Tech",
  "Music",
  "Travel",
  "Fitness",
  "Learning",
];

export default function ProfileTab({ user, onLogout }) {
  const [loading, setLoading] = useState(false);

  const [alias, setAlias] = useState("");
  const [bio, setBio] = useState("");

  const [language, setLanguage] = useState("");
  const [country, setCountry] = useState("");
  const [topics, setTopics] = useState("");

  const [gender, setGender] = useState("");

  const [intentTags, setIntentTags] = useState([]);

  const [usdtWallet, setUsdtWallet] = useState("");
  const [kofi, setKofi] = useState("");

  const [pushNotifications, setPushNotifications] = useState(true);

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);

  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");

  // gallery placeholders
  const [galleryFiles, setGalleryFiles] = useState([
    null,
    null,
    null,
    null,
    null,
  ]);

  const [galleryPreview, setGalleryPreview] = useState([
    "",
    "",
    "",
    "",
    "",
  ]);

  // ---------------- LOAD PROFILE ----------------
  useEffect(() => {
    if (!user?.id) return;

    async function loadProfile() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (!data) return;

      setAlias(data.alias || "");
      setBio(data.bio || "");

      setLanguage(data.language || "");
      setCountry(data.country || "");

      setTopics(
        Array.isArray(data.topics)
          ? data.topics.join(", ")
          : ""
      );

      setGender(data.gender || "");

      setIntentTags(data.intent_tags || []);

      setUsdtWallet(data.usdt_wallet || "");
      setKofi(data.kofi || "");

      setPushNotifications(data.push_notifications ?? true);

      setAvatarUrl(data.avatar_url || "");
      setBannerUrl(data.banner_url || "");

      // future gallery support
      if (Array.isArray(data.gallery_urls)) {
        setGalleryPreview([
          data.gallery_urls[0] || "",
          data.gallery_urls[1] || "",
          data.gallery_urls[2] || "",
          data.gallery_urls[3] || "",
          data.gallery_urls[4] || "",
        ]);
      }
    }

    loadProfile();
  }, [user]);

  // ---------------- INTENT TOGGLE ----------------
  const toggleIntent = (tag) => {
    setIntentTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : [...prev, tag]
    );
  };

  // ---------------- SAVE ----------------
  const saveProfile = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      let finalAvatar = avatarUrl;
      let finalBanner = bannerUrl;

      // ---------------- AVATAR ----------------
      if (avatarFile) {
        const path = `${user.id}/avatar-${Date.now()}`;

        await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true });

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        finalAvatar = data.publicUrl;
        setAvatarUrl(finalAvatar);
      }

      // ---------------- BANNER ----------------
      if (bannerFile) {
        const path = `${user.id}/banner-${Date.now()}`;

        await supabase.storage
          .from("banners")
          .upload(path, bannerFile, { upsert: true });

        const { data } = supabase.storage
          .from("banners")
          .getPublicUrl(path);

        finalBanner = data.publicUrl;
        setBannerUrl(finalBanner);
      }

      // ---------------- GALLERY ----------------
      const galleryUrls = [...galleryPreview];

      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];

        if (!file) continue;

        const path = `${user.id}/gallery-${i}-${Date.now()}`;

        await supabase.storage
          .from("avatars")
          .upload(path, file, { upsert: true });

        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        galleryUrls[i] = data.publicUrl;
      }

      // ---------------- PAYLOAD ----------------
      const payload = {
        user_id: user.id,

        alias,
        bio,

        avatar_url: finalAvatar,
        banner_url: finalBanner,

        language,
        country,
        gender,

        topics: topics
          .split(",")
          .map((x) => x.trim())
          .filter(Boolean),

        intent_tags: intentTags,

        usdt_wallet: usdtWallet,
        kofi,

        gallery_urls: galleryUrls,

        push_notifications: pushNotifications,

        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        console.error(error);
        alert("Failed to save profile");
      } else {
        if (onSaved) await onSaved();
        alert("Profile saved");
      }
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }

    setLoading(false);
  };

  // ---------------- LOGIN BLOCK ----------------
if (!user) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Please login first</h2>

      <button
        onClick={() =>
          supabase.auth.signInWithOAuth({ provider: "google" })
        }
      >
        Login / Sign Up
      </button>

      <button
        onClick={onLogout}
        style={{
          marginTop: 10,
          padding: "10px 14px",
          background: "#ef4444",
          color: "#fff",
          border: "none",
          borderRadius: 10,
          cursor: "pointer"
        }}
      >
        Logout
      </button>
    </div>
  );
}

  // ---------------- UI ----------------
  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 16,
        minHeight: "100vh",
      }}
    >
<button
  onClick={onLogout}
  style={{
    position: "fixed",
    top: 12,
    right: 12,
    padding: "10px 14px",
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    zIndex: 99999
  }}
>
  Logout
</button>
      {/* BANNER */}
      <div
        style={{
          position: "relative",
          height: 240,
          borderRadius: 20,
          overflow: "hidden",
          background: "#ddd",
          marginBottom: 80,
        }}
      >
        {bannerUrl && (
          <img
            src={bannerUrl}
            alt="banner"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* BANNER UPLOAD */}
        <input
          type="file"
          accept="image/*"
          id="banner-upload"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            setBannerFile(file);

            // instant preview
            setBannerUrl(URL.createObjectURL(file));
          }}
        />

        <label
          htmlFor="banner-upload"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "10px 14px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Upload Banner
        </label>

        {/* AVATAR */}
        <div
          style={{
            position: "absolute",
            left: 24,
            bottom: -8,
            width: 120,
            height: 120,
            borderRadius: "50%",
            overflow: "hidden",
            border: "5px solid white",
            background: "#eee",
          }}
        >
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </div>

        {/* AVATAR UPLOAD */}
        <input
          type="file"
          accept="image/*"
          id="avatar-upload"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            setAvatarFile(file);

            // instant preview
            setAvatarUrl(URL.createObjectURL(file));
          }}
        />

        <label
          htmlFor="avatar-upload"
          style={{
            position: "absolute",
            left: 160,
            bottom: -1,
            background: "#7c3aed",
            color: "#fff",
            padding: "8px 12px",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          Upload Avatar
        </label>
      </div>

      {/* FORM */}
      <div
        style={{
          background: "#fff",
          padding: 24,
          borderRadius: 20,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* ALIAS */}
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Alias"
          style={inputStyle}
        />

        {/* GENDER */}
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => setGender("Male")}
            style={{
              ...genderBtn,
              background:
                gender === "Male" ? "#7c3aed" : "#e5e7eb",
              color:
                gender === "Male" ? "#fff" : "#111",
            }}
          >
            Male
          </button>

          <button
            onClick={() => setGender("Female")}
            style={{
              ...genderBtn,
              background:
                gender === "Female" ? "#7c3aed" : "#e5e7eb",
              color:
                gender === "Female" ? "#fff" : "#111",
            }}
          >
            Female
          </button>
        </div>

        {/* COUNTRY */}
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Country</option>

          {COUNTRIES.map((c) => (
            <option
              key={c.name}
              value={c.name}
            >
              {c.flag} {c.name}
            </option>
          ))}
        </select>

        {/* LANGUAGE */}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={inputStyle}
        >
          <option value="">Select Language</option>

          {LANGUAGES.map((l) => (
            <option
              key={l.name}
              value={l.name}
            >
              {l.name}
            </option>
          ))}
        </select>

        {/* TOPICS */}
        <input
          value={topics}
          onChange={(e) => setTopics(e.target.value)}
          placeholder="Topics"
          style={inputStyle}
        />

        {/* INTENTS */}
        <div style={{ marginBottom: 20 }}>
          <h3>Intent Tags</h3>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {INTENTS.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleIntent(tag)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "none",
                  background: intentTags.includes(tag)
                    ? "#7c3aed"
                    : "#e5e7eb",
                  color: intentTags.includes(tag)
                    ? "#fff"
                    : "#111",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* BIO */}
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Bio"
          style={{
            ...inputStyle,
            minHeight: 120,
          }}
        />

        {/* WALLET */}
        <input
          value={usdtWallet}
          onChange={(e) =>
            setUsdtWallet(e.target.value)
          }
          placeholder="USDT Wallet Address"
          style={inputStyle}
        />

        {/* KOFI */}
        <input
          value={kofi}
          onChange={(e) => setKofi(e.target.value)}
          placeholder="Ko-fi Link / Wallet"
          style={inputStyle}
        />

        {/* GALLERY */}
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 12 }}>
            Gallery Uploads
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(100px, 1fr))",
              gap: 12,
            }}
          >
            {galleryPreview.map((preview, i) => (
              <label
                key={i}
                style={{
                  height: 100,
                  borderRadius: 16,
                  background: "#f3f4f6",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "2px dashed #d1d5db",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                }}
              >
                {preview ? (
                  <img
                    src={preview}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#6b7280",
                    }}
                  >
                    Upload
                  </span>
                )}

                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file =
                      e.target.files[0];

                    if (!file) return;

                    const updatedFiles = [
                      ...galleryFiles,
                    ];

                    const updatedPreview = [
                      ...galleryPreview,
                    ];

                    updatedFiles[i] = file;

                    updatedPreview[i] =
                      URL.createObjectURL(file);

                    setGalleryFiles(updatedFiles);
                    setGalleryPreview(updatedPreview);
                  }}
                />
              </label>
            ))}
          </div>
        </div>

        {/* SAVE */}
        <button
          onClick={saveProfile}
          disabled={loading}
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 14,
            background: "#7c3aed",
            color: "#fff",
            fontWeight: 700,
            border: "none",
          }}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 12,
  borderRadius: 12,
  border: "1px solid #ddd",
  marginBottom: 16,
};

const genderBtn = {
  flex: 1,
  border: "none",
  padding: "12px",
  borderRadius: 12,
  fontWeight: 700,
  cursor: "pointer",
};