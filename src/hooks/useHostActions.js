// src/hooks/useHostActions.js

import { useCallback } from "react";

export default function useHostActions({
  host,
  user,
  openMessageModal,
  openCallModal,
  openTipModal,
  sendHostEvent, // unified backend event sender
}) {
  // 👋 Wave (same system as like)
  const wave = useCallback(() => {
    if (!host || !user) return;

    sendHostEvent({
      type: "wave",
      from: user.id,
      to: host.id,
      payload: {
        message: `${user.name} waved at ${host.name}`,
      },
    });
  }, [host, user, sendHostEvent]);

  // ❤️ Like (same event system as wave)
  const like = useCallback(() => {
    if (!host || !user) return;

    sendHostEvent({
      type: "like",
      from: user.id,
      to: host.id,
      payload: {
        message: `${user.name} liked ${host.name}`,
      },
    });
  }, [host, user, sendHostEvent]);

  // 💬 Message
  const message = useCallback(() => {
    if (!host) return;
    openMessageModal?.(host);
  }, [host, openMessageModal]);

  // 📞 Call
  const call = useCallback(() => {
    if (!host) return;
    openCallModal?.(host);
  }, [host, openCallModal]);

  // 💰 Support / Tip
  const support = useCallback(() => {
    if (!host) return;
    openTipModal?.(host);
  }, [host, openTipModal]);

  return {
    wave,
    like,
    message,
    call,
    support,
  };
}