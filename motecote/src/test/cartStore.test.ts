import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cartStore';
import { mockFilms } from '@/data/mockData';

const film0 = mockFilms[0];
const film1 = mockFilms[1];
const film0Price = film0.discountPrice ?? film0.price;
const film1Price = film1.discountPrice ?? film1.price;

describe('cartStore', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], coupon: null });
  });

  it('sepete film ekler', () => {
    const { addItem } = useCartStore.getState();
    addItem(film0);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].film.id).toBe(film0.id);
  });

  it('aynı filmi iki kez eklememeli', () => {
    const { addItem } = useCartStore.getState();
    addItem(film0);
    addItem(film0);
    expect(useCartStore.getState().items).toHaveLength(1);
  });

  it('sepetten film çıkarır', () => {
    const store = useCartStore.getState();
    store.addItem(film0);
    store.addItem(film1);
    useCartStore.getState().removeItem(film0.id);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].film.id).toBe(film1.id);
  });

  it('sepeti temizler', () => {
    const store = useCartStore.getState();
    store.addItem(film0);
    store.addItem(film1);
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('toplam fiyatı doğru hesaplar', () => {
    const store = useCartStore.getState();
    store.addItem(film0);
    store.addItem(film1);
    const total = useCartStore.getState().total();
    expect(total).toBeCloseTo(film0Price + film1Price, 1);
  });

  it('kupon kodu %10 indirim uygular', () => {
    const store = useCartStore.getState();
    store.addItem(film1);
    store.applyCoupon('CINEVERSE10');
    const total = useCartStore.getState().total();
    expect(total).toBeCloseTo(film1Price * 0.9, 1);
  });

  it('kupon kodu %20 indirim uygular', () => {
    const store = useCartStore.getState();
    store.addItem(film1);
    store.applyCoupon('CINEVERSE20');
    const total = useCartStore.getState().total();
    expect(total).toBeCloseTo(film1Price * 0.8, 1);
  });

  it('geçersiz kupon indirim uygulamaz', () => {
    const store = useCartStore.getState();
    store.addItem(film1);
    store.applyCoupon('INVALID');
    const total = useCartStore.getState().total();
    expect(total).toBeCloseTo(film1Price, 1);
  });

  it('item count doğru döner', () => {
    const store = useCartStore.getState();
    store.addItem(film0);
    store.addItem(film1);
    store.addItem(mockFilms[2]);
    expect(useCartStore.getState().itemCount()).toBe(3);
  });
});
