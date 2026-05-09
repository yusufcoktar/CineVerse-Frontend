import { useState, useEffect, useMemo } from 'react';
import axios from 'axios'; // 🔥 API bağlantısı için eklendi
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Play, ShoppingCart, ChevronRight, Sparkles, Film as FilmIcon, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Film } from '@/types';
import FilmCard from '@/components/FilmCard';
import { MovieSeriesCard } from '@/components/MovieSeriesCard';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import HeroParticles from '@/components/HeroParticles';
import { useSplitText } from '@/hooks/useSplitText';
import { SPRING_SOFT } from '@/constants/animations';

export default function HomePage() {
  // --- 🔥 YENİ: GERÇEK API STATE'LERİ ---
  const [allFilms, setAllFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);

  const [heroIdx, setHeroIdx] = useState(0);
  const [editorPicks, setEditorPicks] = useState<Film[]>([]);
  
  const addItem = useCartStore((s) => s.addItem);
  const toggleCartDrawer = useUIStore((s) => s.toggleCartDrawer);

  // --- 🔥 API'DEN FİLMLERİ ÇEKME İŞLEMİ ---
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get('https://localhost:7041/api/movies');
        
        // C#'tan gelen Movie nesnelerini Frontend'in Film modeline çeviriyoruz (Mapping)
        const mappedFilms: Film[] = response.data.map((m: any) => ({
          id: m.id.toString(), // Frontend ID'yi string bekliyor olabilir
          title: m.title,
          description: m.description,
          price: m.price,
          year: new Date(m.releaseDate).getFullYear(), // 2026-01-01 -> 2026
          rating: m.imdbRating,
          duration: m.duration,
          resolution: m.resolution,
          poster: m.posterUrl || 'https://via.placeholder.com/500x750?text=Afiş+Yok',
          backdrop: m.backdropUrl || 'https://via.placeholder.com/1920x1080?text=Arka+Plan+Yok',
          trailerUrl: m.trailerUrl,
          // Genres listesi objelerden oluşuyor ({id: 1, name: "Aksiyon"}), sadece isimlerini alıyoruz
          genres: m.genres ? m.genres.map((g: any) => g.name) : []
        }));

        setAllFilms(mappedFilms);
      } catch (error) {
        console.error("API'den filmler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Hesaplanan Veriler (Derived State)
  const heroFilms = allFilms.slice(0, 5);
  const heroFilm = heroFilms[heroIdx];
  const trendFilms = allFilms.slice(0, 8);
  const topRated = useMemo(() => [...allFilms].sort((a, b) => b.rating - a.rating).slice(0, 8), [allFilms]);
  
  const seriesCollections = useMemo(() => {
    const normalizeSeriesBase = (title: string) => {
      const withoutPart = title
        .trim()
        .replace(/\b(Bölüm|Part)\s*[0-9IVX]+\b.*$/giu, '')
        .replace(/\s+(II|III|IV|V|VI|VII|VIII|IX|X|[0-9]+)$/giu, '')
        .trim();

      const hasDash = withoutPart.includes(' - ');
      const beforeDash = withoutPart.split(' - ')[0].trim();
      const beforeColon = !hasDash && beforeDash.includes(':')
        ? beforeDash.split(':')[0].trim()
        : beforeDash;

      return beforeColon
        .replace(/\s+(II|III|IV|V|VI|VII|VIII|IX|X|[0-9]+)$/giu, '')
        .trim();
    };

    const grouped = new Map<string, Film[]>();

    for (const film of allFilms) {
      const baseTitle = normalizeSeriesBase(film.title);
      if (!baseTitle) continue;

      const items = grouped.get(baseTitle) ?? [];
      items.push(film);
      grouped.set(baseTitle, items);
    }

    return Array.from(grouped.entries())
      .map(([baseTitle, movies]) => ({
        name: baseTitle.toLowerCase().endsWith('serisi') ? baseTitle : `${baseTitle} Serisi`,
        movies: [...movies].sort((a, b) => a.year - b.year),
      }))
      .filter((collection) => collection.movies.length >= 2)
      .sort((a, b) => b.movies.length - a.movies.length || a.name.localeCompare(b.name, 'tr'))
      .slice(0, 8);
  }, [allFilms]);

  useEffect(() => {
    if (allFilms.length === 0) {
      setEditorPicks([]);
      return;
    }

    const shuffled = [...allFilms];
    const randomValues = new Uint32Array(shuffled.length);

    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(randomValues);
    } else {
      for (let i = 0; i < randomValues.length; i += 1) {
        randomValues[i] = (i * 2654435761) >>> 0;
      }
    }

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = randomValues[i] % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setEditorPicks(shuffled.slice(0, 6));
  }, [allFilms]);

  // Auto-rotate hero every 6 seconds
  useEffect(() => {
    if (heroFilms.length === 0) return;
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroFilms.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroFilms.length]);

  // --- 🔥 YÜKLEME EKRANI ---
  if (loading) {
    return (
      <div className="flex h-[100vh] items-center justify-center bg-bg-primary">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-accent-red/30 border-t-accent-red"
        />
      </div>
    );
  }

  // Eğer veritabanında hiç film yoksa
  if (!heroFilm) {
    return (
      <div className="flex h-[100vh] flex-col items-center justify-center bg-bg-primary text-text-muted">
        <FilmIcon size={48} className="mb-4 opacity-50" />
        <h2 className="font-heading text-2xl text-white">Henüz Film Yok</h2>
        <p>Admin paneline giderek mağazaya birkaç film ekleyin!</p>
      </div>
    );
  }

  const hasPlayed = typeof sessionStorage !== 'undefined' && sessionStorage.getItem('hero_played') === '1';
  const shouldAnimate = !hasPlayed;

  return (
    <HeroWrapper shouldAnimate={shouldAnimate} heroFilm={heroFilm} heroFilms={heroFilms} heroIdx={heroIdx} setHeroIdx={setHeroIdx} addItem={addItem} toggleCartDrawer={toggleCartDrawer}>

      {/* Trend Bu Hafta */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl text-accent-gold">Mağazadaki Filmler</h2>
          <Link to="/explore" className="flex items-center gap-1 text-sm text-text-secondary hover:text-white">
            Tümünü Gör <ChevronRight size={16} />
          </Link>
        </div>
        <motion.div
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        >
          {trendFilms.map((film) => (
            <motion.div key={film.id} className="flex-shrink-0" variants={{ hidden: { opacity: 0, y: 28, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1 } }}>
              <FilmCard film={film} size="lg" />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* En Yüksek Puanlı */}
      {topRated.length > 0 && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <img
              src={topRated[0]?.backdrop}
              alt=""
              className="h-full w-full object-cover opacity-10 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/90 to-bg-primary" />
          </div>
          <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-2xl text-accent-gold">En Yüksek Puanlı</h2>
              <Link to="/explore" className="flex items-center gap-1 text-sm text-text-secondary hover:text-white">
                Tümünü Gör <ChevronRight size={16} />
              </Link>
            </div>
            <motion.div
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {topRated.map((film) => (
                <motion.div key={film.id} className="flex-shrink-0" variants={{ hidden: { opacity: 0, y: 28, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1 } }}>
                  <FilmCard film={film} size="lg" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* Editör Seçimi */}
      {editorPicks.length > 0 && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <img
              src={editorPicks[0]?.backdrop}
              alt=""
              className="h-full w-full object-cover opacity-15 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-bg-primary" />
          </div>
          <div className="mx-auto max-w-7xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="text-accent-gold" size={24} />
                <h2 className="font-heading text-2xl text-accent-gold">Editör Seçimi</h2>
              </div>
              <Link to="/explore" className="flex items-center gap-1 text-sm text-text-secondary hover:text-white">
                Tümünü Gör <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {editorPicks.map((film, i) => (
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex-shrink-0"
                >
                  <FilmCard film={film} size="lg" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Koleksiyonlar — Film Serileri */}
      {seriesCollections.length > 0 && (
        <>
          <section className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-center gap-3">
              <FilmIcon className="text-accent-gold" size={24} />
              <h2 className="font-heading text-2xl text-accent-gold">Koleksiyonlar</h2>
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 pb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seriesCollections.map((series, index) => {
                return (
                  <motion.div
                    key={series.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.4, delay: index * 0.08 }}
                  >
                    <MovieSeriesCard
                      title={series.name}
                      movies={series.movies}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </HeroWrapper>
  );
}

/* ─── Hero Wrapper: sinematik sekans + parallax ─── */
interface HeroWrapperProps {
  shouldAnimate: boolean;
  heroFilm: Film;
  heroFilms: Film[];
  heroIdx: number;
  setHeroIdx: (i: number) => void;
  addItem: (film: Film) => void;
  toggleCartDrawer: () => void;
  children: React.ReactNode;
}

function HeroWrapper({ shouldAnimate, heroFilm, heroFilms, heroIdx, setHeroIdx, addItem, toggleCartDrawer, children }: HeroWrapperProps) {
  const reduce = useReducedMotion();
  const skip = reduce || !shouldAnimate;
  const { scrollY } = useScroll();
  const posterY = useTransform(scrollY, [0, 500], [0, -60]);
  const titleY = useTransform(scrollY, [0, 500], [0, -30]);
  const titleChars = useSplitText(heroFilm.title);

  useEffect(() => {
    if (shouldAnimate) {
      sessionStorage.setItem('hero_played', '1');
    }
  }, [shouldAnimate]);

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section — Cinematic */}
      <section className="relative h-[80vh] overflow-hidden">
        {/* Particles */}
        <HeroParticles />

        {/* Backdrop overlay */}
        <AnimatePresence mode="wait">
          <motion.div
            key={heroFilm.id}
            initial={skip ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: skip ? 0 : 0.6 }}
            className="absolute inset-0"
          >
            <motion.img
              src={heroFilm.backdrop}
              alt={heroFilm.title}
              className="h-full w-full object-cover"
              style={{ y: reduce ? 0 : posterY }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-transparent to-bg-primary/30" />
          </motion.div>
        </AnimatePresence>

        <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
          <motion.div
            key={heroFilm.id + '-info'}
            className="max-w-xl space-y-6"
            style={{ y: reduce ? 0 : titleY }}
          >
            {/* Genres */}
            <motion.div
              className="flex items-center gap-2 text-sm"
              initial={skip ? false : { opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: skip ? 0 : 0.75 }}
            >
              {heroFilm.genres.map((g) => (
                <span key={g} className="rounded-full bg-accent-purple/20 px-3 py-1 text-accent-purple">{g}</span>
              ))}
            </motion.div>

            {/* Title — split text stagger */}
            <motion.h1
              className="font-heading text-5xl md:text-6xl lg:text-7xl text-white"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: skip ? 0 : 0.025, delayChildren: skip ? 0 : 0.4 } },
              }}
            >
              {titleChars}
            </motion.h1>

            {/* Sub info */}
            <motion.div
              className="flex items-center gap-4 text-sm text-text-secondary"
              initial={skip ? false : { opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: skip ? 0 : 0.75 }}
            >
              <span className="flex items-center gap-1 text-accent-gold">⭐ {heroFilm.rating}</span>
              <span>{heroFilm.year}</span>
              <span>{heroFilm.duration} dk</span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{heroFilm.resolution}</span>
            </motion.div>

            <motion.p
              className="text-text-secondary leading-relaxed line-clamp-3"
              initial={skip ? false : { opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: skip ? 0 : 0.75 }}
            >
              {heroFilm.description}
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              className="flex gap-3"
              initial={skip ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={skip ? { duration: 0 } : { ...SPRING_SOFT, delay: 1 }}
            >
              {heroFilm.trailerUrl && (
                <Link
                  to={`/film/${heroFilm.id}`}
                  className="flex items-center gap-2 rounded-xl bg-accent-red px-6 py-3 font-semibold text-white transition-all hover:bg-accent-red/90 hover:scale-105 active:scale-95"
                >
                  <Play size={18} />
                  Fragmanı İzle
                </Link>
              )}
              <button
                onClick={() => { addItem(heroFilm); toggleCartDrawer(); }}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105 active:scale-95"
              >
                <ShoppingCart size={18} />
                Sepete Ekle
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero indicators */}
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {heroFilms.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-8 bg-accent-red' : 'w-4 bg-white/30 hover:bg-white/50'}`}
            />
          ))}
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-14 left-1/2 z-10 -translate-x-1/2"
          initial={skip ? false : { opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ opacity: { delay: skip ? 0 : 1.4 }, y: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <ChevronDown size={24} className="text-white/40" />
        </motion.div>
      </section>

      {children}
    </div>
  );
}