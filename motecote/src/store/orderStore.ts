import { create } from 'zustand';
import type { Order } from '@/types';
import { mockOrders } from '@/data/mockData';

interface OrderState {
  orders: Order[];
  fetchOrders: () => Promise<void>;
  addOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],

  fetchOrders: async () => {
    await new Promise((r) => setTimeout(r, 300));
    set({ orders: mockOrders });
  },

  addOrder: (order) =>
    set((state) => ({ orders: [order, ...state.orders] })),
}));
