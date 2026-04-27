import { create } from 'zustand';
import type { Film } from '@/types';

interface LibraryState {
  purchasedFilms: Film[];
  addFilm: (film: Film) => void;
  addFilms: (films: Film[]) => void;
  isOwned: (filmId: string) => boolean;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  purchasedFilms: [],

  addFilm: (film) =>
    set((s) => {
      if (s.purchasedFilms.some((f) => f.id === film.id)) return s;
      return { purchasedFilms: [...s.purchasedFilms, film] };
    }),

  addFilms: (films) =>
    set((s) => {
      const newFilms = films.filter((f) => !s.purchasedFilms.some((p) => p.id === f.id));
      if (newFilms.length === 0) return s;
      return { purchasedFilms: [...s.purchasedFilms, ...newFilms] };
    }),

  isOwned: (filmId) => get().purchasedFilms.some((f) => f.id === filmId),
}));
