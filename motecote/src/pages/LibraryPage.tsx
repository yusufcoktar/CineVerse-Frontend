import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Film, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import axios from 'axios';

// Kütüphane filmi için tip tanımı
interface LibraryFilm {
  id: string;
  title: string;
  poster: string;
  year: number;
  genres: string[];
  rating: number;
}

export default function LibraryPage() {
  const [films, setFilms] = useState<LibraryFilm[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const fetchLibraryFromAPI = async () => {
      // Kullanıcı yoksa işlem yapma
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // C# API'deki yeni Library endpoint'imize bağlanıyoruz!
        const response = await axios.get(`https://localhost:7041/api/Orders/Library/${user.id}`);
        setFilms(response.data);
      } catch (error) {
        console.error("Kütüphane verileri C# API'den çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibraryFromAPI();
  }, [user]);

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-accent-gold">Kütüphaneniz Yükleniyor...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-purple/20">
            <Film className="text-accent-purple" size={24} />
          </div>
          <div>
            <h1 className="font-heading text-3xl text-accent-gold">Kütüphanem</h1>
            <p className="text-sm text-text-muted">{films.length} film satın alındı</p>
          </div>
        </motion.div>
      </div>

      {films.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Film size={48} className="mb-4 opacity-30" />
          <p>Kütüphanenizde henüz film bulunmuyor.</p>
          <Link to="/explore" className="mt-4 text-accent-purple hover:underline">
            Keşfetmeye başla
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {films.map((film, i) => (
            <motion.div
              key={film.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/[0.02] ring-1 ring-white/[0.05] transition-all hover:bg-white/[0.04] hover:ring-white/[0.1]"
            >
              {/* Yeşil "Satın Alındı" Etiketi */}
              <div className="absolute left-2 top-2 z-20 flex items-center gap-1 rounded-md bg-green-500/90 px-2 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
                <CheckCircle2 size={12} />
                Satın Alındı
              </div>

              {/* IMDB Puanı */}
              <div className="absolute right-2 top-2 z-20 rounded-md bg-accent-gold/90 px-2 py-1 text-[10px] font-bold text-bg-primary shadow-lg backdrop-blur-sm">
                {film.rating ? film.rating.toFixed(1) : 'N/A'}
              </div>

              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={film.poster}
                  alt={film.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/20 to-transparent opacity-60" />
                
                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-red text-white shadow-xl shadow-accent-red/30"
                  >
                    <Play size={24} className="ml-1" />
                  </motion.button>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="line-clamp-1 font-semibold text-white group-hover:text-accent-purple transition-colors">
                  {film.title}
                </h3>
                <p className="mt-1 text-xs text-text-muted">
                  {film.year} • {film.genres.join(', ')}
                </p>
                
                <Link
                  to={`/film/${film.id}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent-purple py-2 text-sm font-semibold text-white transition-all hover:bg-accent-purple/90"
                >
                  <Play size={16} /> İzle
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}