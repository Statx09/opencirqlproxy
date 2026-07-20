import React, { useState } from "react";
import { styles } from "./profileStyles";

import ExpressionBadges from "../expressions/ExpressionBadges";
import ExpressionGrid from "../expressions/ExpressionGrid";

export default function ExpressSection({
  expressions: selectedExpressions,
  setExpressions,
}) {
  const [search, setSearch] = useState("");

  const MAX_EXPRESSIONS = 10;

const toggle = (value) => {
  // Remove if already selected
  if (selectedExpressions.includes(value)) {
    setExpressions(
      selectedExpressions.filter((x) => x !== value)
    );
    return;
  }

  // Prevent selecting more than 10
  if (selectedExpressions.length >= MAX_EXPRESSIONS) {
    alert("You can select up to 10 identity icons.");
    return;
  }

  // Add new selection
  setExpressions([...selectedExpressions, value]);
};

  return (
    <div style={styles.glass}>
      <div style={styles.sectionTitle}>
    Identity
</div>

      {/* Search */}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search expressions..."
        style={{
          width: "100%",
          padding: "12px 14px",
          marginBottom: 20,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,.08)",
          background: "rgba(255,255,255,.05)",
          color: "#fff",
          outline: "none",
          fontSize: 14,
        }}
      />

      {/* Selected */}

      <div
        style={{
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontWeight: 700,
            marginBottom: 12,
          }}
        >
          Selected ({selectedExpressions.length})
        </div>

        {selectedExpressions.length ? (
          <ExpressionBadges
            badges={selectedExpressions}
            max={999}
            showLabels
          />
        ) : (
          <div
            style={{
              opacity: 0.6,
            }}
          >
            No expressions selected yet.
          </div>
        )}
      </div>

      {/* Library */}

      <div>
        <div
          style={{
            marginBottom: 12,
            color: "#9ca3af",
            fontWeight: 600,
          }}
        >
          Expression Library
        </div>

        <ExpressionGrid
          selected={selectedExpressions}
          search={search}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}