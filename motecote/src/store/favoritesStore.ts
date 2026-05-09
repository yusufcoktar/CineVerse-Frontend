import { create } from 'zustand';
import api from '@/lib/api'; // 🔥 KENDİ YAZDIĞIMIZ API'Yİ ÇAĞIRDIK
import type { Film } from '@/types';
import { useAuthStore } from '@/store/authStore';

interface FavoritesState {
  favorites: Film[];
  fetchFavorites: () => Promise<void>;
  toggleFavorite: (film: Film) => Promise<void>;
  isFavorite: (filmId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  fetchFavorites: async () => {
    // Kullanıcı giriş yapmamışsa boşuna C#'a gidip 401 hatası yeme
    const authState = useAuthStore.getState() as any;
    if (!authState.isAuthenticated) return;

    try {
      const res = await api.get('/favorites');
      
      const mappedFavorites = res.data.map((m: any) => ({
        id: m.id?.toString(),
        title: m.title,
        price: m.price || 0,
        discountPrice: m.discountPrice,
        description: m.description || '',
        poster: m.posterUrl || '', 
        backdrop: m.backdropUrl || '',
        year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : 2024,
        rating: m.imdbRating || 0, 
        duration: m.duration || 120,
        resolution: m.resolution || 'FHD',
        trailerUrl: m.trailerUrl || '',
        genres: m.genres ? m.genres.map((g: any) => g.name || g) : [],
        originalTitle: m.originalTitle || m.title,
        director: m.director || 'Bilinmiyor',
        cast: m.cast || [],
        country: m.country || 'Türkiye',
        language: m.language || 'Türkçe',
        ageRating: m.ageRating || 'Genel İzleyici'
      }));

      set({ favorites: mappedFavorites });
    } catch (err) { 
      console.error("Favoriler yüklenemedi", err); 
    }
  },

  toggleFavorite: async (film) => {
    const authState = useAuthStore.getState() as any;
    if (!authState.isAuthenticated) return;

    try {
      await api.post(`/favorites/${film.id}`);
      
      const { favorites } = get();
      if (favorites.some(f => f.id === film.id)) {
        set({ favorites: favorites.filter(f => f.id !== film.id) });
      } else {
        set({ favorites: [...favorites, film] });
      }
    } catch (err) { 
      console.error("Favori işlemi başarısız", err); 
    }
  },

  isFavorite: (filmId) => get().favorites.some(f => f.id === filmId),
  clearFavorites: () => set({ favorites: [] }),
}));