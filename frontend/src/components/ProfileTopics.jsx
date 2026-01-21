import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function ProfileTopics({ user, onUpdate }) {
  const [topics, setTopics] = useState([]);
  const [selectedTopics, setSelectedTopics] = useState(user?.topics || []);

  useEffect(() => {
    const fetchTopics = async () => {
      const { data } = await supabase
        .from("topics")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      setTopics(data || []);
    };
    fetchTopics();
  }, []);

  const toggleTopic = (name) => {
    setSelectedTopics((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );
  };

  const saveTopics = async () => {
    if (!user) return;
    await supabase.from("users").update({ topics: selectedTopics }).eq("id", user.id);
    if (onUpdate) onUpdate(selectedTopics);
  };

  return (
    <div>
      <h3 style={{ marginBottom: 8 }}>Select your topics</h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {topics.map((t) => (
          <button
            key={t.id}
            onClick={() => toggleTopic(t.name)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
              backgroundColor: selectedTopics.includes(t.name) ? "#22c55e" : "#e5e7eb",
              color: selectedTopics.includes(t.name) ? "#fff" : "#111827",
              transition: "all 0.2s",
            }}
          >
            {t.name}
          </button>
        ))}
      </div>
      <button
        onClick={saveTopics}
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
        Save Topics
      </button>
    </div>
  );
}
