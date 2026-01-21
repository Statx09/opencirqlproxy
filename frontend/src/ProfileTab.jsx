// src/ProfileTab.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function ProfileTab({ user, onLogin }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [location, setLocation] = useState("");
  const [age, setAge] = useState("");
  const [language, setLanguage] = useState("");
  const [usdtWallet, setUsdtWallet] = useState("");
  const [kofi, setKofi] = useState("");
  const [stripe, setStripe] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setName(data.name || "");
        setAvatarUrl(data.avatar_url || "");
        setLocation(data.location || "");
        setAge(data.age || "");
        setLanguage(data.language || "");
        setUsdtWallet(data.usdt_wallet || "");
        setKofi(data.kofi || "");
        setStripe(data.stripe || "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const uploadAvatar = (file) => {
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarUrl(url); // preview only
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const updates = {
        email,
        name,
        location,
        age,
        language,
        usdt_wallet: usdtWallet,
        kofi,
        stripe,
        avatar_url: avatarUrl, // preview until saved to bucket
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates, { onConflict: ["email"] });

      if (error) throw error;
      setMessage("Profile saved successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: 16 }}>
        <p>Please login to view your profile.</p>
        <button
          onClick={onLogin}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#3b82f6",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Login / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 16 }}>Profile</h2>

      {/* Avatar */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            backgroundColor: "#e5e7eb",
            display: "inline-block",
            overflow: "hidden",
          }}
        >
          {avatarUrl && (
            <img
              src={avatarUrl}
              alt="Avatar Preview"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
        <div style={{ marginTop: 8 }}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files[0] && uploadAvatar(e.target.files[0])}
          />
        </div>
      </div>

      {/* Email + Change Email Button */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ flex: 1, padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
        <button
          onClick={saveProfile}
          style={{
            padding: "8px 12px",
            borderRadius: 4,
            border: "none",
            backgroundColor: "#3b82f6",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Change Email
        </button>
      </div>

      {/* Name */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      {/* Location */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      {/* Age */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      {/* Language */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          placeholder="Language"
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      {/* Tip Info */}
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontStyle: "italic", color: "#6b7280" }}>
          Users won't receive tips if no payment info is provided.
        </p>
      </div>

      {/* Payment Info */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={usdtWallet}
          onChange={(e) => setUsdtWallet(e.target.value)}
          placeholder="USDT Wallet"
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={kofi}
          onChange={(e) => setKofi(e.target.value)}
          placeholder="Ko-fi"
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={stripe}
          onChange={(e) => setStripe(e.target.value)}
          placeholder="Stripe"
          style={{ width: "100%", padding: 8, borderRadius: 4, border: "1px solid #ccc" }}
        />
      </div>

      {/* Save Button */}
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button
          onClick={saveProfile}
          disabled={loading}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#22c55e",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </div>

      {message && <p style={{ textAlign: "center", marginTop: 8 }}>{message}</p>}
    </div>
  );
}
