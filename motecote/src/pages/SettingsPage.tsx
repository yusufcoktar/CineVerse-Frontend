import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, LogOut, Trash2, Shield, ChevronRight, Check } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

type Section = 'profile' | 'email' | 'password' | 'danger';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [success, setSuccess] = useState('');

  // Profile
  const [displayName, setDisplayName] = useState(user?.username || '');
  
  // Email
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Delete
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess('Profil güncellendi');
  };

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !emailPassword) return;
    showSuccess('E-posta güncellendi');
    setNewEmail('');
    setEmailPassword('');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmNewPassword) return;
    if (newPassword !== confirmNewPassword) return;
    if (newPassword.length < 6) return;
    showSuccess('Şifre güncellendi');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirm !== 'SİL') return;
    logout();
    navigate('/');
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

      {/* Success toast */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400 ring-1 ring-green-500/20"
          >
            <Check size={16} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

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
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            {/* Profile */}
            {activeSection === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">Profil Bilgileri</h2>
                  <p className="mt-1 text-sm text-text-muted">Görünen adınızı güncelleyin</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Ad Soyad</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">E-posta</label>
                <input
                    type="email"
                    value={user ? "Gizli E-posta (Güvenlik için gizlendi)" : "kullanici@cineverse.com"}
                    disabled
                    className={`${inputClass} opacity-50 cursor-not-allowed`}
                  />
                  <p className="mt-1 text-xs text-text-muted">E-posta değişikliği için "E-posta Güncelle" bölümünü kullanın</p>
                </div>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-accent-red to-accent-purple px-6 py-2.5 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-accent-red/20"
                >
                  Kaydet
                </button>
              </form>
            )}

            {/* Email */}
            {activeSection === 'email' && (
              <form onSubmit={handleUpdateEmail} className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">E-posta Güncelle</h2>
                  <p className="mt-1 text-sm text-text-muted">E-posta adresinizi değiştirin</p>
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
                  <label className="mb-1.5 block text-sm font-medium text-text-secondary">Mevcut Şifre</label>
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
                  <p className="mt-1 text-sm text-text-muted">Oturumu kapat veya hesabını sil</p>
                </div>

                {/* Logout */}
                <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-white">Oturumu Kapat</p>
                      <p className="text-sm text-text-muted">Tüm oturumlardan çıkış yap</p>
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
                  <p className="mt-1 text-sm text-text-muted">Bu işlem geri alınamaz. Tüm verileriniz silinecektir.</p>
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
