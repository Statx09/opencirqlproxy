import React, { useEffect, useRef } from "react";
import DailyIframe from "@daily-co/daily-js";

export default function DailyRoom({
  roomUrl = "https://cirqll.daily.co/cirqll",
  displayName = "OpenCall User",
}) {
  const containerRef = useRef(null);
  const callRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function initDaily() {
      try {
        if (!containerRef.current) return;

        const call = DailyIframe.createFrame(
          containerRef.current,
          {
            iframeStyle: {
              width: "100%",
              height: "100%",
              border: "0",
              background: "#000",
            },

            showLeaveButton: true,
            showPrejoinUI: false,
            showFullscreenButton: true,

            userName: displayName,
          }
        );

        callRef.current = call;

        await call.join({
          url: roomUrl,
          userName: displayName,
        });

        if (cancelled) {
          try {
            await call.leave();
          } catch {}

          try {
            call.destroy();
          } catch {}

          callRef.current = null;
        }
      } catch (error) {
        console.error("Daily initialization failed:", error);
      }
    }

    initDaily();

    return () => {
      cancelled = true;

      const call = callRef.current;

      if (call) {
        try {
          call.leave();
        } catch {}

        try {
          call.destroy();
        } catch {}

        callRef.current = null;
      }
    };
  }, [roomUrl, displayName]);

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

