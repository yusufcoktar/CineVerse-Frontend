import { create } from 'zustand';
import axios from 'axios'; // API'ye istek atmak için ekledik

// 1. C#'tan gelecek olan kullanıcımızın şablonu
interface User {
  id: string | number; 
  username: string;    
  email?: string;      // İşte eksik olan kritik parça!
  avatar?: string;
  role: string;        
}

// 2. Senin kurduğun mükemmel State arayüzü (Hiç dokunmadık)
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// 3. C#'tan gelen o upuzun JWT pasaportunu okuyup çözen mekanizma
const decodeToken = (token: string): User | null => {
  try {
    const payload = token.split('.')[1];
    const decodedJson = atob(payload);
    const decoded = JSON.parse(decodedJson);
    
    // C# Claim'lerini yakalıyoruz
    return {
      id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      username: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"],
      role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
    };
  } catch (error) {
    console.error("Pasaport (Token) çözülemedi:", error);
    return null;
  }
};

// 4. Sayfa yenilendiğinde hafızadaki pasaportu kontrol et
const storedToken = localStorage.getItem('token');

export const useAuthStore = create<AuthState>((set) => ({
  token: storedToken,
  user: storedToken ? decodeToken(storedToken) : null,
  isAuthenticated: !!storedToken,

  // --- ARTIK SAHTE DEĞİL, GERÇEK GİRİŞ İŞLEMİ ---
  login: async (email: string, password: string): Promise<boolean> => {
    try {
      // 1. C# Backend'imize e-posta ve şifreyi gönderiyoruz
      const response = await axios.post('https://localhost:7041/api/Auth/login', {
        email: email,
        password: password
      });

      // 2. Giriş başarılıysa ve C# bize token'ı verdiyse:
      if (response.status === 200 && response.data.token) {
        const token = response.data.token;
        
        // 3. Tarayıcı hafızasına (Cüzdana) kaydet
        localStorage.setItem('token', token);
        
        // 4. Depoyu güncelle ve giriş yapıldığını bildir
        set({
          token: token,
          user: decodeToken(token),
          isAuthenticated: true,
        });
        
        return true; // İşlem başarılı
      }
      return false; // Token gelmediyse başarısız
    } catch (error) {
      console.error("Giriş yapılırken hata oluştu:", error);
      return false; // Hatalı şifre/email durumu
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },
}));