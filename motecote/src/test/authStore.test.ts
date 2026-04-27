import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/store/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('başlangıçta kullanıcı giriş yapmamış olmalı', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('login başarılı olmalı', async () => {
    const { login } = useAuthStore.getState();
    const result = await login('ali@example.com', 'password');
    expect(result).toBe(true);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.name).toBe('Ali Yılmaz');
    expect(state.token).toBe('mock-jwt-token');
  });

  it('logout kullanıcıyı temizlemeli', async () => {
    const store = useAuthStore.getState();
    await store.login('ali@example.com', 'password');
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });
});
