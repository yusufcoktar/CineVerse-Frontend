import { useState } from 'react';

/* Modül seviyesinde hesaplanır — render'dan bağımsız, stabil */
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${Math.random() * 100}%`,
  duration: 6 + Math.random() * 4,
  delay: i * 0.5,
}));
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, UserPlus, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

/* Floating orb */
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

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Tüm alanları doldurun');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }
    setLoading(true);
    setError('');
    // Mock register — uses login
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('Kayıt başarısız');
    }
  };

  const inputClass = (_field: string) =>
    `w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-white outline-none placeholder:text-text-muted transition-colors focus:border-accent-purple/50 focus:bg-white/[0.06]`;

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
        {PARTICLES.slice(0, 15).map((p, i) => (
          <Particle key={i} delay={p.delay} left={p.left} duration={p.duration} />
        ))}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-accent-purple/20 via-accent-red/20 to-accent-gold/20 blur-xl" />

        <div className="relative rounded-3xl border border-white/10 bg-bg-primary/80 p-8 shadow-2xl backdrop-blur-2xl">
          {/* Logo */}
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
            <h1 className="font-heading text-3xl text-white">Kayıt Ol</h1>
            <p className="flex items-center gap-1 text-sm text-text-muted">
              <Sparkles size={14} className="text-accent-gold" />
              Sinema dünyasına katıl
            </p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Ad Soyad</label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'name' ? 'ring-2 ring-accent-purple/50 shadow-lg shadow-accent-purple/10' : ''}`}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="Adınız Soyadınız"
                  className={inputClass('name')}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">E-posta</label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'email' ? 'ring-2 ring-accent-purple/50 shadow-lg shadow-accent-purple/10' : ''}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="ornek@mail.com"
                  className={inputClass('email')}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Şifre</label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'password' ? 'ring-2 ring-accent-purple/50 shadow-lg shadow-accent-purple/10' : ''}`}>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className={inputClass('password')}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">Şifre Tekrar</label>
              <div className={`relative rounded-xl transition-all duration-300 ${focused === 'confirm' ? 'ring-2 ring-accent-purple/50 shadow-lg shadow-accent-purple/10' : ''}`}>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  className={inputClass('confirm')}
                />
              </div>
            </div>

            <motion.button
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
                  <UserPlus size={18} />
                  Kayıt Ol
                </>
              )}
            </motion.button>

            <p className="text-center text-sm text-text-muted">
              Zaten hesabın var mı?{' '}
              <Link to="/login" className="text-accent-purple hover:text-accent-red transition-colors font-medium">
                Giriş Yap
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
