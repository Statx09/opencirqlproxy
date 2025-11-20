import React, { useState } from "react";

export default function Onboarding() {
  const [name, setName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [link, setLink] = useState(""); // new link input
  const [avatarFile, setAvatarFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!name || !avatarFile) {
      setMessage("Name and avatar are required");
      return;
    }

    try {
      // Public URL for avatar (ensure bucket name is exactly 'Cirql')
      const avatarUrl = `https://pjllwvqutytxtskzxwka.supabase.co/storage/v1/object/public/Cirql/${avatarFile.name}`;

      // Call local Edge function
      const res = await fetch("http://localhost:8000", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, keywords, avatarUrl, link }),
      });

      const data = await res.json();
      console.log("Insert response:", data);

      if (data.error) throw new Error(data.error);

      setMessage("Host added successfully!");
      setName("");
      setKeywords("");
      setLink("");
      setAvatarFile(null);
    } catch (err) {
      console.error(err);
      setMessage("Upload failed: " + err.message);
    }
  };

  return (
    <div className="onboarding" style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "400px", margin: "0 auto" }}>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Keywords (comma separated)"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />
      <input
        type="text"
        placeholder="Link (optional)"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setAvatarFile(e.target.files[0])}
      />
      <button onClick={handleUpload} style={{ padding: "8px 16px", borderRadius: "6px", backgroundColor: "#4caf50", color: "#fff", border: "none" }}>
        Submit
      </button>
      <p>{message}</p>
    </div>
  );
}

