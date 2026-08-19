import React from "react";
import { styles } from "./profileStyles";

const INTENTS = [
  { id: "social", label: "Social" },
  { id: "dating", label: "Dating" },
  { id: "networking", label: "Networking" },
  { id: "services", label: "Services" },
  { id: "collaboration", label: "Collaboration" },
  { id: "community", label: "Community" },
  { id: "support", label: "Support" },
  { id: "promotion", label: "Promotion" },
  { id: "entertainment", label: "Entertainment" },
  { id: "opportunities", label: "Opportunities" },
];

const MAX_INTENTS = 5;

export default function IntentSection({
  intents = [],
  setIntents,
}) {
  const selected = Array.isArray(intents) ? intents : [];

  const toggle = (value) => {
    if (selected.includes(value)) {
      setIntents(selected.filter((item) => item !== value));
      return;
    }

    if (selected.length >= MAX_INTENTS) {
      return;
    }

    setIntents([...selected, value]);
  };

  return (
    <div style={styles.glass}>
<div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 10,
          marginTop: 14,
        }}
      >
        {INTENTS.map((intent) => {
          const active = selected.includes(intent.id);

          return (
            <button
              key={intent.id}
              type="button"
              onClick={() => toggle(intent.id)}
              style={{
                width: "100%",
                minHeight: 42,
                padding: "9px 6px",
                borderRadius: 12,
                border: active
                  ? "1px solid #7c3aed"
                  : "1px solid rgba(255,255,255,.10)",
                background: active
                  ? "rgba(124,58,237,.28)"
                  : "rgba(255,255,255,.05)",
                color: "#fff",
                cursor: selected.length >= MAX_INTENTS && !active
                  ? "not-allowed"
                  : "pointer",
                opacity:
                  selected.length >= MAX_INTENTS && !active
                    ? 0.45
                    : 1,
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                transition: "all .18s ease",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {intent.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          color: "#777",
          textAlign: "right",
        }}
      >
        {selected.length}/5
      </div>

    </div>
  );
}

