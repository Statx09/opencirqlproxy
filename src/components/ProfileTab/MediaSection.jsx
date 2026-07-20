import React, { useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { styles } from "./profileStyles";

export default function MediaSection({
  user,
  bannerUrl,
  setBannerUrl,
  avatarUrl,
  setAvatarUrl,
}) {
  const bannerRef = useRef(null);
  const avatarRef = useRef(null);

  /* ================= UPLOAD HELPERS ================= */

  const uploadFile = async (file, pathPrefix) => {
    if (!file || !user?.id) return null;

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;

    const { error } = await supabase.storage
      .from("profile-media")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.error(error);
      return null;
    }

    const { data } = supabase.storage
      .from("profile-media")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  /* ================= HANDLERS ================= */

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, "banners");
    if (url) setBannerUrl(url);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = await uploadFile(file, "avatars");
    if (url) setAvatarUrl(url);
  };

  return (
    <div style={styles.glass}>

      <div style={styles.sectionTitle}>
        Media
      </div>

      {/* ================= BANNER ================= */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 140,
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 12,
          cursor: "pointer",
          background: "#1f2937",
        }}
        onClick={() => bannerRef.current.click()}
      >
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="banner"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div style={{
            color: "#9ca3af",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}>
            Click to upload banner
          </div>
        )}

        <input
          ref={bannerRef}
          type="file"
          accept="image/*"
          onChange={handleBannerChange}
          style={{ display: "none" }}
        />
      </div>

      {/* ================= AVATAR ================= */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          onClick={() => avatarRef.current.click()}
          style={{
            width: 70,
            height: 70,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#111827",
            cursor: "pointer",
            border: "2px solid rgba(255,255,255,0.1)",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{
              color: "#9ca3af",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
            }}>
              Upload
            </div>
          )}
        </div>

        <div style={{ color: "#9ca3af", fontSize: 13 }}>
          Click avatar to upload profile image
        </div>

        <input
          ref={avatarRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: "none" }}
        />
      </div>

    </div>
  );
}