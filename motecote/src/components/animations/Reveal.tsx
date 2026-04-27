import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { DURATION, EASE_CINEMATIC } from '@/constants/animations';

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FadeUp({ children, delay = 0, className }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: DURATION.slow, ease: EASE_CINEMATIC, delay }}
    >
      {children}
    </motion.div>
  );
}

export function FadeLeft({ children, delay = 0, className }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, x: -36 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: DURATION.slow, ease: EASE_CINEMATIC, delay }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, delay = 0, className }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, scale: 0.88 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ type: 'spring', stiffness: 160, damping: 20, delay }}
    >
      {children}
    </motion.div>
  );
}
