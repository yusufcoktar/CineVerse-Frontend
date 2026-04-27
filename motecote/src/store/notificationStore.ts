import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'order' | 'film' | 'user' | 'refund' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const initialNotifications: Notification[] = [
  {
    id: 'n1',
    type: 'order',
    title: 'Yeni Sipariş',
    message: 'Mehmet Kara yeni bir sipariş verdi — ORD-091',
    read: false,
    createdAt: '2026-04-17T14:30:00',
  },
  {
    id: 'n2',
    type: 'film',
    title: 'Film Eklendi',
    message: '"Esaretin Bedeli" başarıyla yayınlandı',
    read: false,
    createdAt: '2026-04-17T13:15:00',
  },
  {
    id: 'n3',
    type: 'refund',
    title: 'İade Talebi',
    message: 'ORD-072 için iade talebi oluşturuldu',
    read: false,
    createdAt: '2026-04-17T11:00:00',
  },
  {
    id: 'n4',
    type: 'user',
    title: 'Yeni Kullanıcı',
    message: 'Zeynep Çelik sisteme kayıt oldu',
    read: true,
    createdAt: '2026-04-17T09:30:00',
  },
  {
    id: 'n5',
    type: 'system',
    title: 'Sistem Uyarısı',
    message: "Sunucu bakımı 18 Nisan 02:00'de yapılacak",
    read: true,
    createdAt: '2026-04-16T18:00:00',
  },
];

interface NotificationState {
  notifications: Notification[];
  unreadCount: () => number;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: initialNotifications,

  unreadCount: () => get().notifications.filter((n) => !n.read).length,

  addNotification: (n) =>
    set((s) => ({
      notifications: [
        {
          ...n,
          id: `n${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...s.notifications,
      ],
    })),

  markAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    })),

  deleteNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));
