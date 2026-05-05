import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, LogIn, Sparkles, X, Mail, Key, Lock } from 'lucide-react'; // 🔥 Yeni ikonlar eklendi

/* Modül seviyesinde hesaplanır — render'dan bağımsız, stabil */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  duration: 6 + Math.random() * 4,
  delay: i * 0.5,
}));

/* Floating orb component */
function FloatingOrb({ delay, size, x, y, color }: { delay: number; size: number; x: string; y: string; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full blur-3xl"
      style={{ width: size, height: size, left: x, top: y, background: color }}
      animate={{
        y: [0, -30, 10, -20, 0],
        x: [0, 15, -10, 20, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        opacity: [0.3, 0.5, 0.3, 0.6, 0.3],
      }}
      transition={{ duration: 8, repeat: Infinity, delay, ease: 'easeInOut' }}
    />
  );
}

/* Particle */
function Particle({ delay, left, duration }: { delay: number; left: string; duration: number }) {
  return (
    <motion.div
      className="absolute h-1 w-1 rounded-full bg-accent-gold/60"
      style={{ left }}
      initial={{ y: '100vh', opacity: 0 }}
      animate={{ y: '-10vh', opacity: [0, 1, 1, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: 'linear' }}
    />
  );
}

export default function LoginPage() {
  // Giriş Yapma State'leri
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  
  // --- 🔥 ŞİFREMİ UNUTTUM STATE'LERİ ---
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); // 1: Email İste, 2: Kod ve Yeni Şifre İste
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';

  // --- GİRİŞ YAPMA FONKSİYONU ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Tüm alanları doldurun');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('https://localhost:7041/api/Auth/login', {
        email: email,
        password: password
      });

      const token = response.data.token;
      localStorage.setItem('token', token);
      
      navigate(from, { replace: true });
      window.location.reload();

    } catch (err: any) {
      setError(err.response?.data || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  // --- 🔥 1. ADIM: KOD GÖNDERME FONKSİYONU ---
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Lütfen e-posta adresinizi girin.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    setForgotSuccess('');

    try {
      await axios.post('https://localhost:7041/api/Auth/forgot-password', { email: forgotEmail });
      setForgotSuccess('Doğrulama kodu e-postanıza gönderildi!');
      setTimeout(() => {
        setForgotSuccess('');
        setForgotStep(2); // 2. Adıma (Kod girme) geçiş
      }, 2000);
    } catch (err: any) {
      setForgotError(err.response?.data || 'E-posta gönderilirken bir hata oluştu.');
    } finally {
      setForgotLoading(false);
    }
  };

  // --- 🔥 2. ADIM: YENİ ŞİFREYİ KAYDETME FONKSİYONU ---
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotCode || !forgotNewPassword) {
      setForgotError('Lütfen kodu ve yeni şifrenizi girin.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotError('Yeni şifre en az 6 karakter olmalıdır.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      await axios.post('https://localhost:7041/api/Auth/reset-password', {
        email: forgotEmail,
        code: forgotCode,
        newPassword: forgotNewPassword
      });

      setForgotSuccess('Şifreniz başarıyla yenilendi! Giriş yapabilirsiniz.');
      setTimeout(() => {
        // Modal'ı kapat ve her şeyi sıfırla
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotCode('');
        setForgotNewPassword('');
        setForgotSuccess('');
        // Giriş kısmına email'i otomatik yaz
        setEmail(forgotEmail);
      }, 3000);
    } catch (err: any) {
      setForgotError(err.response?.data || 'Kod doğrulanamadı veya süresi dolmuş.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotError('');
    setForgotSuccess('');
    setForgotStep(1);
  };

  return (
    <div className="relative flex min-h-[100vh] items-center justify-center overflow-hidden px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 -z-10">
        <FloatingOrb delay={0} size={400} x="10%" y="20%" color="rgba(162,89,255,0.24)" />
        <FloatingOrb delay={2} size={300} x="70%" y="10%" color="rgba(255,60,110,0.12)" />
        <FloatingOrb delay={4} size={250} x="50%" y="60%" color="rgba(255,215,0,0.08)" />
        <FloatingOrb delay={1} size={200} x="80%" y="70%" color="rgba(162,89,255,0.16)" />
        <FloatingOrb delay={3} size={180} x="20%" y="80%" color="rgba(255,60,110,0.08)" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {PARTICLES.map((p, i) => (
          <Particle key={i} delay={p.delay} left={p.left} duration={p.duration} />
        ))}
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent-purple/20 via-accent-red/20 to-accent-gold/20 blur-xl" />

        <div className="relative rounded-3xl border border-white/10 bg-bg-primary/80 p-8 shadow-2xl backdrop-blur-2xl">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
            className="mx-auto mb-6 flex flex-col items-center gap-3"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border border-dashed border-accent-purple/30"
              />
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-red to-accent-purple shadow-lg shadow-accent-purple/30">
                <Film className="text-white" size={32} />
              </div>
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="font-heading text-3xl text-white"
            >
              CineVerse
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-1 text-sm text-text-muted"
            >
              <Sparkles size={14} className="text-accent-gold" />
              Sinema deneyimine devam et
            </motion.p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-xl bg-accent-red/10 px-4 py-2.5 text-sm text-accent-red ring-1 ring-accent-red/20"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">E-posta</label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'email' ? 'ring-2 ring-accent-purple/50 shadow-lg shadow-accent-purple/10' : ''}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="ornek@mail.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-white outline-none placeholder:text-text-muted transition-colors focus:border-accent-purple/50 focus:bg-white/[0.06]"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-text-secondary">Şifre</label>
                {/* 🔥 Şifremi Unuttum Butonu */}
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-accent-purple hover:text-accent-gold transition-colors"
                >
                  Şifremi Unuttum
                </button>
              </div>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'password' ? 'ring-2 ring-accent-purple/50 shadow-lg shadow-accent-purple/10' : ''}`}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-white outline-none placeholder:text-text-muted transition-colors focus:border-accent-purple/50 focus:bg-white/[0.06]"
                />
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(255,60,110,0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-accent-red to-accent-purple py-3.5 font-semibold text-white transition-all disabled:opacity-50"
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                />
              ) : (
                <>
                  <LogIn size={18} />
                  Giriş Yap
                </>
              )}
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center text-sm text-text-muted"
            >
              Hesabın yok mu?{' '}
              <Link to="/register" className="text-accent-purple hover:text-accent-red transition-colors font-medium">
                Kayıt Ol
              </Link>
            </motion.p>
          </form>
        </div>
      </motion.div>

      {/* 🔥 ŞİFREMİ UNUTTUM MODALI */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-bg-secondary p-6 shadow-2xl"
            >
              <button 
                onClick={closeForgotModal}
                className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <div className="mb-6 flex flex-col items-center text-center mt-2">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-purple/20 text-accent-purple ring-1 ring-accent-purple/30">
                  <Key size={24} />
                </div>
                <h3 className="font-heading text-xl text-white">Şifremi Unuttum</h3>
                <p className="mt-1 text-sm text-text-muted">
                  {forgotStep === 1 
                    ? "E-postanızı girin, size doğrulama kodu gönderelim." 
                    : "Mailinize gelen kodu ve yeni şifrenizi girin."}
                </p>
              </div>

              {/* Hata ve Başarı Mesajları */}
              <AnimatePresence>
                {forgotError && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 rounded-xl bg-accent-red/10 px-4 py-3 text-sm text-accent-red ring-1 ring-accent-red/20">
                    {forgotError}
                  </motion.div>
                )}
                {forgotSuccess && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400 ring-1 ring-green-500/20">
                    {forgotSuccess}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 1. ADIM: E-POSTA İSTE */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">E-posta Adresi</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Kayıtlı e-posta adresiniz"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-text-muted focus:border-accent-purple/50 focus:bg-white/[0.06] transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex w-full justify-center items-center rounded-xl bg-gradient-to-r from-accent-purple to-violet-600 py-3 text-sm font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {forgotLoading ? "Gönderiliyor..." : "Kodu Gönder"}
                  </button>
                </form>
              )}

              {/* 2. ADIM: KOD VE YENİ ŞİFRE İSTE */}
              {forgotStep === 2 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">6 Haneli Doğrulama Kodu</label>
                    <input
                      type="text"
                      maxLength={6}
                      value={forgotCode}
                      onChange={(e) => setForgotCode(e.target.value.replace(/\D/g, ''))} // Sadece sayı girmesine izin ver
                      placeholder="Örn: 123456"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 px-4 text-center text-lg tracking-[0.5em] font-mono text-white outline-none placeholder:text-text-muted focus:border-accent-gold/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-text-secondary">Yeni Şifre</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="password"
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder="Yeni şifreniz (En az 6 karakter)"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-text-muted focus:border-accent-purple/50 focus:bg-white/[0.06] transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex w-full justify-center items-center rounded-xl bg-gradient-to-r from-accent-gold to-yellow-500 py-3 text-sm font-bold text-black transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {forgotLoading ? "Doğrulanıyor..." : "Şifreyi Yenile"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}