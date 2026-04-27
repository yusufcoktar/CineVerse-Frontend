import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRipple } from './useRipple';
import type { AnimationVariant, ButtonVariant, ButtonSize } from '@/types/animation';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  animState?: AnimationVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-accent-red to-accent-purple text-white shadow-lg shadow-accent-red/20',
  secondary:
    'border border-white/10 bg-white/5 text-white backdrop-blur-sm hover:bg-white/10',
  ghost: 'text-text-secondary hover:bg-white/5 hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3 text-base rounded-xl gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', animState = 'idle', disabled, className, children, onClick, ...props }, ref) => {
    const reduce = useReducedMotion();
    const { ripples, addRipple } = useRipple();

    const isLoading = animState === 'loading';
    const isSuccess = animState === 'success';
    const isError = animState === 'error';
    const isDisabled = disabled || isLoading;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) return;
      addRipple(e);
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center overflow-hidden font-semibold transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary focus-visible:ring-dashed',
          variantClasses[variant],
          sizeClasses[size],
          isDisabled && 'cursor-not-allowed opacity-35',
          isSuccess && 'bg-green-600! from-green-600! to-green-600!',
          isError && 'bg-red-600! from-red-600! to-red-600!',
          className,
        )}
        whileHover={reduce || isDisabled ? undefined : { scale: 1.03, filter: 'brightness(1.1)' }}
        whileTap={reduce || isDisabled ? undefined : { scale: 0.96 }}
        animate={
          isError && !reduce
            ? { x: [0, -8, 8, -6, 6, -4, 4, 0] }
            : undefined
        }
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        disabled={isDisabled}
        onClick={handleClick}
        {...props}
      >
        {/* Ripples */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-white/35"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: ripple.size,
              height: ripple.size,
            }}
            initial={{ scale: 0, opacity: 0.35 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* Content */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.span
              key="spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </motion.span>
          ) : isSuccess ? (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-inherit"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
