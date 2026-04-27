import { create } from 'zustand';

interface UIState {
  chatOpen: boolean;
  cartDrawerOpen: boolean;
  toggleChat: () => void;
  toggleCartDrawer: () => void;
  closeChat: () => void;
  closeCartDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  chatOpen: false,
  cartDrawerOpen: false,
  toggleChat: () => set((s) => ({ chatOpen: !s.chatOpen })),
  toggleCartDrawer: () => set((s) => ({ cartDrawerOpen: !s.cartDrawerOpen })),
  closeChat: () => set({ chatOpen: false }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),
}));
