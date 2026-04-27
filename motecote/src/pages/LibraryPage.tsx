import { motion } from 'framer-motion';
import { Library, Play, Download, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLibraryStore } from '@/store/libraryStore';
import StarRating from '@/components/StarRating';

export default function LibraryPage() {
  const { purchasedFilms } = useLibraryStore();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-purple/15">
          <Library size={20} className="text-accent-purple" />
        </div>
        <div>
          <h1 className="font-heading text-2xl text-white">Kütüphanem</h1>
          <p className="text-sm text-text-muted">{purchasedFilms.length} film satın alındı</p>
        </div>
      </div>

      {purchasedFilms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white/[0.03] py-20 ring-1 ring-white/[0.06]">
          <Film size={48} className="mb-4 text-text-muted opacity-30" />
          <h2 className="text-lg font-semibold text-white mb-2">Kütüphaneniz boş</h2>
          <p className="text-sm text-text-muted mb-6">Satın aldığınız filmler burada görünecek</p>
          <Link
            to="/explore"
            className="rounded-xl bg-gradient-to-r from-accent-purple to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/25 transition-all hover:shadow-accent-purple/40 hover:brightness-110"
          >
            Film Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {purchasedFilms.map((film, i) => (
            <motion.div
              key={film.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] transition-all hover:ring-white/[0.12] hover:bg-white/[0.05]"
            >
              {/* Poster */}
              <Link to={`/film/${film.id}`} className="block">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={film.poster}
                    alt={film.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {/* Owned Badge */}
                  <div className="absolute top-3 left-3 rounded-lg bg-green-500/90 px-2.5 py-1 text-[10px] font-bold text-white flex items-center gap-1">
                    <Download size={10} />
                    Satın Alındı
                  </div>
                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 rounded-lg bg-accent-gold/90 px-2 py-1 text-xs font-bold text-black">
                    ⭐ {film.rating}
                  </div>
                  {/* Resolution Badge */}
                  <div className={`absolute bottom-3 right-3 rounded-lg px-2 py-1 text-[10px] font-bold ${
                    film.resolution === '4K' ? 'bg-accent-gold/20 text-accent-gold backdrop-blur-sm' :
                    film.resolution === 'HD' ? 'bg-blue-500/20 text-blue-400 backdrop-blur-sm' :
                    'bg-white/20 text-white backdrop-blur-sm'
                  }`}>
                    {film.resolution}
                  </div>
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-red/90 shadow-lg shadow-accent-red/30 transition-transform group-hover:scale-110">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link to={`/film/${film.id}`}>
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-accent-purple transition-colors">
                    {film.title}
                  </h3>
                </Link>
                <p className="mt-0.5 text-[11px] text-text-muted">{film.year} • {film.director}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {film.genres.slice(0, 2).map((g) => (
                    <span key={g} className="rounded-md bg-accent-purple/10 px-1.5 py-0.5 text-[10px] text-accent-purple">
                      {g}
                    </span>
                  ))}
                </div>
                <div className="mt-1">
                  <StarRating rating={film.rating} />
                </div>

                {/* Watch Button */}
                <div className="mt-3">
                  <Link
                    to={`/film/${film.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/25 transition-all hover:shadow-accent-purple/40 hover:brightness-110"
                  >
                    <Play size={14} />
                    İzle
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
