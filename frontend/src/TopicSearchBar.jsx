import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient.js";

export default function TopicSearchBar({ value, onChange }) {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchTopics = async () => {
      const { data } = await supabase
        .from("topics")
        .select("name")
        .eq("is_active", true)
        .order("name", { ascending: true });
      setTopics(data || []);
    };
    fetchTopics();
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);

    if (val.trim() === "") {
      setFilteredTopics([]);
      setShowDropdown(false);
      return;
    }

    const filtered = topics
      .map((t) => t.name)
      .filter((t) => t.toLowerCase().includes(val.toLowerCase()));
    setFilteredTopics(filtered);
    setShowDropdown(filtered.length > 0);
  };

  const handleSelect = (topic) => {
    onChange(topic);
    setShowDropdown(false);
  };

  return (
    <div style={{ position: "relative", marginBottom: 12 }}>
      <input
        type="text"
        placeholder="Search by topic..."
        value={value}
        onChange={handleInputChange}
        onFocus={() => value && setShowDropdown(filteredTopics.length > 0)}
        style={{
          width: "100%",
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #ccc",
          fontSize: 16,
        }}
      />

      {showDropdown && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
            marginTop: 4,
            maxHeight: 200,
            overflowY: "auto",
            zIndex: 100,
            listStyle: "none",
            padding: 0,
          }}
        >
          {filteredTopics.map((topic, i) => (
            <li
              key={i}
              onClick={() => handleSelect(topic)}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                borderBottom: i < filteredTopics.length - 1 ? "1px solid #eee" : "none",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fdf4")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#fff")}
            >
              {topic}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
