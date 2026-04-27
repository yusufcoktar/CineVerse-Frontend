import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ShoppingCart, Heart, Clock, Calendar, Globe, Award, Star, Send, MessageCircle, Trash2, LogIn } from 'lucide-react';
import { useState } from 'react';
import StarRating from '@/components/StarRating';
import FilmCard from '@/components/FilmCard';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useCommentStore } from '@/store/commentStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useFilmStore } from '@/store/filmStore';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const allFilms = useFilmStore((s) => s.films);
  const film = allFilms.find((f) => f.id === id);
  // Eğer API henüz verileri getirmediyse sayfayı çökertme, bekleme ekranı göster
  if (!film) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <h2 className="text-xl text-white">Film Yükleniyor...</h2>
      </div>
    );
  }
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { addComment, getFilmComments } = useCommentStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const [showTrailer, setShowTrailer] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const wishlisted = film ? isFavorite(film.id) : false;
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(8);

  if (!film) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="font-heading text-2xl text-accent-red">Film bulunamadı</h2>
          <Link to="/" className="mt-4 inline-block text-accent-purple hover:underline">
            Anasayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  const relatedFilms = allFilms.filter(
    (f) => f.id !== film.id && f.genres.some((g) => film.genres.includes(g))
  );

  return (
    <div className="pb-12">
      {/* Hero */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={film.backdrop} alt={film.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="hidden md:block"
            >
              <div className="relative w-52 overflow-hidden rounded-2xl shadow-2xl">
                <motion.img
                  src={film.poster}
                  alt={film.title}
                  className="w-full"
                  layoutId={`film-poster-${film.id}`}
                />
                <div className="absolute bottom-2 left-2 rounded-lg bg-accent-gold/90 px-2 py-1 text-xs font-bold text-black">
                  ⭐ {film.rating}
                </div>
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 space-y-4"
            >
              <div className="flex flex-wrap gap-2">
                {film.genres.map((g) => (
                  <span key={g} className="rounded-full bg-accent-purple/20 px-3 py-1 text-xs text-accent-purple">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="font-heading text-4xl md:text-5xl text-white">{film.title}</h1>
              <p className="text-sm text-text-muted">{film.originalTitle}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1"><Calendar size={14} /> {film.year}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {film.duration} dk</span>
                <span className="flex items-center gap-1"><Globe size={14} /> {film.country}</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{film.resolution}</span>
                <span className="rounded bg-accent-red/20 px-2 py-0.5 text-xs text-accent-red">{film.ageRating}</span>
              </div>
              <StarRating rating={film.rating} />
              <div className="flex gap-3">
                {film.trailerUrl && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 rounded-xl bg-accent-red px-6 py-3 font-semibold text-white transition-all hover:bg-accent-red/90 hover:scale-105"
                  >
                    <Play size={18} />
                    Fragmanı İzle
                  </button>
                )}
                <button
                  onClick={() => {
                    addItem(film);
                    navigate('/cart');
                  }}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
                >
                  <ShoppingCart size={18} />
                  {film.discountPrice ? (
                    <span>
                      <span className="text-accent-red">{film.discountPrice.toFixed(2)} ₺</span>
                      <span className="ml-2 text-xs text-text-muted line-through">{film.price.toFixed(2)} ₺</span>
                    </span>
                  ) : (
                    <span>{film.price.toFixed(2)} ₺</span>
                  )}
                </button>
                <button
                  onClick={() => toggleFavorite(film)}
                  className={`rounded-xl border border-white/10 p-3 transition-all hover:bg-white/10 ${
                    wishlisted ? 'text-accent-red' : 'text-text-secondary'
                  }`}
                >
                  <Heart size={18} className={wishlisted ? 'fill-accent-red' : ''} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Details */}
      <div className="mx-auto max-w-7xl space-y-8 px-4 pt-8">
        {/* Description */}
        <section>
          <h2 className="mb-4 font-heading text-xl text-accent-gold">Hakkında</h2>
          <p className={`text-text-secondary leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
            {film.description}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm text-accent-purple hover:underline"
          >
            {expanded ? 'Daha az göster' : 'Devamını oku'}
          </button>
        </section>

        {/* Cast & Crew */}
        <section className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase">Yönetmen</h3>
            <p className="text-white">{film.director}</p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold text-text-muted uppercase">Oyuncular</h3>
            <div className="flex flex-wrap gap-2">
              {film.cast.map((actor) => (
                <span key={actor} className="rounded-lg bg-white/5 px-3 py-1 text-sm text-text-secondary">
                  {actor}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-4">
            <h4 className="text-xs text-text-muted uppercase">Dil</h4>
            <p className="mt-1 text-white">{film.language}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <h4 className="text-xs text-text-muted uppercase">Çözünürlük</h4>
            <p className="mt-1 text-white">{film.resolution}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <h4 className="text-xs text-text-muted uppercase">Altyazılar</h4>
            <p className="mt-1 text-white">{film.subtitles.join(', ')}</p>
          </div>
        </section>

        {/* Awards */}
        {film.awards.length > 0 && (
          <section>
            <h2 className="mb-4 font-heading text-xl text-accent-gold">Ödüller</h2>
            <div className="flex flex-wrap gap-3">
              {film.awards.map((award, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl bg-accent-gold/10 px-4 py-2"
                >
                  <Award size={18} className="text-accent-gold" />
                  <div>
                    <p className="text-sm font-semibold text-accent-gold">{award.name} {award.year}</p>
                    <p className="text-xs text-text-secondary">{award.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Films */}
        {relatedFilms.length > 0 && (
          <section>
            <h2 className="mb-4 font-heading text-xl text-accent-gold">Benzer Filmler</h2>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {relatedFilms.map((f) => (
                <FilmCard key={f.id} film={f} />
              ))}
            </div>
          </section>
        )}

        {/* Comments Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle size={22} className="text-accent-purple" />
            <h2 className="font-heading text-xl text-accent-gold">Yorumlar</h2>
            <span className="rounded-full bg-accent-purple/15 px-2.5 py-0.5 text-xs font-semibold text-accent-purple">
              {getFilmComments(film.id).length}
            </span>
          </div>

          {/* Comment Form */}
          {/* Comment Form - always visible */}
          <div className="mb-8 rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-purple/60 text-xs font-bold text-white">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name || 'Kullanıcı'}</p>
                    <p className="text-[11px] text-text-muted">Yorum yaz...</p>
                  </div>
                </div>
                {/* Rating selector */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs text-text-muted">Puanın:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        onClick={() => setCommentRating(n)}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          n <= commentRating
                            ? 'bg-accent-gold/20 text-accent-gold'
                            : 'bg-white/[0.04] text-text-muted hover:bg-white/[0.08]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-accent-gold">
                    <Star size={14} fill="#FFD700" /> {commentRating}/10
                  </span>
                </div>
                <div className="flex gap-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Bu film hakkında ne düşünüyorsunuz?"
                    rows={3}
                    className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-text-muted transition-all focus:border-accent-purple/40 focus:ring-1 focus:ring-accent-purple/20 resize-none"
                  />
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => { setCommentText(''); setCommentRating(8); }}
                    disabled={!commentText.trim()}
                    className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-accent-red/10 hover:text-accent-red disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <Trash2 size={14} />
                    Temizle
                  </button>
                  <button
                    onClick={() => {
                      if (commentText.trim() && user) {
                        addComment(film.id, user.id, user.name, commentText.trim(), commentRating);
                        setCommentText('');
                        setCommentRating(8);
                      }
                    }}
                    disabled={!commentText.trim()}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/25 transition-all hover:shadow-accent-purple/40 hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <Send size={14} />
                    Gönder
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/15">
                    <LogIn size={18} className="text-accent-purple" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Hesabınız yok mu?</p>
                    <p className="text-[11px] text-text-muted">Kayıt olarak yorum yapabilir, film beğenebilirsiniz</p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      className="rounded-lg bg-accent-purple/15 px-4 py-2 text-xs font-semibold text-accent-purple transition-colors hover:bg-accent-purple/25"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/register"
                      className="rounded-lg bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/[0.1]"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {getFilmComments(film.id).length === 0 ? (
              <div className="rounded-2xl bg-white/[0.03] p-8 text-center ring-1 ring-white/[0.06]">
                <p className="text-sm text-text-muted">Henüz yorum yok. İlk yorumu siz yapın!</p>
              </div>
            ) : (
              getFilmComments(film.id).map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-red/80 to-pink-600/60 text-xs font-bold text-white">
                      {comment.userName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-semibold text-white">{comment.userName}</span>
                        <span className="flex items-center gap-1 rounded-md bg-accent-gold/15 px-1.5 py-0.5 text-[11px] font-bold text-accent-gold">
                          <Star size={10} fill="#FFD700" /> {comment.rating}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {new Date(comment.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-text-secondary">{comment.text}</p>

                      {/* Admin Reply */}
                      {comment.adminReply && (
                        <div className="mt-3 ml-2 rounded-xl border-l-2 border-accent-purple/40 bg-accent-purple/[0.06] px-4 py-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="rounded-md bg-accent-purple/20 px-1.5 py-0.5 text-[10px] font-bold text-accent-purple">ADMIN</span>
                            <span className="text-[11px] text-text-muted">
                              {comment.adminRepliedAt && new Date(comment.adminRepliedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary">{comment.adminReply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      {showTrailer && film.trailerUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setShowTrailer(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={film.trailerUrl}
              title={`${film.title} Fragman`}
              className="aspect-video w-full rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
