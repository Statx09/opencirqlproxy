// src/FloatingToggle.jsx
import React, { useState, useRef, useEffect } from "react";
import { supabase } from "./supabaseClient";

export default function FloatingToggle({ user }) {
  const [online, setOnline] = useState(true);
  const [position, setPosition] = useState({ bottom: 40, right: 40 });
  const toggleRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  // -----------------------------
  // Initialize from Supabase
  // -----------------------------
  useEffect(() => {
    if (!user) return;
    async function fetchStatus() {
      const { data, error } = await supabase
        .from("hosts")
        .select("islive")
        .eq("id", user.id)
        .single();
      if (!error && data) setOnline(data.islive);
    }
    fetchStatus();
  }, [user]);

  // -----------------------------
  // Handle dragging
  // -----------------------------
  const handleMouseDown = (e) => {
    setDragging(true);
    const rect = toggleRef.current.getBoundingClientRect();
    offset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPosition({
        bottom: window.innerHeight - (e.clientY - offset.current.y),
        right: window.innerWidth - (e.clientX - offset.current.x),
      });
    }
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  // -----------------------------
  // Toggle online/offline
  // -----------------------------
  const toggleOnline = async () => {
    setOnline(!online);
    if (user) {
      try {
        await supabase
          .from("hosts")
          .update({ islive: !online })
          .eq("id", user.id);
      } catch (err) {
        console.error("Error updating status:", err);
      }
    }
  };

  return (
    <div
      ref={toggleRef}
      onMouseDown={handleMouseDown}
      onClick={toggleOnline}
      style={{
        position: "fixed",
        bottom: position.bottom,
        right: position.right,
        zIndex: 1000,
        width: 50,
        height: 50,
        borderRadius: "50%",
        backgroundColor: online ? "#22c55e" : "#ef4444",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        userSelect: "none",
        transition: "background-color 0.2s, transform 0.2s",
      }}
      title={online ? "ONLINE - click to go offline" : "OFFLINE - click to go online"}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          backgroundColor: "#fff",
        }}
      ></span>
    </div>
  );
}
