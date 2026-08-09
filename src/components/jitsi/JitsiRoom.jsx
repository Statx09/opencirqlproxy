import React, { useEffect, useRef } from "react";

export default function JitsiRoom({
  roomName,
  displayName = "OpenCall User",
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadJitsi = () =>
      new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const existing = document.getElementById("jitsi-api-script");

        if (existing) {
          existing.addEventListener("load", resolve);
          existing.addEventListener("error", reject);
          return;
        }

        const script = document.createElement("script");
        script.id = "jitsi-api-script";
        script.src = "https://meet.jit.si/external_api.js";
        script.async = true;

        script.onload = resolve;
        script.onerror = reject;

        document.body.appendChild(script);
      });

    async function init() {
      try {
        await loadJitsi();

        if (
          cancelled ||
          !containerRef.current ||
          !window.JitsiMeetExternalAPI
        ) {
          return;
        }

        apiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
          roomName,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",

          userInfo: {
            displayName,
          },

          configOverwrite: {
  prejoinConfig: {
    enabled: false,
  },

  startWithAudioMuted: false,
  startWithVideoMuted: false,

  disableDeepLinking: true,
  enableWelcomePage: false,
  enableInsecureRoomNameWarning: false,

  hideConferenceSubject: true,
},

          interfaceConfigOverwrite: {
            MOBILE_APP_PROMO: false,
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            SHOW_DEEP_LINKING_IMAGE: false,
          },
        });

        apiRef.current.addEventListener(
          "videoConferenceJoined",
          () => {
            console.log("✅ Joined OpenCall Studio");
          }
        );

        apiRef.current.addEventListener(
          "readyToClose",
          () => {
            console.log("Jitsi ready to close");
          }
        );
      } catch (error) {
        console.error("Jitsi initialization failed:", error);
      }
    }

    init();

    return () => {
      cancelled = true;

      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch (error) {
          console.error("Jitsi dispose error:", error);
        }

        apiRef.current = null;
      }
    };
  }, [roomName, displayName]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        background: "#000",
      }}
    />
  );
}
