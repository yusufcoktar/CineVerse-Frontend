import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Temel API bağlantımız
const api = axios.create({
  baseURL: 'https://localhost:7041/api', // C# portun farklıysa burayı düzelt
});

// Her istek (request) gitmeden önce buraya uğrar
api.interceptors.request.use(
  (config) => {
    // 1. Token'ı güvenli bir şekilde bulmaya çalış
    const authState = useAuthStore.getState() as any;
    let token = authState.token || localStorage.getItem('token');

    // 2. Eğer token yoksa Zustand'ın kalıcı belleğine bak
    if (!token) {
      const persistData = localStorage.getItem('auth-storage'); // Kendi auth store ismine göre değişebilir
      if (persistData) {
        try {
          token = JSON.parse(persistData)?.state?.token;
        } catch (e) {
          console.error("Token parse hatası");
        }
      }
    }

    // 3. Token bulunduysa tırnaklarını temizle ve Header'a tak!
    if (token) {
      const cleanToken = token.replace(/^"|"$/g, '');
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;