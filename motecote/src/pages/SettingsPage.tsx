import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, LogOut, Trash2, Shield, ChevronRight, Check, XCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

type Section = 'profile' | 'email' | 'password' | 'danger';

export default function SettingsPage() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [success, setSuccess] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile (Veritabanından çekilen gerçek veriler)
  const [displayName, setDisplayName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  
  // Email Update Form
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Password Update Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Delete Account
  const [deleteConfirm, setDeleteConfirm] = useState('');

  // Bildirim gösterme fonksiyonları
  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(''), 4000);
  };

  // --- 1. SAYFA AÇILDIĞINDA GERÇEK BİLGİLERİ ÇEK ---
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token') || useAuthStore.getState().token;
        const response = await axios.get('https://localhost:7041/api/Auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDisplayName(response.data.username);
        setProfileEmail(response.data.email);
      } catch (error) {
        console.error("Profil bilgileri çekilemedi:", error);
      }
    };
    fetchProfileData();
  }, []);

  // --- 2. E-POSTA GÜNCELLEME İŞLEMİ ---
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !emailPassword) {
      showError('Lütfen tüm alanları doldurun.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('https://localhost:7041/api/Auth/update-email', 
        { newEmail: newEmail, currentPassword: emailPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showSuccess('E-posta adresiniz başarıyla güncellendi.');
      setProfileEmail(newEmail); // Ekranda görünen profili de anında güncelle
      setNewEmail('');
      setEmailPassword('');
    } catch (error: any) {
      showError(error.response?.data || 'E-posta güncellenirken bir hata oluştu.');
    }
  };

  // --- 3. ŞİFRE GÜNCELLEME İŞLEMİ ---
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      showError('Yeni şifreler birbiriyle eşleşmiyor.');
      return;
    }
    if (newPassword.length < 6) {
      showError('Yeni şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.put('https://localhost:7041/api/Auth/update-password', 
        { currentPassword: currentPassword, newPassword: newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showSuccess('Şifreniz başarıyla güncellendi.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      showError(error.response?.data || 'Şifre güncellenirken bir hata oluştu.');
    }
  };

  // --- 4. HESAP SİLME İŞLEMİ ---
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'SİL') return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete('https://localhost:7041/api/Auth/delete-account', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // SQL'den silindikten sonra tarayıcıdan da atıyoruz
      logout();
      localStorage.removeItem('token');
      navigate('/');
    } catch (error: any) {
      showError(error.response?.data || 'Hesap silinirken bir hata oluştu.');
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const sections: { key: Section; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profil Bilgileri', icon: User },
    { key: 'email', label: 'E-posta Güncelle', icon: Mail },
    { key: 'password', label: 'Şifre Değiştir', icon: Lock },
    { key: 'danger', label: 'Hesap İşlemleri', icon: Shield },
  ];

  const inputClass = 'w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white outline-none placeholder:text-text-muted transition-colors focus:border-accent-purple/50 focus:bg-white/[0.06]';

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-8 font-heading text-3xl text-white">Hesap Ayarları</h1>

      <div className="fixed top-24 right-4 z-50 flex flex-col gap-2">
        {/* Success toast */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400 ring-1 ring-green-500/20 backdrop-blur-md shadow-lg"
            >
              <Check size={16} />
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error toast */}
        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="flex items-center gap-2 rounded-xl bg-accent-red/10 px-4 py-3 text-sm font-medium text-accent-red ring-1 ring-accent-red/20 backdrop-blur-md shadow-lg"
            >
              <XCircle size={16} />
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {/* Sidebar */}
        <nav className="w-full flex-shrink-0 space-y-1 md:w-56">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
                activeSection === s.key
                  ? 'bg-accent-purple/10 text-accent-purple'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white'
              }`}
            >
              <s.icon size={18} />
              {s.label}
              <ChevronRight size={14} className="ml-auto opacity-50" />
            </button>
          ))}

          <div className="my-3 border-t border-white/5" />

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-text-muted hover:bg-white/5 hover:text-accent-red transition-colors"
          >
            <LogOut size={18} />
            Oturumu Kapat
          </button>
        </nav>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-xl"
          >
            {/* Profile */}
            {activeSection === 'profile' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Profil Bilgileri</h2>
                  <p className="mt-1 text-sm text-text-muted">Kayıtlı hesap bilgileriniz</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Ad Soyad (Kullanıcı Adı)</label>
                  <input
                    type="text"
                    value={displayName}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                  <p className="mt-1 text-xs text-text-muted">Güvenlik nedeniyle kullanıcı adı değiştirilemez.</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">E-posta</label>
                  <input
                    type="email"
                    value={profileEmail}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                  <p className="mt-1 text-xs text-text-muted">E-posta değişikliği için yandaki "E-posta Güncelle" sekmesini kullanın.</p>
                </div>
              </div>
            )}

            {/* Email */}
            {activeSection === 'email' && (
              <form onSubmit={handleUpdateEmail} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">E-posta Güncelle</h2>
                  <p className="mt-1 text-sm text-text-muted">Mevcut e-posta: <span className="text-white font-medium">{profileEmail}</span></p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Yeni E-posta</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="yeni@mail.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Güvenlik Doğrulaması (Mevcut Şifre)</label>
                  <input
                    type="password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-accent-red to-accent-purple px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-accent-red/20"
                >
                  E-postayı Güncelle
                </button>
              </form>
            )}

            {/* Password */}
            {activeSection === 'password' && (
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Şifre Değiştir</h2>
                  <p className="mt-1 text-sm text-text-muted">Hesap şifrenizi güncelleyin</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Mevcut Şifre</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Yeni Şifre</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-text-muted">En az 6 karakter</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Yeni Şifre Tekrar</label>
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-accent-red to-accent-purple px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-accent-red/20"
                >
                  Şifreyi Güncelle
                </button>
              </form>
            )}

            {/* Danger Zone */}
            {activeSection === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Hesap İşlemleri</h2>
                  <p className="mt-1 text-sm text-text-muted">Oturumu kapat veya hesabını kalıcı olarak sil</p>
                </div>

                {/* Logout */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Oturumu Kapat</p>
                      <p className="text-sm text-text-muted">Güvenli bir şekilde çıkış yapın</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-sm text-text-secondary hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <LogOut size={16} />
                      Çıkış Yap
                    </button>
                  </div>
                </div>

                {/* Delete Account */}
                <div className="rounded-xl border border-accent-red/20 bg-accent-red/5 p-4">
                  <p className="font-medium text-accent-red">Hesabı Sil</p>
                  <p className="mt-1 text-sm text-text-muted">Bu işlem geri alınamaz. Tüm siparişleriniz ve verileriniz kalıcı olarak silinecektir.</p>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder='Onaylamak için "SİL" yazın'
                      className="flex-1 rounded-lg border border-accent-red/20 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-text-muted focus:border-accent-red/50"
                    />
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirm !== 'SİL'}
                      className="flex items-center gap-2 rounded-lg bg-accent-red px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-30 hover:bg-accent-red/90"
                    >
                      <Trash2 size={16} />
                      Hesabı Sil
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}