import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Play, Star, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Film } from '@/types';

interface MovieSeriesCardProps {
  title: string;
  movies: Film[];
}

export function MovieSeriesCard({ title, movies }: MovieSeriesCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Filmleri tarihe göre sırala (eskiden yeniye)
  const sortedMovies = [...movies].sort((a, b) => a.year - b.year);
  const activeMovie = sortedMovies[activeIndex];

  const navigate = (dir: number) => {
    setActiveIndex((prev) => {
      const next = prev + dir;
      if (next < 0) return sortedMovies.length - 1;
      if (next >= sortedMovies.length) return 0;
      return next;
    });
  };

  return (
    <div className="relative bg-white/[0.02] rounded-2xl border border-white/10 overflow-hidden">
      {/* Section Title */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <div className="w-1 h-4 rounded-full bg-accent-gold" />
        <h2 className="text-sm font-bold text-text-primary">{title}</h2>
        <span className="text-xs text-text-muted ml-auto">
          {activeIndex + 1}/{sortedMovies.length}
        </span>
      </div>

      {/* Main Content */}
      <div
        className="relative px-4 pb-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Cards Stack Container */}
        <div className="relative flex gap-3">
          {/* Stacked Cards - sola doğru stack */}
          <div className="relative w-[140px] h-[210px] flex-shrink-0 ml-6">
            {sortedMovies.map((movie, index) => {
              const isActive = index === activeIndex;
              const offset = index - activeIndex;

              // Sadece aktif ve sonraki 2 kartı göster
              if (offset < 0 || offset > 2) return null;

              return (
                <motion.div
                  key={movie.id}
                  className="absolute inset-0 cursor-pointer"
                  initial={false}
                  animate={{
                    x: offset * -12,
                    y: offset * 6,
                    scale: 1 - offset * 0.05,
                    zIndex: 30 - offset * 10,
                    opacity: 1 - offset * 0.25,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 35,
                  }}
                  onClick={() => !isActive && setActiveIndex(index)}
                >
                  <motion.div
                    className={`relative w-full h-full rounded-xl overflow-hidden border-2 ${
                      isActive ? 'border-accent-gold/60' : 'border-border/20'
                    }`}
                    animate={{
                      scale: isActive && isHovered ? 1.03 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    style={{
                      boxShadow: isActive
                        ? '0 20px 40px -10px rgba(0, 0, 0, 0.7)'
                        : '0 10px 20px -5px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Hover Overlay - sadece aktif kartta */}
                    <AnimatePresence>
                      {isActive && isHovered && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center justify-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Link to={`/film/${movie.id}`}>
                            <motion.button
                              className="w-12 h-12 rounded-full bg-accent-gold flex items-center justify-center"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Play className="w-5 h-5 text-bg-primary fill-bg-primary ml-0.5" />
                            </motion.button>
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Rating Badge */}
                    {isActive && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm">
                        <Star className="w-3 h-3 text-accent-gold fill-accent-gold" />
                        <span className="text-xs font-semibold text-white">{movie.rating}</span>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          {/* Movie Info - Her zaman görünür, hover'da genişler */}
          <div className="flex-1 min-w-0 flex flex-col justify-center py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMovie.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-sm font-bold text-text-primary line-clamp-2 leading-tight mb-1">
                  {activeMovie.title}
                </h3>

                <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                  <Calendar className="w-3 h-3" />
                  <span>{activeMovie.year}</span>
                </div>

                {/* Description - Her zaman görünür */}
                <p className="text-xs text-text-secondary/80 line-clamp-3 leading-relaxed">
                  {activeMovie.description}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        {sortedMovies.length > 1 && (
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-1">
              {sortedMovies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === activeIndex
                      ? 'bg-accent-gold w-4'
                      : 'bg-text-muted/30 hover:bg-text-muted/50'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-1">
              <motion.button
                onClick={() => navigate(-1)}
                className="p-1.5 rounded-full bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                onClick={() => navigate(1)}
                className="p-1.5 rounded-full bg-bg-secondary/60 hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
