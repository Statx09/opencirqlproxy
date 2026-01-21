// src/Onboarding.jsx
import React, { useState } from "react";
import { supabase } from "./supabaseClient"; // make sure your client is configured

export default function Onboarding() {
  const [name, setName] = useState("");
  const [topics, setTopics] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAvatarChange = (e) => {
    if (e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!name || !topics || !avatarFile) {
        setMessage("Please fill in all fields and select an avatar.");
        setLoading(false);
        return;
      }

      // Upload avatar
      const fileName = `${Date.now()}_${avatarFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("Cirql")
        .upload(fileName, avatarFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData, error: urlError } = supabase.storage
        .from("Cirql")
        .getPublicUrl(fileName);

      if (urlError) throw urlError;

      const avatarUrl = urlData.publicUrl;

      // Generate unique Jitsi link
      const jitsiRoomName = `cirql_${Date.now()}`;
      const jitsiLink = `https://meet.jit.si/${jitsiRoomName}`;

      // Insert host profile
      const { error: insertError } = await supabase.from("hosts").insert([
        {
          name,
          topics,
          avatar: avatarUrl,
          link: jitsiLink,
          islive: false,
        },
      ]);

      if (insertError) throw insertError;

      setMessage("Profile created successfully!");
      setName("");
      setTopics("");
      setAvatarFile(null);
    } catch (err) {
      console.error("Error creating profile:", err);
      setMessage(`Error creating profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "20px auto", padding: 16, background: "#fff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <h2>Create Host Profile</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Topics</label>
          <input
            type="text"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Avatar</label>
          <input type="file" accept="image/*" onChange={handleAvatarChange} />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: 10,
            backgroundColor: "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {loading ? "Creating..." : "Create Profile"}
        </button>
      </form>
      {message && <p style={{ marginTop: 12, color: message.startsWith("Error") ? "red" : "green" }}>{message}</p>}
    </div>
  );
}

