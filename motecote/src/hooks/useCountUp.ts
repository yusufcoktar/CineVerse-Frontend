import { useEffect, useRef, useState } from 'react';
import { useMotionValue, useInView, animate } from 'framer-motion';

export function useCountUp(target: number, duration = 1.5) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, target, {
      duration,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target, duration, motionVal]);

  return { ref, display };
}
