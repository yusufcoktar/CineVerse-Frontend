import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useCartStore } from '@/store/cartStore';
import StarRating from '@/components/StarRating';

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavoritesStore();
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-red/15">
          <Heart size={20} className="text-accent-red" fill="#FF3C6E" />
        </div>
        <div>
          <h1 className="font-heading text-2xl text-white">Beğenilerim</h1>
          <p className="text-sm text-text-muted">{favorites.length} film beğenildi</p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white/[0.03] py-20 ring-1 ring-white/[0.06]">
          <Heart size={48} className="mb-4 text-text-muted opacity-30" />
          <h2 className="text-lg font-semibold text-white mb-2">Henüz beğeni yok</h2>
          <p className="text-sm text-text-muted mb-6">Filmleri beğenerek burada toplayabilirsiniz</p>
          <Link
            to="/explore"
            className="rounded-xl bg-gradient-to-r from-accent-purple to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/25 transition-all hover:shadow-accent-purple/40 hover:brightness-110"
          >
            Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((film, i) => (
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
                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 rounded-lg bg-accent-gold/90 px-2 py-1 text-xs font-bold text-black">
                    ⭐ {film.rating}
                  </div>
                  {/* Resolution Badge */}
                  <div className={`absolute top-3 right-3 rounded-lg px-2 py-1 text-[10px] font-bold ${
                    film.resolution === '4K' ? 'bg-accent-gold/20 text-accent-gold backdrop-blur-sm' :
                    film.resolution === 'HD' ? 'bg-blue-500/20 text-blue-400 backdrop-blur-sm' :
                    'bg-white/20 text-white backdrop-blur-sm'
                  }`}>
                    {film.resolution}
                  </div>
                  {/* Discount Badge */}
                  {film.discountPrice && (
                    <div className="absolute bottom-3 left-3 rounded-lg bg-green-500/90 px-2 py-1 text-[10px] font-bold text-white">
                      %{Math.round((1 - film.discountPrice / film.price) * 100)} İndirim
                    </div>
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="p-4">
                <Link to={`/film/${film.id}`}>
                  <h3 className="text-sm font-semibold text-white truncate group-hover:text-accent-red transition-colors">
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

                {/* Price + Actions */}
                <div className="mt-3 flex items-center justify-between">
                  <div>
                    {film.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-accent-red">{film.discountPrice.toFixed(2)} ₺</span>
                        <span className="font-mono text-[11px] text-text-muted line-through">{film.price.toFixed(2)} ₺</span>
                      </div>
                    ) : (
                      <span className="font-mono text-sm font-bold text-white">{film.price.toFixed(2)} ₺</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        addItem(film);
                        navigate('/cart');
                      }}
                      className="rounded-lg bg-accent-red/15 p-2 text-accent-red transition-colors hover:bg-accent-red/25"
                      title="Sepete Ekle"
                    >
                      <ShoppingCart size={14} />
                    </button>
                    <button
                      onClick={() => removeFavorite(film.id)}
                      className="rounded-lg bg-white/[0.06] p-2 text-text-muted transition-colors hover:bg-accent-red/15 hover:text-accent-red"
                      title="Beğeniden Çıkar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
