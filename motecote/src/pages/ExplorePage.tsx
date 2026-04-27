import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { moods, genres } from '@/data/mockData';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useFilmStore } from '@/store/filmStore';
import confetti from 'canvas-confetti';

/* ---- Mood confetti configs (ZIP tasarımından) ---- */
const moodConfigs: Record<string, {
  gradient: string; accent: string; glow: string;
  confettiColors: string[]; confettiType: 'burst' | 'rain' | 'explosion' | 'gentle' | 'leaves' | 'stars';
}> = {
  'Mutlu': {
    gradient: 'from-amber-500 via-yellow-400 to-orange-400', accent: 'text-amber-400', glow: 'shadow-amber-500/50',
    confettiColors: ['#FFD93D', '#FF8C00', '#FFE066', '#FFF176'], confettiType: 'burst',
  },
  'Duygusal': {
    gradient: 'from-violet-600 via-purple-500 to-fuchsia-500', accent: 'text-violet-400', glow: 'shadow-violet-500/50',
    confettiColors: ['#7C3AED', '#A855F7', '#C084FC', '#E879F9'], confettiType: 'rain',
  },
  'Heyecanlı': {
    gradient: 'from-orange-500 via-red-500 to-amber-500', accent: 'text-orange-400', glow: 'shadow-orange-500/50',
    confettiColors: ['#F97316', '#EF4444', '#FBBF24', '#FB923C'], confettiType: 'explosion',
  },
  'Düşünceli': {
    gradient: 'from-sky-500 via-cyan-500 to-blue-500', accent: 'text-cyan-400', glow: 'shadow-cyan-500/50',
    confettiColors: ['#0EA5E9', '#06B6D4', '#38BDF8', '#67E8F9'], confettiType: 'gentle',
  },
  'Rahat': {
    gradient: 'from-emerald-500 via-green-500 to-teal-500', accent: 'text-emerald-400', glow: 'shadow-emerald-500/50',
    confettiColors: ['#10B981', '#34D399', '#6EE7B7', '#A7F3D0'], confettiType: 'leaves',
  },
  'Maceracı': {
    gradient: 'from-pink-500 via-rose-500 to-red-500', accent: 'text-pink-400', glow: 'shadow-rose-500/50',
    confettiColors: ['#EC4899', '#F43F5E', '#FB7185', '#FBBF24'], confettiType: 'stars',
  },
};

function triggerConfetti(
  type: 'burst' | 'rain' | 'explosion' | 'gentle' | 'leaves' | 'stars',
  colors: string[],
  originX: number,
  originY: number,
) {
  const origin = { x: originX, y: originY };

  switch (type) {
    case 'burst':
      confetti({ particleCount: 80, spread: 70, origin, colors, startVelocity: 45, gravity: 1.2, scalar: 1.2, shapes: ['circle', 'square'] });
      break;

    case 'rain': {
      const end = Date.now() + 1500;
      const defaults = { startVelocity: 15, spread: 360, ticks: 60, zIndex: 9999, colors };
      const iv = setInterval(() => {
        if (Date.now() > end) return clearInterval(iv);
        confetti({ ...defaults, particleCount: 3, origin: { x: Math.random(), y: Math.random() * 0.3 }, gravity: 0.8, scalar: 0.8 });
      }, 50);
      break;
    }

    case 'explosion': {
      const count = 200;
      const def = { origin, colors, ticks: 100, gravity: 1.5, decay: 0.94, startVelocity: 30 };
      const fire = (r: number, o: confetti.Options) => confetti({ ...def, particleCount: Math.floor(count * r), ...o });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
      break;
    }

    case 'gentle':
      confetti({ particleCount: 50, spread: 100, origin, colors, startVelocity: 20, gravity: 0.5, scalar: 1, drift: 1, ticks: 200 });
      break;

    case 'leaves':
      confetti({ particleCount: 40, spread: 180, origin, colors, startVelocity: 15, gravity: 0.4, scalar: 1.5, drift: 2, ticks: 300, shapes: ['circle'] });
      break;

    case 'stars': {
      const sd = { spread: 360, ticks: 100, gravity: 0, decay: 0.94, startVelocity: 20, colors };
      const shoot = () => {
        confetti({ ...sd, particleCount: 30, scalar: 1.2, shapes: ['star'], origin: { x: originX, y: originY - 0.1 } });
        confetti({ ...sd, particleCount: 20, scalar: 0.75, shapes: ['circle'], origin });
      };
      shoot();
      setTimeout(shoot, 100);
      setTimeout(shoot, 200);
      break;
    }
  }
}

export default function ExplorePage() {
  const [searchParams] = useSearchParams();
  const initialGenre = searchParams.get('genre') || '';
  const allFilms = useFilmStore((s) => s.films);

  // URL'deki q parametresi değiştiğinde memoize et — useEffect+setState anti-pattern'ından kaçın
  const activeSearchText = searchParams.get('q') || '';

  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialGenre ? [initialGenre] : []
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [minRating, setMinRating] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const filteredFilms = useMemo(() => {
    let films = [...allFilms];

    if (activeSearchText.trim()) {
      const lower = activeSearchText.toLowerCase();
      films = films.filter(
        (f) =>
          f.title.toLowerCase().includes(lower) ||
          f.originalTitle?.toLowerCase().includes(lower) ||
          f.director?.toLowerCase().includes(lower) ||
          f.cast?.some((c) => c.toLowerCase().includes(lower))
      );
    }

    if (selectedMood) {
      const mood = moods.find((m) => m.label === selectedMood);
      if (mood) {
        films = films.filter((f) =>
          f.genres.some((g) => mood.genres.includes(g))
        );
      }
    }

    if (selectedGenres.length > 0) {
      films = films.filter((f) =>
        f.genres.some((g) => selectedGenres.includes(g))
      );
    }

    films = films.filter((f) => {
      const price = f.discountPrice ?? f.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (minRating > 0) {
      films = films.filter((f) => f.rating >= minRating);
    }

    return films;
  }, [allFilms, activeSearchText, selectedGenres, priceRange, minRating, selectedMood]);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const newFilms = allFilms.slice(8, 16);
  const addItem = useCartStore((s) => s.addItem);
  const toggleCartDrawer = useUIStore((s) => s.toggleCartDrawer);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sonsuz kayan carousel efekti
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let animId: number;
    let pos = 0;
    const speed = 0.5; // piksel/frame

    const step = () => {
      pos += speed;
      // Yarısına ulaştığında başa sar (duplicated content)
      if (pos >= el.scrollWidth / 2) {
        pos = 0;
      }
      el.scrollLeft = pos;
      animId = requestAnimationFrame(step);
    };
    animId = requestAnimationFrame(step);

    const pause = () => cancelAnimationFrame(animId);
    const resume = () => { animId = requestAnimationFrame(step); };
    el.addEventListener('mouseenter', pause);
    el.addEventListener('mouseleave', resume);

    return () => {
      cancelAnimationFrame(animId);
      el.removeEventListener('mouseenter', pause);
      el.removeEventListener('mouseleave', resume);
    };
  }, []);

  // Duplicate films for seamless loop
  const carouselFilms = [...newFilms, ...newFilms];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-10">
      {/* Yeni Eklenenler — Sonsuz Kayan Carousel */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <Sparkles className="text-accent-gold" size={24} />
          <h2 className="font-heading text-2xl text-accent-gold">Yeni Eklenenler</h2>
        </div>
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-hidden"
        >
          {carouselFilms.map((film, i) => (
            <Link
              key={`${film.id}-${i}`}
              to={`/film/${film.id}`}
              className="group relative block w-[calc(50%-12px)] flex-shrink-0"
            >
              <div className="relative h-48 overflow-hidden rounded-2xl">
                <img
                  src={film.backdrop}
                  alt={film.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    {film.genres.slice(0, 2).map((g) => (
                      <span key={g} className="rounded-full bg-accent-purple/30 px-2 py-0.5 text-[10px] text-accent-purple backdrop-blur-sm">{g}</span>
                    ))}
                  </div>
                  <h3 className="text-sm font-bold text-white">{film.title}</h3>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-text-secondary">
                    <span className="text-accent-gold">⭐ {film.rating}</span>
                    <span>{film.year}</span>
                  </div>
                </div>
                {film.discountPrice && (
                  <div className="absolute right-3 top-3 rounded-lg bg-accent-red px-2.5 py-1 text-xs font-bold text-white">
                    %{Math.round(((film.price - film.discountPrice) / film.price) * 100)}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Mood Section - ZIP Design Style with Glow Ring + Confetti */}
      <section>
        <h2 className="mb-3 text-2xl font-bold text-white">Ruh haline göre keşfet</h2>
        <div className="flex flex-wrap gap-4">
          {moods.map((mood, i) => {
            const config = moodConfigs[mood.label] || moodConfigs['Mutlu'];
            const isActive = selectedMood === mood.label;
            return (
              <MoodButton
                key={mood.label}
                emoji={mood.emoji}
                label={mood.label}
                gradient={config.gradient}
                glow={config.glow}
                confettiColors={config.confettiColors}
                confettiType={config.confettiType}
                isSelected={isActive}
                onClick={() => setSelectedMood(isActive ? null : mood.label)}
                delay={i * 0.06}
              />
            );
          })}
        </div>
      </section>

      {/* Filter + Grid */}
      <div className="flex gap-6">
        {/* Filter Panel */}
        <aside className={`w-64 flex-shrink-0 space-y-6 ${filterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="sticky top-20 space-y-6 rounded-xl bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">Filtreler</h3>
              <button
                onClick={() => {
                  setSelectedGenres([]);
                  setPriceRange([0, 100]);
                  setMinRating(0);
                  setSelectedMood(null);
                }}
                className="text-xs text-accent-red hover:underline"
              >
                Temizle
              </button>
            </div>

            {/* Genre Filter */}
            <div>
              <h4 className="mb-2 text-sm text-text-secondary">Tür</h4>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g.name}
                    onClick={() => toggleGenre(g.name)}
                    className={`rounded-lg px-3 py-1 text-xs transition-colors ${
                      selectedGenres.includes(g.name)
                        ? 'bg-accent-purple text-white'
                        : 'bg-white/5 text-text-secondary hover:bg-white/10'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h4 className="mb-2 text-sm text-text-secondary">
                Fiyat: {priceRange[0]}₺ - {priceRange[1]}₺
              </h4>
              <input
                type="range"
                min={0}
                max={100}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full accent-accent-red"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <h4 className="mb-2 text-sm text-text-secondary">Min. Puan: {minRating}</h4>
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full accent-accent-gold"
              />
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-text-secondary">{filteredFilms.length} film bulundu</p>
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-text-secondary lg:hidden"
            >
              {filterOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
              Filtreler
            </button>
          </div>

          {filteredFilms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-lg text-text-muted">Filtrelere uygun film bulunamadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filteredFilms.map((film, i) => (
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.6), duration: 0.35 }}
                  whileHover={{
                    scale: 1.05,
                    y: -6,
                    zIndex: 20,
                    transition: { type: 'spring', stiffness: 300, damping: 22 },
                  }}
                  className="relative"
                >
                  <Link to={`/film/${film.id}`} className="group block transition-transform duration-300 ease-out [transform-style:preserve-3d]">
                    <div className="relative flex h-52 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-xl hover:shadow-accent-purple/10">
                      {/* Sol Yarı — Poster + Bilgi */}
                      <div className="relative flex w-1/2 flex-shrink-0">
                        <img
                          src={film.poster}
                          alt={film.title}
                          className="h-full w-28 flex-shrink-0 object-cover"
                          loading="lazy"
                        />
                        <div className="flex flex-1 flex-col justify-between p-3">
                          <div>
                            <h3 className="line-clamp-2 text-sm font-bold text-white">{film.title}</h3>
                            <p className="mt-1 text-xs text-text-secondary">{film.year} • {film.duration} dk</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {film.genres.slice(0, 2).map((g) => (
                                <span key={g} className="rounded bg-accent-purple/20 px-1.5 py-0.5 text-[10px] text-accent-purple">{g}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-accent-gold">⭐ {film.rating}</span>
                            </div>
                            <div>
                              {film.discountPrice ? (
                                <span className="font-mono text-xs font-bold text-accent-red">{film.discountPrice.toFixed(2)} ₺</span>
                              ) : (
                                <span className="font-mono text-xs font-bold text-white">{film.price.toFixed(2)} ₺</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              addItem(film);
                              toggleCartDrawer();
                            }}
                            className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent-red/90 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-red"
                          >
                            Sepete Ekle
                          </button>
                        </div>
                      </div>

                      {/* Sağ Yarı — Metin Odaklı Özet */}
                      <div className="relative flex w-1/2 flex-col justify-between border-l border-white/10 bg-white/[0.02] p-3">
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent-gold/90">Film Özeti</p>
                          <p className="line-clamp-5 text-xs leading-relaxed text-text-secondary">
                            {film.description}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/10 pt-2">
                          <span className="text-[11px] text-text-muted">{film.language} • {film.country}</span>
                          {film.discountPrice && (
                            <span className="rounded-lg bg-accent-red px-2 py-0.5 text-[10px] font-bold text-white">
                              %{Math.round(((film.price - film.discountPrice) / film.price) * 100)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---- MoodButton: ZIP tasarımındaki confetti animasyonlarıyla ---- */
interface MoodButtonProps {
  emoji: string;
  label: string;
  gradient: string;
  glow: string;
  confettiColors: string[];
  confettiType: 'burst' | 'rain' | 'explosion' | 'gentle' | 'leaves' | 'stars';
  isSelected: boolean;
  onClick: () => void;
  delay: number;
}

function MoodButton({ emoji, label, gradient, glow, confettiColors, confettiType, isSelected, onClick, delay }: MoodButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isActive = isHovered || isSelected;

  const handleClick = useCallback(
    (_e: React.MouseEvent) => {
      if (!buttonRef.current) return;
      // Sadece seçilmemiş durumda confetti patlat
      if (!isSelected) {
        const rect = buttonRef.current.getBoundingClientRect();
        const originX = (rect.left + rect.width / 2) / window.innerWidth;
        const originY = (rect.top + rect.height / 2) / window.innerHeight;
        triggerConfetti(confettiType, confettiColors, originX, originY);
      }
      onClick();
    },
    [confettiType, confettiColors, onClick, isSelected],
  );

  return (
    <motion.button
      ref={buttonRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative min-w-[140px] cursor-pointer rounded-full px-6 py-3 transition-all duration-300 ease-out ${
        isActive
          ? `bg-gradient-to-r ${gradient} shadow-lg ${glow}`
          : 'bg-zinc-800/90 border border-zinc-700/60 hover:border-zinc-600'
      }`}
    >
      {/* Glow ring on active */}
      <span
        className={`pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r ${gradient} blur-md transition-opacity duration-300 ${
          isActive ? 'opacity-60' : 'opacity-0'
        }`}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center justify-center gap-2 font-medium text-white">
        <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
          {emoji}
        </span>
        <span className={`transition-all duration-300 ${isActive ? 'text-white font-semibold' : 'text-zinc-200'}`}>
          {label}
        </span>
      </span>
    </motion.button>
  );
}
