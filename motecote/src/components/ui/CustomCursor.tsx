import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CURSOR_CONFIG: Record<string, { size: number; text: string; color: string }> = {
  film: { size: 44, text: 'İzle', color: 'var(--color-accent-purple)' },
  cart: { size: 44, text: 'Ekle', color: 'var(--color-accent-red)' },
  chat: { size: 44, text: 'Sor', color: '#2DD4BF' },
  link: { size: 32, text: '', color: 'var(--color-accent-red)' },
};

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [cursorType, setCursorType] = useState<string | null>(null);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springX = useSpring(cursorX, { stiffness: 500, damping: 40 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 40 });

  useEffect(() => {
    // Only render for fine pointer
    const mql = window.matchMedia('(pointer: fine)');
    if (!mql.matches) return;

    setVisible(true);

    const onMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = (e.target as HTMLElement).closest('[data-cursor]');
      setCursorType(target ? target.getAttribute('data-cursor') : null);
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [cursorX, cursorY]);

  if (!visible) return null;

  const config = cursorType ? CURSOR_CONFIG[cursorType] : null;
  const size = config?.size ?? 16;

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] flex items-center justify-center rounded-full"
      style={{
        x: springX,
        y: springY,
        width: size,
        height: size,
        translateX: '-50%',
        translateY: '-50%',
        backgroundColor: config ? config.color : 'rgba(255,255,255,0.8)',
        mixBlendMode: config ? 'normal' : 'difference',
      }}
      animate={{
        scale: cursorType === 'link' ? 1.5 : 1,
        opacity: cursorType ? 0.9 : 0.7,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {config?.text && (
        <span className="text-[10px] font-bold text-white">{config.text}</span>
      )}
    </motion.div>
  );
}
