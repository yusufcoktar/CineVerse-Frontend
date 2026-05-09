import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Film, Search, User, Menu, X, Library, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react'; // 🔥 SİHİRLİ DOKUNUŞ 1: useEffect eklendi
import { useAuthStore } from '@/store/authStore';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from 'framer-motion';
import { useCartStore } from '@/store/cartStore';
import { useFavoritesStore } from '@/store/favoritesStore';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // AuthStore'dan gerekli parçaları çekiyoruz
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const itemCount = useCartStore((s) => s.itemCount());
  
  // 🔥 SİHİRLİ DOKUNUŞ 2: Favorileri getirme fonksiyonunu store'dan çekiyoruz
  const fetchFavorites = useFavoritesStore((s) => s.fetchFavorites);

  const prefersReduced = useReducedMotion();
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (v) => setScrolled(v > 80));

  // 🔥 SİHİRLİ DOKUNUŞ 3: Kullanıcı girişliyse ve sayfa yenilendiyse favorileri hemen SQL'den getir!
  useEffect(() => {
    if (isAuthenticated) {
      fetchFavorites();
    }
  }, [isAuthenticated, fetchFavorites]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/explore?q=${encodeURIComponent(q)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    // 1. Kullanıcıyı sistemden çıkar (Token silme vb.)
    logout(); 
   
    // 2. Sepeti temizle (Zaten yapıyordun)
    useCartStore.getState().clear();
   
    // 3. Favorileri temizle ki başka hesaba geçmesin!
    useFavoritesStore.getState().clearFavorites(); 
   
    // 4. Giriş sayfasına yönlendir
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Anasayfa' },
    { to: '/explore', label: 'Keşfet' },
    { to: '/favorites', label: 'Beğeniler' },
    { to: '/cart', label: 'Sepetim' },
    { to: '/orders', label: 'Siparişlerim' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      className="fixed left-0 right-0 top-0 z-50 border-b border-white/5"
      animate={prefersReduced ? undefined : {
        height: scrolled ? 56 : 64,
        backdropFilter: scrolled ? 'blur(20px)' : 'blur(12px)',
        backgroundColor: scrolled ? 'rgba(10,10,15,0.85)' : 'rgba(10,10,15,0.6)',
      }}
      style={prefersReduced ? { backgroundColor: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)' } : undefined}
      transition={{ duration: 0.25 }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Film className="text-accent-red" size={28} />
          <span className="font-heading text-xl text-accent-red">CineVerse</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`relative text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'text-accent-red'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {link.label}
              {link.to === '/cart' && itemCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Search + Actions */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="hidden items-center rounded-lg bg-white/5 px-3 md:flex">
            <button type="submit" className="flex items-center">
              <Search size={16} className="text-text-muted" />
            </button>
            <input
              type="text"
              placeholder="Film ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 bg-transparent px-2 py-2 text-sm text-white placeholder-text-muted outline-none"
            />
          </form>

          <Link
            to="/library"
            className="relative rounded-lg p-2 transition-colors hover:bg-white/5 hidden md:block"
          >
            <Library size={20} className={isActive('/library') ? 'text-accent-red' : 'text-text-secondary'} />
          </Link>

          <div className="hidden md:flex items-center gap-3 ml-2">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-4">
                
                {/* ADMİN BUTONU BAŞLANGIÇ */}
                {user.role === 'Admin' && (
                  <Link to="/admin" className="rounded-lg bg-accent-red/20 px-3 py-1.5 text-xs font-bold text-accent-red ring-1 ring-accent-red/30 hover:bg-accent-red/30 transition-colors">
                    Admin Paneli
                  </Link>
                )}
                {/* ADMİN BUTONU BİTİŞ */}

                <Link to="/settings" className="flex items-center gap-2 text-sm font-medium text-white hover:text-accent-red transition-colors">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-red/20 text-accent-red">
                    <User size={16} />
                  </div>
                  <span className="hidden lg:block">Hoş geldin, <span className="font-bold">{user.username}</span></span>
                </Link>
                <button 
                  onClick={handleLogout}
                  title="Çıkış Yap"
                  className="text-text-muted hover:text-accent-red transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 border-l border-white/10 pl-4">
                <Link to="/login" className="text-sm font-medium text-white hover:text-accent-red transition-colors">
                  Giriş Yap
                </Link>
                <Link to="/register" className="rounded-lg bg-accent-red px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-red/90 hover:shadow-lg hover:shadow-accent-red/20">
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobil Menü Açma Butonu */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 transition-colors hover:bg-white/5 md:hidden"
            aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5 bg-[#0a0a0f] md:hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              {isAuthenticated && user ? (
                <div className="mb-2 flex flex-col gap-2 rounded-lg bg-white/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-red/20 text-accent-red">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-text-muted">Hoş geldin,</p>
                        <p className="text-sm font-bold text-white">{user.username}</p>
                      </div>
                    </div>
                    <Link to="/settings" onClick={() => setMobileOpen(false)} className="text-xs text-accent-red">Ayarlar</Link>
                  </div>
                  
                  {user.role === 'Admin' && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="mt-2 flex justify-center rounded-lg bg-accent-red/20 py-2 text-xs font-bold text-accent-red ring-1 ring-accent-red/30">
                      Admin Paneline Git
                    </Link>
                  )}
                </div>
              ) : (
                <div className="mb-2 grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex justify-center rounded-lg bg-white/5 px-4 py-2 text-sm text-white">Giriş Yap</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="flex justify-center rounded-lg bg-accent-red px-4 py-2 text-sm text-white">Kayıt Ol</Link>
                </div>
              )}

             {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-4 py-2 text-sm ${
                    isActive(link.to) ? 'bg-accent-red/10 text-accent-red' : 'text-text-secondary'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.to === '/cart' && itemCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-red text-[10px] font-bold text-white">
                      {itemCount}
                    </span>
                  )}
                </Link>
              ))}
              
              <div className="mt-2 flex items-center rounded-lg bg-white/5 px-3">
                <Search size={16} className="text-text-muted" />
                <input
                  type="text"
                  placeholder="Film ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-2 py-2 text-sm text-white placeholder-text-muted outline-none"
                />
              </div>

              {isAuthenticated && (
                <button 
                  onClick={handleLogout}
                  className="mt-2 flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-accent-red hover:bg-accent-red/10"
                >
                  <LogOut size={16} /> Çıkış Yap
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}