import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({ chatOpen: false, cartDrawerOpen: false });
  });

  it('chat toggle çalışmalı', () => {
    useUIStore.getState().toggleChat();
    expect(useUIStore.getState().chatOpen).toBe(true);
    useUIStore.getState().toggleChat();
    expect(useUIStore.getState().chatOpen).toBe(false);
  });

  it('cart drawer toggle çalışmalı', () => {
    useUIStore.getState().toggleCartDrawer();
    expect(useUIStore.getState().cartDrawerOpen).toBe(true);
    useUIStore.getState().toggleCartDrawer();
    expect(useUIStore.getState().cartDrawerOpen).toBe(false);
  });

  it('closeChat chat panelini kapatmalı', () => {
    useUIStore.setState({ chatOpen: true });
    useUIStore.getState().closeChat();
    expect(useUIStore.getState().chatOpen).toBe(false);
  });

  it('closeCartDrawer sepet panelini kapatmalı', () => {
    useUIStore.setState({ cartDrawerOpen: true });
    useUIStore.getState().closeCartDrawer();
    expect(useUIStore.getState().cartDrawerOpen).toBe(false);
  });
});
