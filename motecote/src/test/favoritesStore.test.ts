import { describe, it, expect, beforeEach } from 'vitest';
import { useFavoritesStore } from '@/store/favoritesStore';
import { mockFilms } from '@/data/mockData';

const film0 = mockFilms[0];
const film1 = mockFilms[1];

describe('favoritesStore', () => {
  beforeEach(() => {
    useFavoritesStore.setState({ favorites: [] });
  });

  it('başlangıçta favoriler boş', () => {
    expect(useFavoritesStore.getState().favorites).toHaveLength(0);
  });

  it('addFavorite film ekler', () => {
    useFavoritesStore.getState().addFavorite(film0);
    expect(useFavoritesStore.getState().favorites).toHaveLength(1);
  });

  it('aynı film iki kez eklenmez (addFavorite)', () => {
    useFavoritesStore.getState().addFavorite(film0);
    useFavoritesStore.getState().addFavorite(film0);
    expect(useFavoritesStore.getState().favorites).toHaveLength(1);
  });

  it('removeFavorite filmi çıkarır', () => {
    useFavoritesStore.getState().addFavorite(film0);
    useFavoritesStore.getState().addFavorite(film1);
    useFavoritesStore.getState().removeFavorite(film0.id);
    expect(useFavoritesStore.getState().favorites).toHaveLength(1);
    expect(useFavoritesStore.getState().favorites[0].id).toBe(film1.id);
  });

  it('isFavorite favorideyse true döner', () => {
    useFavoritesStore.getState().addFavorite(film0);
    expect(useFavoritesStore.getState().isFavorite(film0.id)).toBe(true);
  });

  it('isFavorite favoride değilse false döner', () => {
    expect(useFavoritesStore.getState().isFavorite(film1.id)).toBe(false);
  });

  it('toggleFavorite ekler (yokken)', () => {
    useFavoritesStore.getState().toggleFavorite(film0);
    expect(useFavoritesStore.getState().isFavorite(film0.id)).toBe(true);
  });

  it('toggleFavorite çıkarır (varken)', () => {
    useFavoritesStore.getState().addFavorite(film0);
    useFavoritesStore.getState().toggleFavorite(film0);
    expect(useFavoritesStore.getState().isFavorite(film0.id)).toBe(false);
  });

  it('toggleFavorite ardı ardına çağrılırsa değişimler doğru', () => {
    useFavoritesStore.getState().toggleFavorite(film0); // ekle
    useFavoritesStore.getState().toggleFavorite(film0); // çıkar
    useFavoritesStore.getState().toggleFavorite(film0); // tekrar ekle
    expect(useFavoritesStore.getState().isFavorite(film0.id)).toBe(true);
  });
});
