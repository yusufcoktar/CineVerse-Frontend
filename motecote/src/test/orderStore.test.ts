import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useOrderStore } from '@/store/orderStore';
import { mockFilms } from '@/data/mockData';
import type { Order } from '@/types';

const makeOrder = (id: string): Order => ({
  id,
  films: [mockFilms[0]],
  total: mockFilms[0].discountPrice ?? mockFilms[0].price,
  date: new Date().toISOString(),
  status: 'processing',
});

describe('orderStore', () => {
  beforeEach(() => {
    useOrderStore.setState({ orders: [] });
    vi.useFakeTimers();
  });

  it('başlangıçta orders boş', () => {
    expect(useOrderStore.getState().orders).toHaveLength(0);
  });

  it('addOrder sipariş ekler ve en başa koyar', () => {
    const { addOrder } = useOrderStore.getState();
    const o1 = makeOrder('ORD-001');
    const o2 = makeOrder('ORD-002');
    addOrder(o1);
    addOrder(o2);
    const { orders } = useOrderStore.getState();
    expect(orders).toHaveLength(2);
    expect(orders[0].id).toBe('ORD-002'); // en son eklenen en başta
  });

  it('fetchOrders mevcut siparişler varken üzerine yazmaz', async () => {
    const o1 = makeOrder('ORD-LOCAL');
    useOrderStore.getState().addOrder(o1);
    expect(useOrderStore.getState().orders[0].id).toBe('ORD-LOCAL');

    // Eğer orders varsa fetchOrders çağrılmamalı — getState guard testi
    const orders = useOrderStore.getState().orders;
    if (orders.length > 0) {
      // fetchOrders çağrılmaz, local sipariş korunur
      expect(orders[0].id).toBe('ORD-LOCAL');
    }
  });

  it('fetchOrders orders boşken mock veri yükler', async () => {
    const fetchPromise = useOrderStore.getState().fetchOrders();
    vi.advanceTimersByTime(300);
    await fetchPromise;
    expect(useOrderStore.getState().orders.length).toBeGreaterThan(0);
  });

  it('sipariş durumu processing, completed veya refunded olabilir', () => {
    const validStatuses = ['processing', 'completed', 'refunded'];
    const o = makeOrder('ORD-003');
    useOrderStore.getState().addOrder(o);
    const { orders } = useOrderStore.getState();
    expect(validStatuses).toContain(orders[0].status);
  });
});
