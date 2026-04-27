import { create } from 'zustand';
import type { Film } from '@/types';

interface FavoritesState {
  favorites: Film[];
  addFavorite: (film: Film) => void;
  removeFavorite: (filmId: string) => void;
  isFavorite: (filmId: string) => boolean;
  toggleFavorite: (film: Film) => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  addFavorite: (film) => {
    set((s) => {
      if (s.favorites.some((f) => f.id === film.id)) return s;
      return { favorites: [...s.favorites, film] };
    });
  },

  removeFavorite: (filmId) => {
    set((s) => ({ favorites: s.favorites.filter((f) => f.id !== filmId) }));
  },

  isFavorite: (filmId) => {
    return get().favorites.some((f) => f.id === filmId);
  },

  toggleFavorite: (film) => {
    const { favorites } = get();
    if (favorites.some((f) => f.id === film.id)) {
      set({ favorites: favorites.filter((f) => f.id !== film.id) });
    } else {
      set({ favorites: [...favorites, film] });
    }
  },
}));
