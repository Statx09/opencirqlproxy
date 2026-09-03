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

    if (selected.length >= MAX_INTENTS) return;

    setIntents([...selected, value]);
  };

  return (
    <div style={{ ...styles.glass, marginTop: 8 }}>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 4,
        }}
      >
        How do you want to connect?
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#9ca3af",
          marginBottom: 14,
        }}
      >
        Choose up to 5 intentions.
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 9,
        }}
      >
        {INTENTS.map((intent) => {
          const active = selected.includes(intent.id);
          const disabled = selected.length >= MAX_INTENTS && !active;

          return (
            <button
              key={intent.id}
              type="button"
              onClick={() => toggle(intent.id)}
              disabled={disabled}
              style={{
                minHeight: 42,
                padding: "9px 14px",
                borderRadius: 999,
                border: active
                  ? "1px solid #7c3aed"
                  : "1px solid rgba(255,255,255,.12)",
                background: active
                  ? "rgba(124,58,237,.30)"
                  : "rgba(255,255,255,.05)",
                color: "#fff",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                transition: "all .18s ease",
              }}
            >
              {active ? "✓ " : ""}
              {intent.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 12,
          color: selected.length >= MAX_INTENTS
            ? "#c4b5fd"
            : "#777",
        }}
      >
        {selected.length}/{MAX_INTENTS} selected
        {selected.length >= MAX_INTENTS && " · Maximum reached"}
      </div>
    </div>
  );
}

