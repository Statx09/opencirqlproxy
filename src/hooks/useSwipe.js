import { useRef, useState, useCallback } from "react";

export function useSwipe({ onSwipeLeft, onSwipeRight }) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const startTime = useRef(0);
  const isDragging = useRef(false);
  const raf = useRef(null);

  const [dragX, setDragX] = useState(0);

  const getX = (e) =>
    e.touches ? e.touches[0].clientX : e.clientX;

  const handleStart = useCallback((e) => {
    isDragging.current = true;
    startX.current = getX(e);
    currentX.current = startX.current;
    startTime.current = performance.now();
  }, []);

  const handleMove = useCallback((e) => {
    if (!isDragging.current) return;

    const x = getX(e);
    currentX.current = x;

    const diff = x - startX.current;

    // 🔥 resistance curve (feels MUCH more natural)
    const resistance = 0.35;
    const damped = diff * resistance;

    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      setDragX(damped);
    });
  }, []);

  const handleEnd = useCallback(() => {
    if (!isDragging.current) return;

    isDragging.current = false;

    const diff = currentX.current - startX.current;
    const time = performance.now() - startTime.current;

    const velocity = diff / time; // swipe speed

    const threshold = 100;

    // reset first (feels snappier)
    setDragX(0);

    const fastSwipe = Math.abs(velocity) > 0.6;

    if (diff > threshold || fastSwipe) {
      onSwipeRight?.();
    } else if (diff < -threshold || fastSwipe) {
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