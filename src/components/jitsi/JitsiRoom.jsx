import React, { useEffect, useRef } from "react";

export default function JitsiRoom({
  roomName,
  displayName = "Cirql User",
}) {
  const containerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const loadJitsi = () =>
      new Promise((resolve, reject) => {
        // Already loaded
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
      await loadJitsi();

      if (cancelled || !containerRef.current) return;

      const domain = "meet.jit.si";

      apiRef.current = new window.JitsiMeetExternalAPI(domain, {
        roomName,

        parentNode: containerRef.current,

        width: "100%",
        height: "100%",

        userInfo: {
          displayName,
        },

        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          disableDeepLinking: true,
        },

        interfaceConfigOverwrite: {
          MOBILE_APP_PROMO: false,
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
        },
      });

      apiRef.current.addEventListener(
        "videoConferenceJoined",
        () => {
          console.log("✅ Joined Jitsi room");
        }
      );

      apiRef.current.addEventListener(
        "readyToClose",
        () => {
          console.log("Room closed");
        }
      );
    }

    init();

    return () => {
      cancelled = true;

      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, displayName]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#000",
      }}
    />
  );
}