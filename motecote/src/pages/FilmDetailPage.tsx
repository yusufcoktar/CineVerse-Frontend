import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Play, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import MovieReviews from '@/components/MovieReviews';

export default function FilmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const addItem = useCartStore((s) => s.addItem);
  const toggleCartDrawer = useUIStore((s) => s.toggleCartDrawer);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const res = await axios.get(`https://localhost:7041/api/movies/${id}`);
        setMovie(res.data);
      } catch (error) {
        console.error("Film detayı çekilemedi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-bg-primary text-white">Yükleniyor...</div>;
  }

  if (!movie) {
    return <div className="flex h-screen items-center justify-center bg-bg-primary text-white">Film bulunamadı!</div>;
  }

  return (
    <div className="min-h-screen bg-bg-primary pb-20">
      {/* Üst Arka Plan ve Afiş */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <img src={movie.backdropUrl || movie.posterUrl} alt={movie.title} className="w-full h-full object-cover blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/80 to-transparent z-20" />
        
        {/* Film Bilgileri */}
        <div className="absolute bottom-0 z-30 w-full px-4 sm:px-8 lg:px-16 pb-12 flex flex-col md:flex-row gap-8 items-end max-w-7xl mx-auto">
          <img src={movie.posterUrl} alt={movie.title} className="w-48 rounded-xl shadow-2xl border border-white/10 hidden md:block" />
          
          <div className="flex-1 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-2">
              <ArrowLeft size={18} /> Ana Sayfaya Dön
            </Link>
            <h1 className="text-4xl md:text-6xl font-heading text-white">{movie.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
              <span className="text-accent-gold font-bold">⭐ {movie.imdbRating}/10</span>
              <span>{new Date(movie.releaseDate).getFullYear()}</span>
              <span>{movie.duration} Dk</span>
              <span className="uppercase">{movie.resolution}</span>
            </div>
            <p className="text-text-secondary max-w-2xl leading-relaxed">{movie.description}</p>
            
            <div className="flex gap-4 pt-4">
              {movie.trailerUrl && (
                <a href={movie.trailerUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-xl bg-accent-red px-6 py-3 font-semibold text-white transition-all hover:bg-accent-red/90 hover:scale-105">
                  <Play size={18} /> Fragmanı İzle
                </a>
              )}
              <button 
                onClick={() => { 
                  addItem({ 
                    id: movie.id.toString(), 
                    title: movie.title, 
                    price: movie.price, 
                    poster: movie.posterUrl, 
                    year: new Date(movie.releaseDate).getFullYear(), 
                    rating: movie.imdbRating, 
                    duration: movie.duration, 
                    resolution: movie.resolution, 
                    description: movie.description, 
                    backdrop: movie.backdropUrl, 
                    trailerUrl: movie.trailerUrl, 
                    genres: [] 
                  } as any); // 🔥 TypeScript hatasını çözen sihirli dokunuş
                  toggleCartDrawer(); 
                }} 
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-105"
              >
                <ShoppingCart size={18} /> Sepete Ekle ({movie.price} ₺)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Kısım: Yorumlar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16">
        {/* Az önce oluşturduğumuz Yorumlar bileşenini buraya çağırıyoruz */}
        <MovieReviews movieId={movie.id.toString()} />
      </div>
    </div>
  );
}