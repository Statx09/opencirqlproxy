import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient.js";

export default function TopicSuggestions({ onSelect }) {
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      const { data } = await supabase
        .from("topics")      // Your table must exist
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true });
      setTopics(data || []);
    };
    fetchTopics();
  }, []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
      {topics.map((topic) => (
        <button
          key={topic.id}
          onClick={() => onSelect(topic.name)}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            fontWeight: 600,
            backgroundColor: "#e5e7eb",
            color: "#111827",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#22c55e")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#e5e7eb")}
        >
          {topic.name}
        </button>
      ))}
    </div>
  );
}

