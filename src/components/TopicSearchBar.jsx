import React from "react";

export default function TopicSearchBar({ value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <input
        type="text"
        placeholder="Search topics..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1px solid #ddd",
          fontSize: 16,
        }}
      />
    </div>
  );
}
