export interface Film {
  id: string;
  title: string;
  originalTitle: string;
  year: number;
  duration: number; // dakika
  director: string;
  cast: string[];
  genres: Genre[];
  rating: number; // 0-10
  price: number;
  discountPrice?: number;
  discountEnds?: string;
  poster: string;
  backdrop: string;
  trailerUrl?: string;
  description: string;
  language: string;
  country: string;
  resolution: '4K' | 'HD' | 'SD';
  subtitles: string[];
  ageRating: string;
  awards: Award[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export type Genre =
  | 'Aksiyon'
  | 'Dram'
  | 'Komedi'
  | 'Bilim Kurgu'
  | 'Korku'
  | 'Romantik'
  | 'Gerilim'
  | 'Animasyon'
  | 'Belgesel'
  | 'Macera';

export interface Award {
  name: string;
  year: number;
  category: string;
}

export interface CartItem {
  film: Film;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'processing' | 'completed' | 'refunded';
  createdAt: string;
  paymentMethod: string;
}

export interface User {
  id: string | number; // C# tarafında ID'miz int (sayı) olduğu için number da ekledik
  username: string;    // 'name' kelimesini C# modelimizdeki gibi 'username' yaptık!
  email?: string;      // Hata ihtimaline karşı opsiyonel (?) yapabiliriz
  avatar?: string;
  role: string;        // C#'tan gelen yetkilerle esnek çalışması için genel string yaptık
  loyaltyPoints?: number; // C# modelimizde henüz bu yok, hata vermemesi için opsiyonel (?) yaptık
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  filmCard?: Film;
}

export interface Comment {
  id: string;
  filmId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  rating: number;
  createdAt: string;
  adminReply?: string;
  adminRepliedAt?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  traceId: string;
}
