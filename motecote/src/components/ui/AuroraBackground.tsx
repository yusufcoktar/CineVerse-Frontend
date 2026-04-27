import { motion, useReducedMotion } from 'framer-motion';

export default function AuroraBackground() {
  const reduce = useReducedMotion();
  const noMotion = { x: 0, y: 0, scale: 1 };

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Blob 1 — red */}
      <motion.div
        className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent-red/8 mix-blend-screen"
        style={{ filter: 'blur(100px)' }}
        animate={
          reduce
            ? noMotion
            : { x: [0, 60, -40, 0], y: [0, -80, 40, 0], scale: [1, 1.15, 0.9, 1] }
        }
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
      />
      {/* Blob 2 — purple */}
      <motion.div
        className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-accent-purple/6 mix-blend-screen"
        style={{ filter: 'blur(100px)' }}
        animate={
          reduce
            ? noMotion
            : { x: [0, -50, 30, 0], y: [0, 60, -50, 0], scale: [1, 0.95, 1.1, 1] }
        }
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      />
      {/* Blob 3 — gold */}
      <motion.div
        className="absolute bottom-1/4 left-1/2 h-64 w-64 rounded-full bg-accent-gold/4 mix-blend-screen"
        style={{ filter: 'blur(100px)' }}
        animate={
          reduce
            ? noMotion
            : { x: [0, 40, -60, 0], y: [0, -40, 60, 0], scale: [1, 1.08, 0.92, 1] }
        }
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}
