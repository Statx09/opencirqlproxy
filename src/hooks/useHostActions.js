import { useCallback } from "react";

export default function useHostActions({
  host,
  user,
  openMessageModal,
  openCallModal,
  openTipModal,
  sendHostEvent,
}) {
  const hostId = host?.id || host?.user_id;
  const userId = user?.id;

  /* ================= 👋 WAVE ================= */
  const wave = useCallback(() => {
    if (!hostId || !userId) return;

    try {
      sendHostEvent?.({
        type: "wave",
        from: userId,
        to: hostId,
        payload: {
          message: "wave",
        },
      });
    } catch (err) {
      console.log("wave failed", err);
    }
  }, [hostId, userId, sendHostEvent]);

  /* ================= ❤️ LIKE ================= */
  const like = useCallback(() => {
    if (!hostId || !userId) return;

    try {
      sendHostEvent?.({
        type: "like",
        from: userId,
        to: hostId,
        payload: {
          message: "like",
        },
      });
    } catch (err) {
      console.log("like failed", err);
    }
  }, [hostId, userId, sendHostEvent]);

  /* ================= 💬 MESSAGE ================= */
  const message = useCallback(() => {
    if (!host) return;
    openMessageModal?.(host);
  }, [host?.id, openMessageModal]);

  /* ================= 📞 CALL ================= */
  const call = useCallback(() => {
    if (!host) return;
    openCallModal?.(host);
  }, [host?.id, openCallModal]);

  /* ================= 💰 SUPPORT ================= */
  const support = useCallback(() => {
    if (!host) return;
    openTipModal?.(host);
  }, [host?.id, openTipModal]);

  return {
    wave,
    like,
    message,
    call,
    support,
  };
}