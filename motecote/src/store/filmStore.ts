import { create } from 'zustand';
import type { Film } from '@/types'; // Frontend ekibinin Film tipini koruyoruz
import axios from 'axios'; // API bağlantısı için Axios'u ekledik

// 1. Arayüze fetchFilmsFromApi fonksiyonumuzu tanıtıyoruz
interface FilmStoreState {
  films: Film[];
  addFilm: (film: Film) => void;
  updateFilm: (id: string, updates: Partial<Film>) => void;
  deleteFilm: (id: string) => void;
  getFilm: (id: string) => Film | undefined;
  fetchFilmsFromApi: () => Promise<void>; 
}

export const useFilmStore = create<FilmStoreState>((set, get) => ({
  films: [], // SAHTE VERİYİ SİLDİK: Başlangıçta depo tertemiz, boş!

  // Mevcut admin fonksiyonlarını bozmuyoruz:
  addFilm: (film) => set((s) => ({ films: [film, ...s.films] })),
  
  updateFilm: (id, updates) =>
    set((s) => ({
      films: s.films.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),
    
  deleteFilm: (id) =>
    set((s) => ({ films: s.films.filter((f) => f.id !== id) })),
    
  getFilm: (id) => get().films.find((f) => f.id === id),

  // 2. YENİ MİMARİ: API'den verileri çeken fonksiyon
  fetchFilmsFromApi: async () => {
    try {
      // Backend'inin kapısını çalıyoruz
      const response = await axios.get('https://localhost:7041/api/Movies');
      
      // Gelen veriyi (C# Formatı) frontend'in beklediği (Film) formata çeviriyoruz
      const apiMovies: Film[] = response.data.map((m: any) => ({
        id: m.id.toString(),
        title: m.title,
        originalTitle: m.originalTitle || "",
        description: m.description || "",
        price: m.price,
        discountPrice: m.discountedPrice,
        year: new Date(m.releaseDate).getFullYear(),
        duration: m.duration || 0,
        director: m.director || "",
        language: m.language || "",
        country: m.country || "",
        resolution: m.resolution || "",
        ageLimit: m.ageLimit || "",
        poster: m.posterUrl || "", 
        backdrop: m.backdropUrl || "",
        trailer: m.trailerUrl || "",
        rating: m.imdbRating || 0,
        genres: m.genres ? m.genres.map((g: any) => g.name) : [],
       // C#'tan gelen Actors listesinin içinden sadece Name özelliklerini alıp dizi yapıyoruz
        cast: m.actors ? m.actors.map((a: any) => a.name) : [],
        
        // İŞTE EKSİK OLAN HAYAT KURTARICI KABLOLAR:
        // C#'tan "Türkçe, İngilizce" diye gelen metni, frontend'in beklediği diziye (Array) çeviriyoruz
        subtitles: m.subtitleLanguages ? m.subtitleLanguages.split(',').map((s: string) => s.trim()) : [],
        awards: [], // Detay sayfası çökmesin diye boş ödül dizisi
        status: m.isActive ? 'published' : 'draft' 
      }));

      // Gelen gerçek filmleri depoya yerleştir!
      set({ films: apiMovies });
      
    } catch (error) {
      console.error("API'den filmler çekilemedi. CORS ayarlarını veya API'nin açık olduğunu kontrol et:", error);
    }
  }
}));