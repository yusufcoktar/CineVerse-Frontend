import { describe, it, expect, beforeEach } from 'vitest';
import { useFilmStore } from '@/store/filmStore';
import { mockFilms } from '@/data/mockData';
import type { Film } from '@/types';

const initialCount = mockFilms.length;

const newFilm: Film = {
  id: 'TEST-001',
  title: 'Test Filmi',
  originalTitle: 'Test Film',
  year: 2025,
  duration: 120,
  director: 'Test Yönetmen',
  cast: ['Oyuncu A'],
  genres: ['Dram'],
  rating: 7.5,
  price: 49.99,
  poster: 'https://example.com/poster.jpg',
  backdrop: 'https://example.com/backdrop.jpg',
  description: 'Test açıklaması',
  language: 'Türkçe',
  country: 'Türkiye',
  resolution: 'HD',
  subtitles: ['Türkçe'],
  ageRating: '13+',
  awards: [],
  status: 'published',
};

describe('filmStore', () => {
  beforeEach(() => {
    useFilmStore.setState({ films: [...mockFilms] });
  });

  it('başlangıçta mockFilms yüklü', () => {
    expect(useFilmStore.getState().films).toHaveLength(initialCount);
  });

  it('addFilm yeni filmi başa ekler', () => {
    useFilmStore.getState().addFilm(newFilm);
    const { films } = useFilmStore.getState();
    expect(films).toHaveLength(initialCount + 1);
    expect(films[0].id).toBe('TEST-001');
  });

  it('updateFilm alanı günceller, diğerlerini bozmaz', () => {
    const targetId = mockFilms[0].id;
    useFilmStore.getState().updateFilm(targetId, { price: 99.99, status: 'draft' });
    const updated = useFilmStore.getState().films.find((f) => f.id === targetId);
    expect(updated?.price).toBe(99.99);
    expect(updated?.status).toBe('draft');
    // Diğer alanlar bozulmadı
    expect(updated?.title).toBe(mockFilms[0].title);
  });

  it('updateFilm olmayan id ile hiçbir şey değiştirmez', () => {
    const before = useFilmStore.getState().films.map((f) => f.id);
    useFilmStore.getState().updateFilm('NO-SUCH-ID', { price: 1 });
    const after = useFilmStore.getState().films.map((f) => f.id);
    expect(after).toEqual(before);
  });

  it('deleteFilm filmi siler', () => {
    const targetId = mockFilms[0].id;
    useFilmStore.getState().deleteFilm(targetId);
    const { films } = useFilmStore.getState();
    expect(films).toHaveLength(initialCount - 1);
    expect(films.find((f) => f.id === targetId)).toBeUndefined();
  });

  it('getFilm mevcut filmi döner', () => {
    const target = mockFilms[2];
    const found = useFilmStore.getState().getFilm(target.id);
    expect(found).toBeDefined();
    expect(found?.title).toBe(target.title);
  });

  it('getFilm olmayan id için undefined döner', () => {
    expect(useFilmStore.getState().getFilm('NO-ID')).toBeUndefined();
  });

  it('rating alanı 0 ile 10 arasında', () => {
    useFilmStore.getState().films.forEach((f) => {
      expect(f.rating).toBeGreaterThanOrEqual(0);
      expect(f.rating).toBeLessThanOrEqual(10);
    });
  });

  it('discountPrice varsa price\'dan küçük olmalı', () => {
    useFilmStore.getState().films.forEach((f) => {
      if (f.discountPrice !== undefined) {
        expect(f.discountPrice).toBeLessThan(f.price);
      }
    });
  });
});
