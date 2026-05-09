import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // 1. EKLENEN: Zustand'ın hafıza aracını içeri alıyoruz
import type { CartItem, Film } from '@/types';

interface CartState {
  items: CartItem[];
  coupon: string | null;
  addItem: (film: Film) => void;
  removeItem: (filmId: string) => void;
  clear: () => void;
  applyCoupon: (code: string) => void;
  removeCoupon: () => void;
  total: () => number;
  itemCount: () => number;
}

// 2. EKLENEN: create<CartState>() kısmından sonra persist() sarmalayıcısını ekliyoruz
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (film) =>
        set((state) => {
          // 🔥 ÇİFT EKLENMEYİ ÖNLEYEN GÜVENLİK DUVARI:
          const existing = state.items.find((i) => i.film.id === film.id);
          if (existing) {
             // Zaten sepetteyse hiçbir şey yapmadan mevcut listeyi geri dön.
             return state; 
          }
          return { items: [...state.items, { film, quantity: 1 }] };
        }),

      removeItem: (filmId) =>
        set((state) => ({
          items: state.items.filter((i) => i.film.id !== filmId),
        })),

      clear: () => set({ items: [], coupon: null }),

      applyCoupon: (code) => {
        const valid = ['CINEVERSE10', 'CINEVERSE20'];
        if (valid.includes(code)) set({ coupon: code });
      },
      removeCoupon: () => set({ coupon: null }),

      total: () => {
        const { items, coupon } = get();
        const subtotal = items.reduce((sum, item) => {
          const price = item.film.discountPrice ?? item.film.price;
          return sum + price * item.quantity;
        }, 0);
        if (coupon === 'CINEVERSE10') return subtotal * 0.9;
        if (coupon === 'CINEVERSE20') return subtotal * 0.8;
        return subtotal;
      },

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'cineverse-cart-storage', // 3. EKLENEN: Tarayıcının hafızasına bu isimle kaydedilecek
    }
  )
);