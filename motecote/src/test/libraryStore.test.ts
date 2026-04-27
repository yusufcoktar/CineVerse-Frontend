import { describe, it, expect, beforeEach } from 'vitest';
import { useLibraryStore } from '@/store/libraryStore';
import { mockFilms } from '@/data/mockData';

const film0 = mockFilms[0];
const film1 = mockFilms[1];
const film2 = mockFilms[2];

describe('libraryStore', () => {
  beforeEach(() => {
    useLibraryStore.setState({ purchasedFilms: [] });
  });

  it('başlangıçta kütüphane boş', () => {
    expect(useLibraryStore.getState().purchasedFilms).toHaveLength(0);
  });

  it('addFilm tek film ekler', () => {
    useLibraryStore.getState().addFilm(film0);
    expect(useLibraryStore.getState().purchasedFilms).toHaveLength(1);
    expect(useLibraryStore.getState().purchasedFilms[0].id).toBe(film0.id);
  });

  it('aynı film iki kez eklenmez (addFilm)', () => {
    useLibraryStore.getState().addFilm(film0);
    useLibraryStore.getState().addFilm(film0);
    expect(useLibraryStore.getState().purchasedFilms).toHaveLength(1);
  });

  it('addFilms birden fazla film ekler', () => {
    useLibraryStore.getState().addFilms([film0, film1, film2]);
    expect(useLibraryStore.getState().purchasedFilms).toHaveLength(3);
  });

  it('addFilms zaten olan filmleri tekrar eklemez', () => {
    useLibraryStore.getState().addFilm(film0);
    useLibraryStore.getState().addFilms([film0, film1]);
    expect(useLibraryStore.getState().purchasedFilms).toHaveLength(2);
  });

  it('isOwned film varsa true döner', () => {
    useLibraryStore.getState().addFilm(film0);
    expect(useLibraryStore.getState().isOwned(film0.id)).toBe(true);
  });

  it('isOwned film yoksa false döner', () => {
    expect(useLibraryStore.getState().isOwned(film1.id)).toBe(false);
  });

  it('addFilms boş dizi ile state değişmez', () => {
    useLibraryStore.getState().addFilm(film0);
    const before = useLibraryStore.getState().purchasedFilms;
    useLibraryStore.getState().addFilms([]);
    expect(useLibraryStore.getState().purchasedFilms).toEqual(before);
  });
});
