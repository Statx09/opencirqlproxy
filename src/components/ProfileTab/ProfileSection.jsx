import React from "react";
import { styles } from "./profileStyles";

export default function ProfileSection({
  alias,
  setAlias,
  bio,
  setBio,
  headline,
  setHeadline,
  country,
  setCountry,
  languages,
  setLanguages,
  topics,
  setTopics,
}) {
  return (
    <div style={styles.glass}>

      <div style={styles.sectionTitle}>
        Profile
      </div>

      {/* ALIAS */}
      <input
        style={styles.input}
        placeholder="Alias (display name)"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
      />

      {/* HEADLINE */}
      <input
        style={styles.input}
        placeholder="Headline (what you do / vibe)"
        value={headline}
        onChange={(e) => setHeadline(e.target.value)}
      />

      {/* BIO */}
      <textarea
        style={styles.textarea}
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      {/* COUNTRY */}
      <input
        style={styles.input}
        placeholder="Country (e.g. ZA, US, GB)"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />

      {/* LANGUAGES */}
      <input
        style={styles.input}
        placeholder="Languages (comma separated)"
        value={languages}
        onChange={(e) => setLanguages(e.target.value)}
      />

      {/* TOPICS */}
      <input
        style={styles.input}
        placeholder="Topics (crypto, AI, gaming...)"
        value={topics}
        onChange={(e) => setTopics(e.target.value)}
      />

    </div>
  );
}