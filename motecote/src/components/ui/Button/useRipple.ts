import { useState, useCallback } from 'react';

export interface RippleState {
  x: number;
  y: number;
  size: number;
  id: number;
}

let rippleCounter = 0;

export function useRipple() {
  const [ripples, setRipples] = useState<RippleState[]>([]);

  const addRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const id = ++rippleCounter;
    setRipples((prev) => [...prev, { x, y, size, id }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 600);
  }, []);

  return { ripples, addRipple };
}
