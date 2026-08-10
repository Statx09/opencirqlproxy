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

  const uniqueSelectedExpressions = [...new Set(selectedExpressions)];
const toggle = (value) => {
  console.log("=== EXPRESSION TOGGLE ===");
  console.log("Clicked value:", value);
  console.log("Selected expressions:", selectedExpressions);
  console.log(
    "Already selected:",
    selectedExpressions.includes(value)
  );

  if (selectedExpressions.includes(value)) {
    console.log("REMOVING:", value);

    setExpressions(
      selectedExpressions.filter((x) => x !== value)
    );

    return;
  }

  console.log("ADDING:", value);

  if (selectedExpressions.length >= MAX_EXPRESSIONS) {
    alert("You can select up to 10 identity icons.");
    return;
  }

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
          Selected ({uniqueSelectedExpressions.length})
        </div>

        {uniqueSelectedExpressions.length ? (
          <ExpressionBadges
          badges={uniqueSelectedExpressions}
          max={999}
          showLabels
          onRemove={toggle}
        />
        ) : (
          <div
            style={{
              opacity: 0.6,
            }}
          >
            Select a few expressions below to build your identity. These will appear on your profile and help people discover you.
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
          Browse Expressions
        </div>

        <ExpressionGrid
          selected={uniqueSelectedExpressions}
          search={search}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}


