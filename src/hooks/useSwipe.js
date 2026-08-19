import { useRef, useState, useCallback } from "react";

export function useSwipe({ onSwipeLeft, onSwipeRight }) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const raf = useRef(null);

  const [dragX, setDragX] = useState(0);

  const getX = (e) => {
    if (e.touches && e.touches.length) {
      return e.touches[0].clientX;
    }

    return e.clientX;
  };

  const handleStart = useCallback((e) => {
    isDragging.current = true;

    const x = getX(e);

    startX.current = x;
    currentX.current = x;

    if (e.currentTarget?.setPointerCapture && e.pointerId != null) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {}
    }
  }, []);

  const handleMove = useCallback((e) => {
    if (!isDragging.current) return;

    const x = getX(e);
    currentX.current = x;

    const diff = x - startX.current;

    cancelAnimationFrame(raf.current);

    raf.current = requestAnimationFrame(() => {
      setDragX(diff);
    });
  }, []);

  const handleEnd = useCallback(
    (e) => {
      if (!isDragging.current) return;

      isDragging.current = false;

      const diff = currentX.current - startX.current;
      const distance = Math.abs(diff);

      cancelAnimationFrame(raf.current);

      /*
       * Keep the release decision simple:
       * - 80px is enough for a deliberate swipe
       * - direction always comes from the sign of diff
       */
      const threshold = 80;

      if (distance >= threshold) {
        if (diff < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }

      /*
       * Snap the card back immediately after the swipe decision.
       * LandingPage controls the short transition.
       */
      setDragX(0);

      if (
        e?.currentTarget?.releasePointerCapture &&
        e.pointerId != null
      ) {
        try {
          if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        } catch {}
      }
    },
    [onSwipeLeft, onSwipeRight]
  );

  return {
    handleStart,
    handleMove,
    handleEnd,
    dragX,
  };
}
