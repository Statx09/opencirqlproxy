import React, { useState, useRef } from "react";
import EmojiPicker from "emoji-picker-react";

console.log("NEW LIVE COMPOSER LOADED");

export default function LiveComposer({ onPost }) {

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

      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e)=>setText(e.target.value)}
        placeholder="What's on your mind?"
        style={input}
      />


      <div style={toolbar}>

        <button
          style={emojiButton}
          onClick={() => 
            setShowEmoji((v)=>!v)
          }
        >
          😊
        </button>


        <button
          onClick={submit}
          style={postBtn}
        >
          Post
        </button>

      </div>


      {showEmoji && (
        <div style={emojiBox}>
          <EmojiPicker
            onEmojiClick={addEmoji}
            theme="dark"
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
  display:"flex",
  flexDirection:"column",
  gap:12,
};


const input = {

  width:"100%",

  minHeight:80,

  resize:"none",

  padding:14,

  borderRadius:18,

  border:
    "1px solid rgba(255,255,255,.1)",

  background:
    "rgba(255,255,255,.06)",

  color:"#fff",

  outline:"none",

  fontSize:15,

  backdropFilter:
    "blur(18px)",
};


const toolbar = {

  display:"flex",

  justifyContent:"space-between",

  alignItems:"center",

};


const emojiButton = {

  width:46,

  height:46,

  borderRadius:"50%",

  border:
    "1px solid rgba(255,255,255,.12)",

  background:
    "rgba(255,255,255,.08)",

  fontSize:22,

  cursor:"pointer",

  color:"#fff",

};


const postBtn = {

  padding:
    "10px 24px",

  borderRadius:999,

  border:
    "1px solid rgba(255,255,255,.12)",

  background:
    "rgba(255,255,255,.08)",

  color:"#fff",

  fontWeight:700,

  cursor:"pointer",

};


const emojiBox = {

  marginTop:10,

};
