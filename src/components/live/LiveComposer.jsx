import React, { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";
import { Paperclip, Smile } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

console.log("NEW LIVE COMPOSER LOADED");

export default function LiveComposer({ onPost }) {

  const { theme } = useTheme();

  const [text, setText] = useState("");
  const [postType, setPostType] = useState("moment");
  const [topic, setTopic] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const imageInputRef = useRef(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);

  const textareaRef = useRef(null);

  const submit = async () => {
    if ((!text.trim() && !imageFile) || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await onPost?.({
        content: text.trim(),
        expression: null,
        post_type: postType,
        topic: topic.trim() || null,
        proposed_rate: postType === "call_request" && proposedRate !== "" ? Number(proposedRate) : null,
        imageFile,
      });
      if (result === false) return;
      setText("");
      setTopic("");
      setProposedRate("");
      setImageFile(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      setShowEmoji(false);
    } catch (error) {
      console.error("Feed post failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addEmoji = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
    setShowEmoji(false);
    setShowAttachmentMenu(false);
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
{postType !== "moment" && (
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What would you like to discuss?"
            style={{ margin: "0 12px 12px", padding: "10px", borderRadius: "8px" }}
          />
        )}

        {postType === "call_request" && (
          <input
            type="number"
            min="0.05"
            step="0.05"
            value={proposedRate}
            onChange={(e) => setProposedRate(e.target.value)}
            placeholder="Optional budget per minute ($)"
            style={{ margin: "0 12px 12px", padding: "10px", borderRadius: "8px" }}
          />
        )}

        <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={async (event) => {
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert("Please choose an image smaller than 10 MB.");
    return;
  }

  let bitmap = null;
  try {
    bitmap = await createImageBitmap(file, {
      resizeWidth: 1600,
      resizeQuality: "high",
    });

    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare image canvas.");

    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    bitmap = null;

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
    if (!blob) throw new Error("Image compression failed.");

    const baseName = file.name.replace(/\.[^.]+$/, "") || "feed-photo";
    const optimizedFile = new File([blob], `${baseName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(optimizedFile);
    setImagePreview(URL.createObjectURL(blob));
  } catch (error) {
    console.error("FEED IMAGE PREPARATION ERROR:", error);
    alert("This photo could not be prepared. Please try a smaller JPG or PNG.");
  } finally {
    bitmap?.close?.();
  }
}} />

{imagePreview && <img src={imagePreview} alt="Selected post preview"
  style={{ display: "block", width: "calc(100% - 24px)", maxHeight: 260, objectFit: "cover", borderRadius: 14, margin: "0 12px 12px" }} />}
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

          <div style={{ position: "relative", display: "inline-flex" }}>
  {showAttachmentMenu && (
    <div style={{
      position: "absolute", bottom: "calc(100% + 8px)", left: 0, zIndex: 30,
      display: "flex", flexDirection: "column", padding: 8,
      border: "1px solid " + theme.border, borderRadius: 12,
      background: theme.surface, boxShadow: "0 4px 18px rgba(0,0,0,.16)"
    }}>
      <button type="button" disabled={isSubmitting}
        onClick={() => {
          setShowAttachmentMenu(false);
          imageInputRef.current?.click();
        }}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          border: 0, borderRadius: 8, padding: "9px 12px",
          background: "transparent", color: theme.text,
          cursor: "pointer", whiteSpace: "nowrap"
        }}>
        <Paperclip size={16} /> Picture
      </button>
    </div>
  )}
  <button type="button" aria-label="Attachments" title="Attachments"
    disabled={isSubmitting}
    onClick={() => setShowAttachmentMenu((value) => !value)}
    style={{
      width: 40, height: 40, display: "inline-flex",
      alignItems: "center", justifyContent: "center",
      border: "1px solid " + theme.border, borderRadius: 10,
      background: "transparent", color: theme.text,
      cursor: "pointer", flexShrink: 0
    }}>
    <Paperclip size={18} />
  </button>
</div>
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
            <Smile size={18} />
          </button>
          <button
            type="button"
            onClick={submit} disabled={isSubmitting}
            style={postBtn}
          >
            Post
          </button>

        </div>

      </div>

      {showEmoji && (
        <div
          style={{
            ...emojiBox,
            width: 278,
            maxWidth: "calc(100vw - 32px)",
            padding: 8,
            boxSizing: "border-box",
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,.18)",
            zIndex: 40,
          }}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === "Escape") setShowEmoji(false);
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "2px 4px 8px",
            color: theme.text,
            fontSize: 12,
            fontWeight: 700,
          }}>
            <span>Emoji</span>
            <button
              type="button"
              aria-label="Close emoji picker"
              onClick={() => setShowEmoji(false)}
              style={{
                border: 0,
                borderRadius: 6,
                background: "transparent",
                color: theme.text,
                fontSize: 20,
                lineHeight: 1,
                padding: "2px 6px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
          <EmojiPicker
            onEmojiClick={addEmoji}
            theme={theme.mode === "dark" ? "dark" : "light"}
            width={260}
            height={280}
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
