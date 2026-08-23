
import React, { useState } from "react";
import { SlidersHorizontal } from "lucide-react";

export default function TopicSearchBar({
  value,
  onChange,
  filter = "all",
  onFilterChange,
}) {
  const [open, setOpen] = useState(false);

  const filters = [
    { id: "all", label: "All" },
    { id: "social", label: "Social" },
    { id: "networking", label: "Networking" },
    { id: "dating", label: "Dating" },
    { id: "professionals", label: "Professionals" },
    { id: "hire_me", label: "Hire Me" },
    { id: "recruiting", label: "Recruiting" },
    { id: "services", label: "Services" },
    { id: "consulting", label: "Consulting" },
    { id: "make_money", label: "Make Money" },
    { id: "investments", label: "Investments" },
    { id: "opportunities", label: "Opportunities" },
    { id: "collaboration", label: "Collaboration" },
    { id: "support", label: "Support" },
    { id: "languages", label: "Languages" },
    { id: "entertainment", label: "Entertainment" },
    { id: "podcasting", label: "Podcasting" },
    { id: "promotion", label: "Promotion" },
  ];

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search topics..."
          style={{
            width: "100%",
            height: 42,
            padding: "0 50px 0 14px",
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,.25)",
            background: "rgba(255,255,255,.06)",
            color: "inherit",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            position: "absolute",
            right: 6,
            top: 5,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,.12)",
            background: "rgba(255,255,255,.07)",
            color: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <SlidersHorizontal size={16} />
        </button>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            right: 0,
            width: 180,
            background: "#111827",
            borderRadius: 12,
            padding: 8,
            border: "1px solid rgba(255,255,255,.1)",
            zIndex: 9999,
            boxShadow: "0 12px 30px rgba(0,0,0,.3)",
          }}
        >
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                onFilterChange?.(f.id);
                setOpen(false);
              }}
              style={{
                width: "100%",
                padding: "9px 10px",
                textAlign: "left",
                background:
                  filter === f.id
                    ? "rgba(124,58,237,.3)"
                    : "transparent",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}



