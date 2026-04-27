import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Star, Clock, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Film } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { use3DTilt } from '@/hooks/use3DTilt';

interface FilmCardProps {
  film: Film;
  size?: 'sm' | 'md' | 'lg';
}

// Stagger item variant — used by parent containers
export const filmCardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function FilmCard({ film, size = 'md' }: FilmCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleCartDrawer = useUIStore((s) => s.toggleCartDrawer);
  const [hovered, setHovered] = useState(false);
  const reduce = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const { ref: cardRef, springX, springY, handleMouseMove, handleMouseLeave: tiltLeave } = use3DTilt({ maxRotate: 12 });

  const onMouseLeave = () => {
    setHovered(false);
    tiltLeave();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!reduce && !isMobile) handleMouseMove(e);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(film);
    toggleCartDrawer();
  };

  const sizeClasses = {
    sm: 'w-36 md:w-44',
    md: 'w-44 md:w-52',
    lg: 'w-56 md:w-64',
  };

  return (
    <Link to={`/film/${film.id}`}>
      <motion.div
        ref={cardRef}
        className={`${sizeClasses[size]} group relative flex-shrink-0 cursor-pointer`}
        style={{
          perspective: 800,
          transformStyle: 'preserve-3d',
          rotateX: reduce || isMobile ? 0 : springX,
          rotateY: reduce || isMobile ? 0 : springY,
        }}
        variants={filmCardVariants}
        onMouseEnter={() => setHovered(true)}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {/* Animated gradient border on hover */}

        {/* Poster */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 z-10 rounded-xl"
                style={{
                  background: 'conic-gradient(from 0deg, var(--color-accent-red), var(--color-accent-purple), var(--color-accent-gold), var(--color-accent-red))',
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                  padding: 2,
                }}
              />
            )}
          </AnimatePresence>
          <motion.img
            src={film.poster}
            alt={film.title}
            className="h-full w-full object-cover"
            whileHover={reduce ? undefined : { scale: 1.07 }}
            transition={{ duration: 0.5 }}
            loading="lazy"
            layoutId={`film-poster-${film.id}`}
          />
          {/* 3D glossy highlight following mouse */}
          <div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 55%)`,
            }}
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <div className="w-full p-3">
              <button
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-red px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-red/90"
              >
                <ShoppingCart size={16} />
                Sepete Ekle
              </button>
            </div>
          </div>
          {/* Discount badge */}
          {film.discountPrice && (
            <div className="absolute left-2 top-2 rounded-lg bg-accent-red px-2 py-1 text-xs font-bold text-white">
              %{Math.round(((film.price - film.discountPrice) / film.price) * 100)} İndirim
            </div>
          )}
          {/* Genre badge */}
          <div className="absolute right-2 top-2 rounded-lg bg-accent-purple/80 px-2 py-1 text-xs text-white backdrop-blur-sm">
            {film.genres[0]}
          </div>
        </div>

        {/* Info */}
        <div className="mt-2 space-y-1">
          <h3 className="truncate text-sm font-semibold text-text-primary">{film.title}</h3>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Star size={12} className="fill-accent-gold text-accent-gold" />
              {film.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {film.duration} dk
            </span>
          </div>
          <div className="flex items-center gap-2">
            {film.discountPrice ? (
              <>
                <span className="font-mono text-sm font-bold text-accent-red">
                  {film.discountPrice.toFixed(2)} ₺
                </span>
                <span className="font-mono text-xs text-text-muted line-through">
                  {film.price.toFixed(2)} ₺
                </span>
              </>
            ) : (
              <span className="font-mono text-sm font-bold text-text-primary">
                {film.price.toFixed(2)} ₺
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
