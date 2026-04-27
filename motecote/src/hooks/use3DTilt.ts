import { useRef, useCallback } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';

interface Use3DTiltOptions {
  maxRotate?: number;
  perspective?: number;
}

export function use3DTilt({ maxRotate = 12, perspective: _perspective = 800 }: Use3DTiltOptions = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 20 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      rotateX.set((y - 0.5) * -maxRotate);
      rotateY.set((x - 0.5) * maxRotate);
    },
    [maxRotate, rotateX, rotateY],
  );

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  return { ref, springX, springY, handleMouseMove, handleMouseLeave };
}
