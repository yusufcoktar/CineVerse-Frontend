import { create } from 'zustand';
import type { Comment } from '@/types';

const mockComments: Comment[] = [
  {
    id: 'c1',
    filmId: '278',
    userId: 'u1',
    userName: 'Ahmet Yılmaz',
    text: 'Hayatımda izlediğim en iyi filmlerden biri. Morgan Freeman ve Tim Robbins inanılmaz!',
    rating: 10,
    createdAt: '2026-04-10T14:30:00',
    adminReply: 'Teşekkürler Ahmet! Kesinlikle bir başyapıt 🎬',
    adminRepliedAt: '2026-04-11T09:00:00',
  },
  {
    id: 'c2',
    filmId: '278',
    userId: 'u2',
    userName: 'Zeynep Kara',
    text: 'Umut temalı filmlerin en güzeli. Her izleyişte farklı detaylar keşfediyorum.',
    rating: 9,
    createdAt: '2026-04-12T10:15:00',
  },
  {
    id: 'c3',
    filmId: '238',
    userId: 'u3',
    userName: 'Mehmet Demir',
    text: 'Baba filmi efsane! Marlon Brando\'nun performansı tarihe geçti.',
    rating: 9,
    createdAt: '2026-04-08T18:00:00',
    adminReply: 'Klasiklerin klasiği, haklısınız Mehmet!',
    adminRepliedAt: '2026-04-09T10:00:00',
  },
  {
    id: 'c4',
    filmId: '278',
    userId: 'u4',
    userName: 'Elif Yıldız',
    text: 'Hapishanede bile özgürlüğün var olabileceğini gösteren muhteşem bir hikaye.',
    rating: 9,
    createdAt: '2026-04-05T20:00:00',
  },
  {
    id: 'c5',
    filmId: '238',
    userId: 'u5',
    userName: 'Can Öztürk',
    text: 'Sinema tarihinin en önemli filmlerinden. Al Pacino da harika.',
    rating: 10,
    createdAt: '2026-04-13T16:00:00',
  },
  {
    id: 'c6',
    filmId: '278',
    userId: 'u6',
    userName: 'Selin Aydın',
    text: 'Finale kadar nefes kesen bir deneyim. Kesinlikle izlenmeli!',
    rating: 8,
    createdAt: '2026-04-14T12:00:00',
  },
  {
    id: 'c7',
    filmId: '238',
    userId: 'u1',
    userName: 'Ahmet Yılmaz',
    text: 'Don Corleone karakteri sinema tarihinin en ikonik karakterlerinden.',
    rating: 10,
    createdAt: '2026-04-15T09:30:00',
  },
];

interface CommentState {
  comments: Comment[];
  addComment: (filmId: string, userId: string, userName: string, text: string, rating: number) => void;
  deleteComment: (commentId: string) => void;
  replyToComment: (commentId: string, reply: string) => void;
  getFilmComments: (filmId: string) => Comment[];
}

export const useCommentStore = create<CommentState>((set, get) => ({
  comments: mockComments,

  addComment: (filmId, userId, userName, text, rating) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      filmId,
      userId,
      userName,
      text,
      rating,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ comments: [newComment, ...s.comments] }));
  },

  deleteComment: (commentId) => {
    set((s) => ({ comments: s.comments.filter((c) => c.id !== commentId) }));
  },

  replyToComment: (commentId, reply) => {
    set((s) => ({
      comments: s.comments.map((c) =>
        c.id === commentId
          ? { ...c, adminReply: reply, adminRepliedAt: new Date().toISOString() }
          : c
      ),
    }));
  },

  getFilmComments: (filmId) => {
    return get().comments.filter((c) => c.filmId === filmId);
  },
}));
