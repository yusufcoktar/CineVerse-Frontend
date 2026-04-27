import { useMemo } from 'react';
import { motion } from 'framer-motion';

const charVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

export function useSplitText(text: string) {
  const chars = useMemo(
    () =>
      text.split('').map((char, i) => (
        <motion.span
          key={`${char}-${i}`}
          variants={charVariants}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char}
        </motion.span>
      )),
    [text],
  );

  return chars;
}
