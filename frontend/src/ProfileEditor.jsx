// src/ProfileEditor.jsx
import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function ProfileEditor({ host, onClose }) {
  const [name, setName] = useState(host?.name || "");
  const [topics, setTopics] = useState(host?.topics || "");
  const [wallet, setWallet] = useState(host?.wallet || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const updates = {
        id: host.id,
        name,
        topics,
        wallet,
      };
      const { error } = await supabase.from("hosts").upsert(updates);
      if (error) throw error;
      onClose();
    } catch (err) {
      console.error("ProfileEditor save error", err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }}>
      <div style={{ width: 420, background: "#fff", padding: 20, borderRadius: 12 }}>
        <h3>Edit profile</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        <input value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Topics" style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Wallet / Payment address" style={{ width: "100%", padding: 8, marginBottom: 12 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, borderRadius: 8, background: "#e5e7eb", border: "none" }}>Cancel</button>
          <button onClick={save} disabled={saving} style={{ flex: 1, padding: 10, borderRadius: 8, background: "#22c55e", color: "#fff", border: "none" }}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
