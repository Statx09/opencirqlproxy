import React, { useEffect } from "react";
import { supabase } from "./lib/supabaseClient";

export default function AuthCallback() {
  useEffect(() => {
    const handleAuth = async () => {
      try {
        // This processes the OAuth response from Google
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
        }

        // Optional: log user for debugging
        console.log("OAuth session:", data?.session);

        // Redirect back into your app safely
        window.location.href = "/";
      } catch (err) {
        console.error("Callback failure:", err);
        window.location.href = "/";
      }
    };

    handleAuth();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        background: "#0b1220",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <h2>Signing you in...</h2>
      <p>Please wait</p>
    </div>
  );
}