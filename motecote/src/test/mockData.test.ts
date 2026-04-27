import { describe, it, expect } from 'vitest';
import { mockFilms, mockOrders, genres, moods } from '@/data/mockData';

describe('mockData', () => {
  it('filmler doğru formatta olmalı', () => {
    expect(mockFilms.length).toBeGreaterThan(0);
    mockFilms.forEach((film) => {
      expect(film.id).toBeDefined();
      expect(film.title).toBeTruthy();
      expect(film.price).toBeGreaterThan(0);
      expect(film.rating).toBeGreaterThanOrEqual(0);
      expect(film.rating).toBeLessThanOrEqual(10);
      expect(film.genres.length).toBeGreaterThan(0);
      expect(film.cast.length).toBeGreaterThan(0);
    });
  });

  it('indirimli fiyat normal fiyattan düşük olmalı', () => {
    mockFilms
      .filter((f) => f.discountPrice !== undefined)
      .forEach((film) => {
        expect(film.discountPrice!).toBeLessThan(film.price);
      });
  });

  it('siparişler doğru formatta olmalı', () => {
    expect(mockOrders.length).toBeGreaterThan(0);
    mockOrders.forEach((order) => {
      expect(order.id).toBeTruthy();
      expect(order.items.length).toBeGreaterThan(0);
      expect(order.total).toBeGreaterThan(0);
      expect(['processing', 'completed', 'refunded']).toContain(order.status);
    });
  });

  it('tüm türler tanımlı olmalı', () => {
    expect(genres.length).toBe(10);
    genres.forEach((g) => {
      expect(g.name).toBeTruthy();
      expect(g.icon).toBeTruthy();
    });
  });

  it('ruh halleri tanımlı olmalı', () => {
    expect(moods.length).toBe(6);
    moods.forEach((m) => {
      expect(m.label).toBeTruthy();
      expect(m.genres.length).toBeGreaterThan(0);
    });
  });
});
