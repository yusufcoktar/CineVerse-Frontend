import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { DURATION, EASE_CINEMATIC } from '@/constants/animations';

const variants = {
  initial: { opacity: 0, y: 14 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.97 },
};

export default function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
      transition={{ duration: DURATION.normal, ease: EASE_CINEMATIC }}
    >
      {children}
    </motion.div>
  );
}
