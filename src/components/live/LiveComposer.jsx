import React, { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { useTheme } from "../../context/ThemeContext";

console.log("NEW LIVE COMPOSER LOADED");

export default function LiveComposer({ onPost }) {

  const { theme } = useTheme();

  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const textareaRef = useRef(null);

  const submit = () => {

    if (!text.trim()) return;

    onPost?.({
      content: text.trim(),
      expression: null,
    });

    setText("");
    setShowEmoji(false);
  };

  const addEmoji = (emojiData) => {

    setText((prev) =>
      prev + emojiData.emoji
    );

    textareaRef.current?.focus();
  };

  return (
    <div style={wrap}>

      <div
        style={{
          ...composerBox,
          background: theme.surface,
          border: `1px solid ${theme.border}`,
        }}
      >

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind?"
          style={{
            ...input,
            color: theme.text,
          }}
        />

        <div
          style={{
            ...toolbar,
            borderTop: `1px solid ${theme.border}`,
          }}
        >

          <button
            type="button"
            aria-label="Add emoji"
            onClick={() =>
              setShowEmoji((v) => !v)
            }
            style={{
              ...emojiButton,
              background: theme.background,
              border: `1px solid ${theme.border}`,
            }}
          >
            😊
          </button>

          <button
            type="button"
            onClick={submit}
            style={postBtn}
          >
            Post
          </button>

        </div>

      </div>

      {showEmoji && (
        <div style={emojiBox}>
          <EmojiPicker
            onEmojiClick={addEmoji}
            theme={theme.mode === "dark" ? "dark" : "light"}
            width={320}
            height={350}
          />
        </div>
      )}

    </div>
  );
}


/* ================= STYLES ================= */

const wrap = {
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const composerBox = {
  width: "100%",
  borderRadius: 10,
  overflow: "hidden",
  boxSizing: "border-box",
};

const input = {
  width: "100%",
  minHeight: 80,
  resize: "none",
  padding: 12,
  boxSizing: "border-box",
  border: "none",
  background: "transparent",
  outline: "none",
  fontSize: 15,
  fontFamily: "inherit",
};

const toolbar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  padding: 10,
};

const emojiButton = {
  width: 40,
  height: 40,
  borderRadius: 10,
  fontSize: 20,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const postBtn = {
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: "#7c3aed",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};

const emojiBox = {
  marginTop: 0,
  display: "flex",
  justifyContent: "flex-start",
};
