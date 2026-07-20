import { useRef, useState, useCallback } from "react";

export function useSwipe({ onSwipeLeft, onSwipeRight }) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);
  const raf = useRef(null);

  const [dragX, setDragX] = useState(0);

  const getX = (e) =>
    e.touches ? e.touches[0].clientX : e.clientX;

  const handleStart = useCallback((e) => {
    isDragging.current = true;
    startX.current = getX(e);
    currentX.current = startX.current;
  }, []);

  const handleMove = useCallback((e) => {
    if (!isDragging.current) return;

    const x = getX(e);
    currentX.current = x;

    const diff = x - startX.current;

    const resistance = 0.3;

    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      setDragX(diff * resistance);
    });
  }, []);

  const handleEnd = useCallback(() => {
    if (!isDragging.current) return;

    isDragging.current = false;

    const diff = currentX.current - startX.current;

    const threshold = 120;

    setDragX(0);

    const isFast = Math.abs(diff) > 250;

    if (diff > threshold || isFast) {
      onSwipeRight?.();
    } else if (diff < -threshold || isFast) {
      onSwipeLeft?.();
    }
  }, [onSwipeLeft, onSwipeRight]);

  return {
    handleStart,
    handleMove,
    handleEnd,
    dragX,
  };
}