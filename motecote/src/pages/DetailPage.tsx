import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ShoppingCart, Heart, Clock, Calendar, Globe, Award, Star, Send, MessageCircle, Trash2, LogIn, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '@/lib/api'; // 🔥 KENDİ YAZDIĞIMIZ API'Yİ ÇAĞIRDIK
import StarRating from '@/components/StarRating';
import FilmCard from '@/components/FilmCard';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useFilmStore } from '@/store/filmStore';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const allFilms = useFilmStore((s) => s.films);
  const addItem = useCartStore((s) => s.addItem);
  const { user, isAuthenticated } = useAuthStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const [showTrailer, setShowTrailer] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentRating, setCommentRating] = useState(8);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOwned, setIsOwned] = useState(false);

  const film = allFilms.find((f) => f.id === id);

  // SİPARİŞ KONTROLÜ (Bu film kullanıcının kütüphanesinde var mı?)
  useEffect(() => {
    const checkOwnership = async () => {
      if (!isAuthenticated || !id) return;
      try {
        const res = await api.get('/orders/my-orders');
        const owned = res.data.some((order: any) => {
          const orderList = order.items || order.orderItems || [];
          return orderList.some((item: any) => item.movieId === Number(id));
        });
        setIsOwned(owned);
      } catch (error: any) {
        if (error.response?.status !== 400 && error.response?.status !== 401) {
          console.log("Siparişler kontrol edilemedi.");
        }
      }
    };
    checkOwnership();
  }, [id, isAuthenticated]);

  // YORUMLARI GETİR
  const fetchReviews = async () => {
    try {
      const res = await api.get(`/movies/${id}/reviews`);
      setReviews(res.data);
    } catch (error) {
      console.log("Yorumlar çekilemedi.");
    }
  };

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  // YORUM GÖNDER
  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      alert("Yorum yapmak için giriş yapmalısınız!");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/movies/${id}/reviews`, { 
        comment: commentText.trim(), 
        rating: commentRating 
      });
      setCommentText('');
      setCommentRating(8);
      fetchReviews(); 
    } catch (err: any) {
      alert(err.response?.data || "Yorum eklenirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!film) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <h2 className="text-xl text-white font-heading">Film Hazırlanıyor...</h2>
        <Link to="/" className="ml-4 text-accent-red hover:underline">Anasayfaya Dön</Link>
      </div>
    );
  }

  const wishlisted = isFavorite(film.id);
  const currentUserName = user ? ((user as any).name || (user as any).username || (user as any).Username || 'Kullanıcı') : 'Kullanıcı';
  const relatedFilms = allFilms.filter((f) => f.id !== film.id && f.genres.some((g) => film.genres.includes(g)));

  return (
    <div className="pb-12 bg-bg-primary min-h-screen">
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={film.backdrop || film.poster || ''} alt={film.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg-primary via-bg-primary/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent" />
        </div>

        <div className="relative mx-auto flex h-full max-w-7xl items-end px-4 pb-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-8">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} className="hidden md:block">
              <div className="relative w-52 overflow-hidden rounded-2xl shadow-2xl border border-white/10">
                <motion.img src={film.poster || ''} alt={film.title} className="w-full" layoutId={`film-poster-${film.id}`} />
                <div className="absolute bottom-2 left-2 rounded-lg bg-accent-gold/90 px-2 py-1 text-xs font-bold text-black shadow-lg">⭐ {film.rating}</div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {film.genres.map((g) => (
                  <span key={g} className="rounded-full bg-accent-purple/20 px-3 py-1 text-xs text-accent-purple border border-accent-purple/30">{g}</span>
                ))}
              </div>
              <h1 className="font-heading text-4xl md:text-5xl text-white">{film.title}</h1>
              <p className="text-sm text-text-muted">{film.originalTitle}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                <span className="flex items-center gap-1"><Calendar size={14} /> {film.year}</span>
                <span className="flex items-center gap-1"><Clock size={14} /> {film.duration} dk</span>
                <span className="flex items-center gap-1"><Globe size={14} /> {film.country}</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-xs uppercase">{film.resolution}</span>
                <span className="rounded bg-accent-red/20 px-2 py-0.5 text-xs text-accent-red font-bold">{film.ageRating}</span>
              </div>
              
              <StarRating rating={film.rating} />
              
              <div className="flex flex-wrap gap-3 pt-4">
                {isOwned ? (
                  <button onClick={() => navigate(`/watch/${film.id}`)} className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition-all hover:bg-green-700 hover:scale-105 shadow-lg shadow-green-900/50">
                    <CheckCircle size={18} /> Kütüphanende Var - İzle
                  </button>
                ) : (
                  <>
                    {film.trailerUrl && (
                      <button onClick={() => setShowTrailer(true)} className="flex items-center gap-2 rounded-xl bg-accent-red px-6 py-3 font-semibold text-white transition-all hover:bg-accent-red/90 hover:scale-105 shadow-lg shadow-accent-red/30">
                        <Play size={18} /> Fragmanı İzle
                      </button>
                    )}
                    <button onClick={() => { addItem(film as any); navigate('/cart'); }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105">
                      <ShoppingCart size={18} />
                      {film.discountPrice ? (
                        <span className="flex items-center gap-2">
                          <span className="text-accent-red font-bold">{film.discountPrice.toFixed(2)} ₺</span>
                          <span className="text-xs text-text-muted line-through">{film.price.toFixed(2)} ₺</span>
                        </span>
                      ) : (
                        <span className="font-bold">{film.price.toFixed(2)} ₺</span>
                      )}
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      alert("Beğendiğiniz filmleri kaydetmek için lütfen giriş yapın!");
                      navigate('/login');
                      return;
                    }
                    toggleFavorite(film);
                  }}
                  className={`rounded-xl border border-white/10 p-3 transition-all hover:bg-white/10 ${wishlisted ? 'text-accent-red bg-accent-red/5' : 'text-text-secondary bg-white/5'}`}
                >
                  <Heart size={20} className={wishlisted ? 'fill-accent-red' : ''} />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-12 px-4 pt-12">
        <div className="grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="mb-4 font-heading text-2xl text-accent-gold">Hikaye</h2>
              <p className={`text-text-secondary leading-relaxed text-lg ${!expanded ? 'line-clamp-4' : ''}`}>{film.description}</p>
              <button onClick={() => setExpanded(!expanded)} className="mt-2 text-sm font-bold text-accent-purple hover:text-accent-purple/80 transition-colors uppercase tracking-wider">
                {expanded ? 'Daha az göster' : 'Devamını oku'}
              </button>
            </section>

            <section className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">Yönetmen</h3>
                <p className="text-white text-lg font-medium">{film.director}</p>
              </div>
              <div>
                <h3 className="mb-3 text-xs font-bold text-text-muted uppercase tracking-widest">Oyuncu Kadrosu</h3>
                <div className="flex flex-wrap gap-2">
                  {film.cast?.map((actor) => (
                    <span key={actor} className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-text-secondary hover:text-white transition-colors">{actor}</span>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 space-y-6">
                <h4 className="font-heading text-lg text-white border-b border-white/10 pb-4">Teknik Detaylar</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Dil</p>
                        <p className="text-white font-medium">{film.language}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Çözünürlük</p>
                        <p className="text-white font-medium uppercase">{film.resolution}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Altyazılar</p>
                        <p className="text-white font-medium">{film.subtitles?.join(', ') || 'Bulunmuyor'}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {relatedFilms.length > 0 && (
          <section>
            <h2 className="mb-6 font-heading text-2xl text-accent-gold">Bu Filmi Sevenler Bunları da İzledi</h2>
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
              {relatedFilms.map((f) => <div key={f.id} className="min-w-[240px]"><FilmCard film={f} /></div>)}
            </div>
          </section>
        )}

        <section className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 mb-8">
            <MessageCircle size={28} className="text-accent-purple" />
            <h2 className="font-heading text-2xl text-white">Yorumlar & Değerlendirmeler</h2>
            <span className="rounded-full bg-accent-purple/20 px-3 py-1 text-sm font-bold text-accent-purple border border-accent-purple/30">{reviews.length}</span>
          </div>

          <div className="mb-10 rounded-3xl bg-white/[0.02] p-8 border border-white/5 shadow-2xl">
            {isAuthenticated ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-purple to-violet-600 text-lg font-bold text-white shadow-lg">{currentUserName.charAt(0)}</div>
                  <div><p className="text-lg font-bold text-white">{currentUserName}</p><p className="text-sm text-text-muted">Bu yapımı değerlendir...</p></div>
                </div>
                
                <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl w-fit">
                  <span className="text-sm font-bold text-text-muted uppercase tracking-wider">Puanın:</span>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button key={n} onClick={() => setCommentRating(n)} className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold transition-all ${n <= commentRating ? 'bg-accent-gold text-black scale-110 shadow-lg' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}>{n}</button>
                    ))}
                  </div>
                  <span className="ml-2 flex items-center gap-1 text-lg font-black text-accent-gold">⭐ {commentRating}/10</span>
                </div>

                <div className="relative">
                  <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Film hakkında düşüncelerinizi paylaşın..." rows={4} className="w-full rounded-2xl border border-white/5 bg-black/30 px-6 py-4 text-white outline-none placeholder:text-text-muted transition-all focus:border-accent-purple/50 focus:ring-4 focus:ring-accent-purple/10 resize-none text-lg" />
                </div>
                
                <div className="flex items-center justify-end gap-3">
                  <button onClick={() => { setCommentText(''); setCommentRating(8); }} disabled={!commentText.trim() || isSubmitting} className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-text-muted transition-colors hover:text-accent-red">Temizle</button>
                  <button onClick={handleCommentSubmit} disabled={!commentText.trim() || isSubmitting} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-violet-600 px-8 py-3.5 font-bold text-white shadow-xl shadow-accent-purple/20 transition-all hover:scale-105 hover:brightness-110 disabled:opacity-30">
                    {isSubmitting ? "Gönderiliyor..." : <><Send size={18} /> Gönder</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-accent-purple/5 border border-accent-purple/10 rounded-3xl p-8">
                <div className="flex items-center gap-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-purple/20"><LogIn size={28} className="text-accent-purple" /></div>
                  <div><p className="text-xl font-bold text-white">Katılmak ister misin?</p><p className="text-text-muted">Bu filme yorum yapmak için giriş yapmalısın.</p></div>
                </div>
                <div className="flex gap-3">
                  <Link to="/login" className="rounded-xl bg-accent-purple px-8 py-3.5 font-bold text-white transition-all hover:brightness-110">Giriş Yap</Link>
                  <Link to="/register" className="rounded-xl bg-white/10 px-8 py-3.5 font-bold text-white transition-all hover:bg-white/20">Hesap Oluştur</Link>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {reviews.length === 0 ? (
              <div className="rounded-3xl bg-white/[0.01] border border-dashed border-white/10 p-16 text-center">
                <MessageCircle size={48} className="mx-auto text-white/5 mb-4" />
                <p className="text-lg text-text-muted">Henüz hiç yorum yapılmamış. İlk yorumu sen yap!</p>
              </div>
            ) : (
              reviews.map((comment: any) => {
                const displayUserName = comment.username || comment.Username || 'Anonim';
                const commentDate = comment.reviewDate || comment.ReviewDate || comment.createdAt || new Date();
                return (
                  <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-white/[0.02] p-6 border border-white/5 hover:bg-white/[0.04] transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-red to-pink-600 text-lg font-bold text-white shadow-lg uppercase">{displayUserName.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-white">{displayUserName}</span>
                            <span className="flex items-center gap-1 rounded-lg bg-accent-gold/15 px-2 py-1 text-xs font-black text-accent-gold border border-accent-gold/20">⭐ {comment.rating}</span>
                          </div>
                          <span className="text-xs text-text-muted font-medium">{new Date(commentDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </div>
                        <p className="text-text-secondary leading-relaxed text-lg">{comment.comment}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {showTrailer && film.trailerUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4" onClick={() => setShowTrailer(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-5xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowTrailer(false)} className="absolute -top-12 right-0 text-white hover:text-accent-red transition-colors font-bold uppercase tracking-widest flex items-center gap-2">Kapat <Trash2 size={18} /></button>
            <div className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl aspect-video">
                <iframe src={film.trailerUrl} title={`${film.title} Fragman`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}