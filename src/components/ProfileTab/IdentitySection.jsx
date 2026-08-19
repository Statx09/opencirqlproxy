import React from "react";
import CountrySelect from "./CountrySelect";
import LanguageSelect from "./LanguageSelect";

export default function IdentitySection({
  alias,
  setAlias,

  headline,
  setHeadline,

  location,
  setLocation,

  languages,
  setLanguages,
}) {
  return (
    <div style={section}>
      <div style={card}>
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          style={input}
          placeholder="Alias"
        />

        <input
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          style={input}
          placeholder="Headline"
        />

        <CountrySelect
          value={location}
          onChange={setLocation}
        />

        <div style={{ marginTop: 10 }}>
          <LanguageSelect
            value={languages}
            onChange={setLanguages}
          />
        </div>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const section = {
  marginTop: 16,
};

const card = {
  background: "rgba(255,255,255,.04)",
  border: "1px solid rgba(255,255,255,.08)",
  borderRadius: 16,
  padding: 16,
};

const intentSection = {
  marginTop: 18,
};

const intentTitle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#fff",
};

const intentHelp = {
  marginTop: 5,
  marginBottom: 10,
  fontSize: 12,
  color: "#9ca3af",
};

const intentGrid = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const intentButton = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,.1)",
  background: "rgba(255,255,255,.05)",
  color: "#fff",
  cursor: "pointer",
  fontSize: 12,
};

const intentButtonActive = {
  background: "rgba(124,58,237,.35)",
  border: "1px solid #7c3aed",
};

const input = {
  width: "100%",
  marginBottom: 10,
  padding: 10,
  borderRadius: 10,
  border: "1px solid #333",
  background: "#111",
  color: "#fff",
};
