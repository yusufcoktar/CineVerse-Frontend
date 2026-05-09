import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

interface Review {
  id: number;
  comment: string;
  rating: number;
  reviewDate: string; // C#'taki ReviewDate ile aynı olmalı
  username: string;
}

interface MovieReviewsProps {
  movieId: string;
}

export default function MovieReviews({ movieId }: MovieReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`https://localhost:7041/api/movies/${movieId}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error("Yorumlar çekilemedi", err);
    }
  };

  useEffect(() => {
    if (movieId) fetchReviews();
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError("Lütfen bir yorum yazın.");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Yorum yapmak için önce giriş yapmalısınız.");
      return;
    }

    setLoading(true); setError(''); setSuccess('');

    try {
      await axios.post(
        `https://localhost:7041/api/movies/${movieId}/reviews`,
        { comment, rating },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Yorumunuz başarıyla eklendi!");
      setComment('');
      setRating(10);
      fetchReviews();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data || "Yorum eklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 w-full mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h3 className="text-2xl font-heading text-accent-gold">Yorumlar</h3>
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-purple/20 text-xs text-accent-purple font-bold">
          {reviews.length}
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 mb-8 shadow-xl backdrop-blur-md">
        {error && <div className="mb-4 text-sm text-accent-red bg-accent-red/10 p-3 rounded-lg">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-text-secondary">Puanın:</span>
            <div className="flex gap-1 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num} type="button" onClick={() => setRating(num)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                    rating === num ? 'bg-accent-gold text-black scale-110 shadow-lg' : 'bg-white/5 text-text-muted hover:bg-white/10'
                  }`}
                >
                  {num}
                </button>
              ))}
              <span className="ml-2 flex items-center text-sm font-bold text-accent-gold">⭐ {rating}/10</span>
            </div>
          </div>

          <textarea
            value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Bu film hakkında ne düşünüyorsunuz?"
            className="w-full min-h-[120px] rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white outline-none placeholder:text-text-muted focus:border-accent-purple/50 focus:bg-black/40 transition-colors resize-none"
          />

          <div className="mt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setComment('')} className="px-6 py-2.5 text-sm font-medium text-text-muted hover:text-white transition-colors">
              Temizle
            </button>
            <button type="submit" disabled={loading} className="rounded-xl bg-accent-purple px-8 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50">
              {loading ? "Gönderiliyor..." : "Gönder"}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-8 text-center text-text-muted text-sm">
            Henüz yorum yok. İlk yorumu siz yapın!
          </div>
        ) : (
          reviews.map((rev) => (
            <motion.div key={rev.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-red text-white font-bold uppercase">
                    {rev.username.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{rev.username}</h4>
                    <span className="text-xs text-text-muted">{new Date(rev.reviewDate).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-accent-gold/10 px-2 py-1 text-xs font-bold text-accent-gold ring-1 ring-accent-gold/20">
                  ⭐ {rev.rating}/10
                </div>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{rev.comment}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}