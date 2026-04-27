import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cartStore';
import { mockFilms } from '@/data/mockData';

const film0 = mockFilms[0]; // discountPrice var
const film1 = mockFilms[1]; // discountPrice yok

describe('cartStore — edge cases', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], coupon: null });
  });

  it('geçersiz kupon kodu uygulanamaz', () => {
    useCartStore.getState().addItem(film0);
    useCartStore.getState().applyCoupon('YANLIS_KOD');
    expect(useCartStore.getState().coupon).toBeNull();
  });

  it('%20 kupon kodu doğru indirim uygular', () => {
    useCartStore.getState().addItem(film0);
    const basePrice = film0.discountPrice ?? film0.price;
    useCartStore.getState().applyCoupon('CINEVERSE20');
    const total = useCartStore.getState().total();
    expect(total).toBeCloseTo(basePrice * 0.8, 1);
  });

  it('boş sepette total 0', () => {
    expect(useCartStore.getState().total()).toBe(0);
  });

  it('boş sepette itemCount 0', () => {
    expect(useCartStore.getState().itemCount()).toBe(0);
  });

  it('itemCount birden fazla farklı film için doğru', () => {
    useCartStore.getState().addItem(film0);
    useCartStore.getState().addItem(film1);
    expect(useCartStore.getState().itemCount()).toBe(2);
  });

  it('total discountPrice varsa onu kullanır', () => {
    // film0 has discountPrice
    if (film0.discountPrice) {
      useCartStore.getState().addItem(film0);
      const total = useCartStore.getState().total();
      expect(total).toBeCloseTo(film0.discountPrice, 2);
    }
  });

  it('coupon clear ile temizlenir', () => {
    useCartStore.getState().addItem(film0);
    useCartStore.getState().applyCoupon('CINEVERSE10');
    useCartStore.getState().clear();
    expect(useCartStore.getState().coupon).toBeNull();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
