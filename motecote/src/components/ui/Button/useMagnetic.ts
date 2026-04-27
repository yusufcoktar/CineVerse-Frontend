import { useRef, useCallback } from 'react';
import { animate } from 'framer-motion';
import { SPRING_GENTLE } from '@/constants/animations';

export function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement>(null);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) * strength;
      const y = (e.clientY - centerY) * strength;
      animate(ref.current, { x, y }, { duration: 0.2 });
    },
    [strength],
  );

  const onMouseLeave = useCallback(() => {
    if (!ref.current) return;
    animate(ref.current, { x: 0, y: 0 }, SPRING_GENTLE);
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}
