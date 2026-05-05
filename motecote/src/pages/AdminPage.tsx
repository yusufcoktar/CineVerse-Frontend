import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  LayoutDashboard, Film, Users, BarChart3, DollarSign,
  TrendingUp, ShoppingCart, Eye, Plus, LogOut, Menu, X, Settings,
  Mail, Lock, Trash2, Check, Search, ArrowUpRight, ArrowDownRight,
  Package, Star, Clock, Activity, Bell,
  Edit3, Archive, MoreHorizontal, Globe,
  Clapperboard, AlertTriangle, Download, MessageCircle, Send,
  Ban, UserMinus, FileText, Calendar,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCommentStore } from '@/store/commentStore';
import { useFilmStore } from '@/store/filmStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useOrderStore } from '@/store/orderStore';
import type { Film as FilmType } from '@/types';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  AreaChart, Area,
} from 'recharts';

/* ── Mock Data ─────────────────────────────────────────── */
const revenueData = [
  { name: 'Oca', revenue: 4500, previous: 3800 },
  { name: 'Şub', revenue: 5200, previous: 4200 },
  { name: 'Mar', revenue: 4800, previous: 5100 },
  { name: 'Nis', revenue: 7200, previous: 4900 },
  { name: 'May', revenue: 6100, previous: 5500 },
  { name: 'Haz', revenue: 8400, previous: 6200 },
  { name: 'Tem', revenue: 9100, previous: 7000 },
  { name: 'Ağu', revenue: 7800, previous: 7500 },
];

const dailyVisitors = [
  { day: 'Pzt', visitors: 320 },
  { day: 'Sal', visitors: 450 },
  { day: 'Çar', visitors: 380 },
  { day: 'Per', visitors: 520 },
  { day: 'Cum', visitors: 680 },
  { day: 'Cmt', visitors: 890 },
  { day: 'Paz', visitors: 750 },
];

const paymentData = [
  { name: 'Kredi Kartı', value: 55 },
  { name: 'Dijital Cüzdan', value: 25 },
  { name: 'IBAN', value: 20 },
];

const genreRevenueData = [
  { genre: 'Bilim Kurgu', revenue: 3200 },
  { genre: 'Dram', revenue: 2800 },
  { genre: 'Aksiyon', revenue: 2500 },
  { genre: 'Komedi', revenue: 1800 },
  { genre: 'Gerilim', revenue: 2100 },
  { genre: 'Animasyon', revenue: 1400 },
];

const recentActivity = [
  { type: 'order', text: 'Mehmet Kara yeni sipariş verdi', time: '2 dk önce', color: 'text-green-400' },
  { type: 'film', text: '"Inception" filmi eklendi', time: '15 dk önce', color: 'text-accent-purple' },
  { type: 'user', text: 'Yeni kullanıcı kaydı: Zeynep Ç.', time: '1 saat önce', color: 'text-blue-400' },
  { type: 'order', text: 'Sipariş ORD-089 tamamlandı', time: '2 saat önce', color: 'text-green-400' },
  { type: 'refund', text: 'ORD-072 iade talebi', time: '3 saat önce', color: 'text-accent-red' },
];

const COLORS = ['#FF3C6E', '#A259FF', '#FFD700', '#00D4AA', '#FF8C42', '#38BDF8'];

type Tab = 'dashboard' | 'films' | 'orders' | 'users' | 'comments' | 'analytics' | 'settings';

const chartTooltipStyle = {
  background: '#12121A',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12,
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
  padding: '10px 14px',
  fontSize: '13px',
};

/* ── Main Admin ────────────────────────────────────────── */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const films = useFilmStore((s) => s.films);

  const downloadReport = (type: 'monthly' | 'films' | 'users') => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR');
    let csvContent = '';
    let filename = '';
    if (type === 'monthly') {
      filename = `gelir-raporu-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`;
      csvContent = 'Ay,Gelir (₺),Sipariş,Ortalama Sepet (₺)\n';
      const months = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
      months.forEach((m) => {
        const rev = Math.floor(Math.random() * 8000 + 2000);
        const orders = Math.floor(Math.random() * 30 + 10);
        csvContent += `${m},${rev},${orders},${(rev / orders).toFixed(2)}\n`;
      });
    } else if (type === 'films') {
      filename = `film-performans-${dateStr.replace(/\./g, '-')}.csv`;
      csvContent = 'Film,Yönetmen,Fiyat (₺),İndirimli (₺),Puan,Durum\n';
      films.forEach((f) => {
        csvContent += `"${f.title}","${f.director}",${f.price},${f.discountPrice || '-'},${f.rating},${f.status}\n`;
      });
    } else {
      filename = `kullanici-raporu-${dateStr.replace(/\./g, '-')}.csv`;
      csvContent = 'Ad,E-posta,Sipariş Sayısı,Harcama,Durum\n';
      csvContent += 'Ali Yılmaz,ali@example.com,5,₺432,Aktif\n';
      csvContent += 'Ayşe Demir,ayse@example.com,3,₺289,Aktif\n';
      csvContent += 'Mehmet Kara,mehmet@example.com,8,₺756,Aktif\n';
    }
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'films', label: 'Film Yönetimi', icon: Film, badge: String(films.length) },
    { key: 'orders', label: 'Siparişler', icon: Package, badge: '2' },
    { key: 'users', label: 'Kullanıcılar', icon: Users },
    { key: 'comments', label: 'Yorumlar', icon: MessageCircle, badge: '4' },
    { key: 'analytics', label: 'Analitik', icon: BarChart3 },
    { key: 'settings', label: 'Ayarlar', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/[0.06] bg-bg-secondary/95 backdrop-blur-xl transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-white/[0.06] px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-red to-accent-red/70 shadow-lg shadow-accent-red/20">
              <Clapperboard size={18} className="text-white" />
            </div>
            <div>
              <span className="font-heading text-lg text-white">CineVerse</span>
              <p className="text-[10px] font-medium uppercase tracking-widest text-accent-purple">Admin Panel</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 hover:bg-white/5 lg:hidden">
            <X size={18} className="text-text-secondary" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
          {tabs.flatMap((tab) => {
            const tabBtn = (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-r from-accent-purple/15 to-accent-purple/5 text-white shadow-sm shadow-accent-purple/10'
                    : 'text-text-secondary hover:bg-white/[0.04] hover:text-white'
                }`}
              >
                <tab.icon
                  size={18}
                  className={activeTab === tab.key ? 'text-accent-purple' : 'text-text-muted group-hover:text-text-secondary'}
                />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge && (
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === tab.key ? 'bg-accent-purple/20 text-accent-purple' : 'bg-white/[0.06] text-text-muted'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
            const extras: React.JSX.Element[] = [];
            if (tab.key === 'films') {
              extras.push(
                <button
                  key="sidebar-film-ekle"
                  onClick={() => { navigate('/admin/film-ekle'); setSidebarOpen(false); }}
                  className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-accent-purple/80 hover:bg-accent-purple/10 hover:text-accent-purple transition-all duration-200"
                >
                  <div className="flex h-[18px] w-[18px] items-center justify-center rounded-md bg-accent-purple/20">
                    <Plus size={12} className="text-accent-purple" />
                  </div>
                  <span className="flex-1 text-left">Film Ekle</span>
                </button>
              );
            }
            if (tab.key === 'analytics') {
              extras.push(
                <button
                  key="sidebar-rapor"
                  onClick={() => downloadReport('monthly')}
                  className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-text-secondary hover:bg-accent-purple/10 hover:text-accent-purple transition-all duration-200"
                >
                  <Download size={18} className="text-accent-purple" />
                  <span className="flex-1 text-left">Rapor İndir</span>
                </button>
              );
            }
            return [...extras, tabBtn];
          })}
        </nav>
<div className="border-t border-white/[0.06] p-4 space-y-3">
  <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-purple/50 text-white font-bold">
      {/* name yerine username yazdık ve büyük harf garantisi verdik */}
      {user?.username?.charAt(0)?.toUpperCase() || 'A'}
    </div>
    <div className="flex-1 min-w-0">
      {/* name yerine username yazdık */}
      <p className="truncate text-sm font-medium text-white">{user?.username || 'Admin'}</p>
      <p className="truncate text-[11px] text-text-muted">{user?.email || 'admin@cineverse.com'}</p>
    </div>
  </div>
<button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-white/[0.03] hover:text-white"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </aside>  {/* <--- İŞTE EKSİK OLAN VEYA SİLİNEN KRİTİK KISIM BURASI */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex h-[72px] items-center justify-between border-b border-white/[0.06] bg-bg-primary/80 backdrop-blur-xl px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="rounded-lg p-2 hover:bg-white/5 lg:hidden">
              <Menu size={20} className="text-text-secondary" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">
                {tabs.find((t) => t.key === activeTab)?.label}
              </h1>
              <p className="text-xs text-text-muted">
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative rounded-xl bg-white/[0.04] p-2.5 transition-colors hover:bg-white/[0.08]"
              >
                <Bell size={18} className="text-text-secondary" />
                {unreadCount() > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent-red text-[9px] font-bold text-white">
                    {unreadCount()}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-12 z-50 w-96 rounded-2xl border border-white/[0.08] bg-bg-secondary/95 shadow-2xl backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                      <h3 className="font-semibold text-white">Bildirimler</h3>
                      {unreadCount() > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-accent-purple hover:text-accent-purple/80 transition-colors"
                        >
                          Tümünü okundu işaretle
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                          <Bell size={24} className="mx-auto mb-2 text-text-muted opacity-30" />
                          <p className="text-xs text-text-muted">Bildirim yok</p>
                        </div>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => markAsRead(n.id)}
                            className={`flex items-start gap-3 border-b border-white/[0.04] px-5 py-3.5 transition-colors cursor-pointer hover:bg-white/[0.03] ${
                              !n.read ? 'bg-accent-purple/[0.04]' : ''
                            }`}
                          >
                            <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                              n.type === 'order' ? 'bg-green-400' :
                              n.type === 'film' ? 'bg-accent-purple' :
                              n.type === 'user' ? 'bg-blue-400' :
                              n.type === 'refund' ? 'bg-accent-red' :
                              'bg-accent-gold'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-white">{n.title}</p>
                              <p className="text-[11px] text-text-muted mt-0.5 truncate">{n.message}</p>
                              <p className="text-[10px] text-text-muted mt-1">
                                {new Date(n.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                              className="shrink-0 rounded-lg p-1 text-text-muted opacity-0 group-hover:opacity-100 hover:bg-accent-red/10 hover:text-accent-red transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <span className="hidden sm:inline-flex rounded-full bg-accent-purple/15 px-3 py-1.5 text-xs font-semibold text-accent-purple ring-1 ring-accent-purple/20">
              Admin
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <DashboardTab />}
              {activeTab === 'films' && <FilmsTab />}
              {activeTab === 'orders' && <OrdersTab />}
              {activeTab === 'users' && <UsersTab />}
              {activeTab === 'comments' && <CommentsTab />}
              {activeTab === 'analytics' && <AnalyticsTab />}
              {activeTab === 'settings' && <AdminSettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD TAB
   ═══════════════════════════════════════════════════════════ */
function DashboardTab() {
  const films = useFilmStore((s) => s.films);
  const metrics = [
    { label: 'Toplam Gelir', value: '₺36.200', change: '+12.5%', up: true, icon: DollarSign, gradient: 'from-green-500/20 to-green-500/5', iconColor: 'text-green-400', ring: 'ring-green-500/10', desc: 'Tüm satışlardan elde edilen brüt gelir' },
    { label: 'Günlük Satış', value: '₺1.450', change: '+8.2%', up: true, icon: TrendingUp, gradient: 'from-accent-red/20 to-accent-red/5', iconColor: 'text-accent-red', ring: 'ring-accent-red/10', desc: 'Bugün gerçekleşen satışların toplamı' },
    { label: 'Toplam Film', value: String(films.length), change: '+3', up: true, icon: Film, gradient: 'from-accent-purple/20 to-accent-purple/5', iconColor: 'text-accent-purple', ring: 'ring-accent-purple/10', desc: 'Katalogdaki toplam film sayısı' },
    { label: 'Siparişler', value: '156', change: '+23%', up: true, icon: ShoppingCart, gradient: 'from-accent-gold/20 to-accent-gold/5', iconColor: 'text-accent-gold', ring: 'ring-accent-gold/10', desc: 'Toplam tamamlanan ve bekleyen siparişler' },
    { label: 'Ziyaretçi', value: '4.230', change: '-3.1%', up: false, icon: Eye, gradient: 'from-blue-500/20 to-blue-500/5', iconColor: 'text-blue-400', ring: 'ring-blue-500/10', desc: 'Bugünkü benzersiz ziyaretçi sayısı' },
    { label: 'Dönüşüm', value: '%3.7', change: '+0.5%', up: true, icon: Activity, gradient: 'from-cyan-500/20 to-cyan-500/5', iconColor: 'text-cyan-400', ring: 'ring-cyan-500/10', desc: 'Ziyaretçilerin satışa dönüşüm oranı' },
  ];

  return (
    <div className="space-y-8">
      {/* Live Indicator */}
      <motion.div
        className="flex items-center gap-2 text-xs text-text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.span
          className="h-2 w-2 rounded-full bg-green-400"
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        Canlı veriler güncelleniyor
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, scale: 0.88, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 24 }}
            whileHover={{ scale: 1.04, y: -2 }}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${m.gradient} p-5 ring-1 ${m.ring} transition-shadow`}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="rounded-xl bg-white/[0.08] p-2">
                <m.icon size={18} className={m.iconColor} />
              </div>
              <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${m.up ? 'text-green-400' : 'text-red-400'}`}>
                {m.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {m.change}
              </span>
            </div>
            <p className="font-mono text-2xl font-bold text-white">{m.value}</p>
            <p className="mt-1 text-[11px] text-text-muted">{m.label}</p>
            <p className="mt-1.5 text-[10px] leading-snug text-text-muted/60">{m.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Gelir Trendi</h3>
              <p className="text-xs text-text-muted">Bu yıl vs. Geçen yıl</p>
            </div>
            <div className="flex gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent-red" /> Bu Yıl</span>
              <span className="flex items-center gap-1.5 text-text-muted"><span className="h-2 w-2 rounded-full bg-white/20" /> Geçen Yıl</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF3C6E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#FF3C6E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="#6B6B80" fontSize={12} />
              <YAxis stroke="#6B6B80" fontSize={12} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="previous" stroke="rgba(255,255,255,0.15)" strokeWidth={2} fill="none" animationDuration={1200} animationEasing="ease-out" />
              <Area type="monotone" dataKey="revenue" stroke="#FF3C6E" strokeWidth={3} fill="url(#revenueGrad)" animationDuration={1500} animationEasing="ease-out" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-white">Son Aktiviteler</h3>
            <Clock size={16} className="text-text-muted" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.color.replace('text-', 'bg-')}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-secondary">{item.text}</p>
                  <p className="text-[11px] text-text-muted">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-white">En Çok Satan Filmler</h3>
            <button className="text-xs text-accent-purple hover:text-accent-purple/80 transition-colors">Tümünü Gör</button>
          </div>
          <div className="space-y-3">
            {films.slice(0, 5).map((film, i) => (
              <div key={film.id} className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/[0.03]">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold ${
                  i === 0 ? 'bg-accent-gold/20 text-accent-gold' :
                  i === 1 ? 'bg-white/10 text-white' :
                  i === 2 ? 'bg-amber-700/20 text-amber-600' :
                  'bg-white/5 text-text-muted'
                }`}>{i + 1}</span>
                <img src={film.poster} alt={film.title} className="h-11 w-8 rounded-lg object-cover ring-1 ring-white/10" />
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-white">{film.title}</p>
                  <p className="text-[11px] text-text-muted">{film.year} • {film.director}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-mono font-semibold text-white">{film.price.toFixed(2)} ₺</p>
                  <div className="flex items-center gap-1 text-[11px] text-accent-gold">
                    <Star size={10} fill="currentColor" />
                    {film.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Haftalık Ziyaretçi</h3>
              <p className="text-xs text-text-muted">Son 7 gün</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailyVisitors}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" stroke="#6B6B80" fontSize={12} />
              <YAxis stroke="#6B6B80" fontSize={12} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="visitors" radius={[8, 8, 0, 0]} animationDuration={1200} animationEasing="ease-out">
                {dailyVisitors.map((_entry, i) => (
                  <Cell key={i} fill={i === 5 ? '#FF3C6E' : 'rgba(162,89,255,0.5)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>


    </div>
  );
}
/* ═══════════════════════════════════════════════════════════
   FILMS TAB
   ═══════════════════════════════════════════════════════════ */
function FilmsTab() {
  const navigate = useNavigate();
  const { addNotification } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  // 1. DÜZENLEME: statusFilter'dan 'draft' kaldırıldı
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'archived'>('all');
  const [view] = useState<'table' | 'grid'>('table');
  const [editingFilm, setEditingFilm] = useState<FilmType | null>(null);
  const [editForm, setEditForm] = useState({ price: '', discountPrice: '', status: '' as string });
  
  // (deleteConfirm state'i tamamen silindi)

  const [dbFilms, setDbFilms] = useState<any[]>([]);

  const fetchRealFilms = async () => {
    try {
      const token = useAuthStore.getState().token || localStorage.getItem('token');
      const response = await axios.get('https://localhost:7041/api/Movies/AdminList', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const mappedData = response.data.map((m: any) => ({
        id: m.id,
        title: m.title,
        director: m.director || 'Bilinmiyor',
        year: m.releaseYear, 
        poster: m.posterUrl, 
        genres: m.genres ? m.genres.map((g: any) => g.name || g) : [],
        price: m.price,
        discountPrice: m.discountedPrice || undefined,
        rating: m.imdbRating,
        resolution: m.resolution || 'HD',
        status: m.isActive ? 'published' : 'archived' 
      }));
      
      setDbFilms(mappedData);
    } catch (error) {
      console.error("SQL'den admin filmleri çekilirken hata:", error);
    }
  };

  useEffect(() => {
    fetchRealFilms();
  }, []);

  const filtered = useMemo(() => {
    return dbFilms.filter((film) => {
      const matchSearch =
        film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        film.director.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'published' && film.status === 'published') ||
        (statusFilter === 'archived' && (film.status === 'archived' || film.status === 'Arşiv'));
        
      return matchSearch && matchStatus;
    });
  }, [dbFilms, searchQuery, statusFilter]);

  // 2. DÜZENLEME: 'draft' sayacı silindi
  const statusCounts = useMemo(() => ({
    all: dbFilms.length,
    published: dbFilms.filter((f) => f.status === 'published').length,
    archived: dbFilms.filter((f) => f.status === 'archived').length,
  }), [dbFilms]);

  const openEdit = (film: FilmType) => {
    setEditingFilm(film);
    setEditForm({
      price: film.price.toString(),
      discountPrice: film.discountPrice?.toString() || '',
      status: film.status,
    });
  };

  const saveEdit = async () => {
    if (!editingFilm) return;

    const newPrice = parseFloat(editForm.price) || editingFilm.price;
    const newDiscountPrice = editForm.discountPrice.trim() ? parseFloat(editForm.discountPrice) : null;
    
    let apiStatus = "Yayında";
    if (editForm.status === "archived") apiStatus = "Arşiv"; // Draft seçeneği kaldırıldı

    try {
      const token = useAuthStore.getState().token || localStorage.getItem('token'); 
      await axios.patch(`https://localhost:7041/api/Movies/QuickEdit/${editingFilm.id}`, 
        {
          price: newPrice,
          discountedPrice: newDiscountPrice,
          status: apiStatus
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      await fetchRealFilms(); 
      addNotification({ type: 'film', title: 'Başarılı', message: `"${editingFilm.title}" güncel verileri SQL'den çekildi!` });
      setEditingFilm(null);
    } catch (error) {
      console.error("C# Güncelleme hatası:", error);
      addNotification({ type: 'system', title: 'Bağlantı Hatası', message: 'Film güncellenirken bir hata oluştu.' });
    }
  };

  // (handleDelete fonksiyonu tamamen silindi)

  const handleArchive = async (film: any) => {
    try {
      const token = useAuthStore.getState().token;
      const newStatus = film.status === 'archived' || film.status === 'Arşiv' ? 'Yayında' : 'Arşiv';

      await axios.patch(`https://localhost:7041/api/Movies/QuickEdit/${film.id}`, 
        {
          price: film.price,
          status: newStatus
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchRealFilms();
      addNotification({ type: 'film', title: 'Durum Güncellendi', message: `Film ${newStatus} durumuna çekildi.` });
    } catch (error) {
      console.error("Durum güncelleme hatası:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* 3. DÜZENLEME: Üst sekmelerden draft silindi, kod sadeleştirildi */}
          {(['all', 'published', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-accent-red/15 text-accent-red ring-1 ring-accent-red/20'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'
              }`}
            >
              {status === 'all' ? 'Tümü' : status === 'published' ? 'Yayında' : 'Arşiv'}
              <span className="ml-1.5 opacity-60">{statusCounts[status]}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => navigate('/admin/film-ekle')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-red to-pink-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/25 transition-all hover:shadow-accent-red/40 hover:brightness-110"
        >
          <Plus size={16} />
          Yeni Film Ekle
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Film veya yönetmen ara..."
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-text-muted transition-colors focus:border-accent-purple/40 focus:bg-white/[0.05]"
          />
        </div>
        {/* Arama çubuğunun yanındaki GEREKSİZ (kopya) filtre butonları tamamen silindi! */}
      </div>

      <p className="text-xs text-text-muted">{filtered.length} film bulundu</p>

      {view === 'table' ? (
        <div className="overflow-x-auto rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Film</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Tür</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Fiyat</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Puan</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Çözünürlük</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Durum</th>
                <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">İşlem</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
              {filtered.map((film, i) => (
                <motion.tr
                  key={film.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: i * 0.03 }}
                  className="group border-b border-white/[0.04] transition-colors hover:bg-white/[0.03]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={film.poster} alt={film.title} className="h-14 w-10 rounded-lg object-cover ring-1 ring-white/10 transition-transform group-hover:scale-105" />
                      <div>
                        <p className="font-semibold text-white">{film.title}</p>
                        <p className="text-[11px] text-text-muted">{film.year} • {film.director}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {film.genres.map((g : string) => (
                        <span key={g} className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] text-text-secondary">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {film.discountPrice ? (
                      <div>
                        <p className="font-mono font-semibold text-accent-red">{film.discountPrice.toFixed(2)} ₺</p>
                        <p className="font-mono text-[11px] text-text-muted line-through">{film.price.toFixed(2)} ₺</p>
                      </div>
                    ) : (
                      <p className="font-mono font-semibold text-white">{film.price.toFixed(2)} ₺</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-accent-gold" fill="#FFD700" />
                      <span className="font-mono text-white">{film.rating}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                      film.resolution === '4K' ? 'bg-accent-gold/15 text-accent-gold' :
                      film.resolution === 'HD' ? 'bg-blue-500/15 text-blue-400' :
                      'bg-white/[0.06] text-text-muted'
                    }`}>{film.resolution}</span>
                  </td>
                  
                  {/* 4. DÜZENLEME: Durum göstergesi Yayında/Arşiv olarak sabitlendi */}
                  <td className="px-5 py-4">
                    <div className="flex items-center">
                      {film.status === 'published' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-semibold text-green-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                          Yayında
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-text-muted">
                          <span className="h-1.5 w-1.5 rounded-full bg-text-muted"></span>
                          Arşiv
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 5. DÜZENLEME: Çöp Kutusu (Trash) butonu tamamen silindi */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(film)} className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-accent-purple">
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => {
                          if(window.confirm(`"${film.title}" filminin durumunu değiştirmek istediğinize emin misiniz?`)) {
                            handleArchive(film);
                          }
                        }} 
                        className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-accent-gold"
                      >
                        <Archive size={14} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((film, i) => (
            <motion.div
              key={film.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group relative overflow-hidden rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06] transition-all hover:ring-white/[0.12]"
            >
              <div className="aspect-[2/3] overflow-hidden">
                <img src={film.poster} alt={film.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="mb-1 flex items-center gap-1">
                  <Star size={10} className="text-accent-gold" fill="#FFD700" />
                  <span className="text-[11px] font-semibold text-white">{film.rating}</span>
                  <span className={`ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold ${
                    film.resolution === '4K' ? 'bg-accent-gold/30 text-accent-gold' :
                    film.resolution === 'HD' ? 'bg-blue-500/30 text-blue-400' :
                    'bg-white/20 text-white'
                  }`}>{film.resolution}</span>
                </div>
                <p className="truncate text-sm font-semibold text-white">{film.title}</p>
                <p className="text-[11px] text-text-muted">{film.year} • {film.director}</p>
                <p className="mt-1 font-mono text-sm font-bold text-accent-red">{(film.discountPrice || film.price).toFixed(2)} ₺</p>
              </div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => openEdit(film)} className="rounded-lg bg-black/60 p-1.5 backdrop-blur-sm hover:bg-black/80">
                  <Edit3 size={12} className="text-white" />
                </button>
                {/* Izgara görünümündeki (Grid) çöp kutusu da silindi */}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingFilm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setEditingFilm(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-bg-secondary p-6 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <img src={editingFilm.poster} alt={editingFilm.title} className="h-16 w-12 rounded-lg object-cover ring-1 ring-white/10" />
                <div>
                  <h3 className="font-semibold text-white">{editingFilm.title}</h3>
                  <p className="text-xs text-text-muted">{editingFilm.year} • {editingFilm.director}</p>
                </div>
                <button onClick={() => setEditingFilm(null)} className="ml-auto rounded-lg p-1.5 hover:bg-white/5">
                  <X size={18} className="text-text-muted" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-muted">Fiyat (₺)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-text-muted focus:border-accent-purple/40 focus:ring-1 focus:ring-accent-purple/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-muted">İndirimli Fiyat (₺) <span className="text-text-muted/50">— Boş bırakılırsa indirim kaldırılır</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.discountPrice}
                    onChange={(e) => setEditForm({ ...editForm, discountPrice: e.target.value })}
                    placeholder="Opsiyonel"
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-text-muted focus:border-accent-purple/40 focus:ring-1 focus:ring-accent-purple/20"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-text-muted">Durum</label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-accent-purple/40 focus:ring-1 focus:ring-accent-purple/20"
                  >
                    {/* 6. DÜZENLEME: Modal içindeki select menüsünden 'Taslak' kaldırıldı */}
                    <option value="published" className="bg-bg-secondary">Yayında</option>
                    <option value="archived" className="bg-bg-secondary">Arşiv</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button onClick={() => setEditingFilm(null)} className="rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-text-secondary hover:bg-white/[0.1] transition-colors">
                  İptal
                </button>
                <button onClick={saveEdit} className="rounded-xl bg-gradient-to-r from-accent-purple to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/25 hover:shadow-accent-purple/40 hover:brightness-110 transition-all">
                  Kaydet
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. DÜZENLEME: Delete Confirm Modal (Arşivleme Modalı) tamamen silindi! */}
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════
   ORDERS TAB
   ═══════════════════════════════════════════════════════════ */
function OrdersTab() {
  const { orders, fetchOrders } = useOrderStore();
  const { addNotification } = useNotificationStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'refunded'>('all');
  const [actionMenu, setActionMenu] = useState<string | null>(null);

  useEffect(() => {
    // Mount'ta bir kez kontrol et — kasıtlı boş dep array; Zustand getState ile stale closure yok
    if (useOrderStore.getState().orders.length === 0) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const orderStats = [
    { label: 'Toplam Sipariş', value: String(orders.length), icon: Package, color: 'text-accent-purple', bg: 'bg-accent-purple/10' },
    { label: 'Tamamlanan', value: String(orders.filter((o) => o.status === 'completed').length), icon: Check, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'İşlemde', value: String(orders.filter((o) => o.status === 'processing').length), icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'İade', value: String(orders.filter((o) => o.status === 'refunded').length), icon: ArrowDownRight, color: 'text-accent-red', bg: 'bg-accent-red/10' },
  ];

  const changeStatus = (orderId: string, newStatus: 'completed' | 'processing' | 'refunded') => {
    const store = useOrderStore.getState();
    const updated = store.orders.map((o) =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    useOrderStore.setState({ orders: updated });
    const statusLabels = { completed: 'Tamamlandı', processing: 'İşlemde', refunded: 'İade Edildi' };
    addNotification({ type: 'order', title: 'Sipariş Güncellendi', message: `${orderId} durumu: ${statusLabels[newStatus]}` });
    setActionMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {orderStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06]"
          >
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${s.bg}`}>
              <s.icon size={18} className={s.color} />
            </div>
            <p className="font-mono text-2xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h3 className="font-semibold text-white">Sipariş Listesi</h3>
          <div className="flex items-center gap-2">
            {(['all', 'completed', 'processing', 'refunded'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-accent-red/15 text-accent-red ring-1 ring-accent-red/20'
                    : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'
                }`}
              >
                {s === 'all' ? 'Tümü' : s === 'completed' ? 'Tamamlanan' : s === 'processing' ? 'İşlemde' : 'İade'}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Sipariş No</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Ürünler</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Tutar</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Ödeme</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Durum</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Tarih</th>
                <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-text-muted">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-text-muted">Sipariş bulunamadı</td>
                </tr>
              ) : allOrders.map((order) => (
                <tr key={order.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                  <td className="px-6 py-4 font-mono font-semibold text-white">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex -space-x-2">
                      {order.items.map((item, idx) => (
                        <img key={idx} src={item.film.poster} alt={item.film.title} className="h-8 w-6 rounded border-2 border-bg-secondary object-cover" title={item.film.title} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-accent-gold">{order.total.toFixed(2)} ₺</td>
                  <td className="px-6 py-4 text-text-secondary">{order.paymentMethod}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      order.status === 'completed' ? 'bg-green-500/15 text-green-400' :
                      order.status === 'processing' ? 'bg-yellow-500/15 text-yellow-400' :
                      'bg-accent-red/15 text-accent-red'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        order.status === 'completed' ? 'bg-green-400' :
                        order.status === 'processing' ? 'bg-yellow-400' : 'bg-accent-red'
                      }`} />
                      {order.status === 'completed' ? 'Tamamlandı' : order.status === 'processing' ? 'İşlemde' : 'İade'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-text-muted">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setActionMenu(actionMenu === order.id ? null : order.id)}
                        className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/[0.06] hover:text-white"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {actionMenu === order.id && (
                        <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-white/[0.08] bg-bg-secondary/95 py-1 shadow-2xl backdrop-blur-xl">
                          {order.status !== 'completed' && (
                            <button onClick={() => changeStatus(order.id, 'completed')} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-green-400 hover:bg-white/[0.04]">
                              <Check size={13} /> Tamamlandı İşaretle
                            </button>
                          )}
                          {order.status !== 'processing' && (
                            <button onClick={() => changeStatus(order.id, 'processing')} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-yellow-400 hover:bg-white/[0.04]">
                              <Clock size={13} /> İşlemde İşaretle
                            </button>
                          )}
                          {order.status !== 'refunded' && (
                            <button onClick={() => changeStatus(order.id, 'refunded')} className="flex w-full items-center gap-2 px-4 py-2.5 text-xs text-accent-red hover:bg-white/[0.04]">
                              <ArrowDownRight size={13} /> İade Et
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   USERS TAB
   ═══════════════════════════════════════════════════════════ */
function UsersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const { addNotification } = useNotificationStore();
  const [userList, setUserList] = useState([
    { name: 'Ali Yılmaz', email: 'ali@example.com', orders: 5, spent: '₺432', date: '10 Nis 2026', status: 'Aktif' as 'Aktif' | 'Engelli' | 'Yeni' },
    { name: 'Ayşe Demir', email: 'ayse@example.com', orders: 3, spent: '₺289', date: '08 Nis 2026', status: 'Aktif' as const },
    { name: 'Mehmet Kara', email: 'mehmet@example.com', orders: 8, spent: '₺756', date: '05 Nis 2026', status: 'Aktif' as const },
    { name: 'Zeynep Çelik', email: 'zeynep@example.com', orders: 2, spent: '₺145', date: '01 Nis 2026', status: 'Aktif' as const },
    { name: 'Emre Öztürk', email: 'emre@example.com', orders: 12, spent: '₺1.289', date: '28 Mar 2026', status: 'Aktif' as const },
    { name: 'Selin Aydın', email: 'selin@example.com', orders: 0, spent: '₺0', date: '15 Nis 2026', status: 'Yeni' as const },
  ]);

  const filtered = userList.filter(
    (u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const banUser = (email: string) => {
    setUserList((prev) =>
      prev.map((u) =>
        u.email === email
          ? { ...u, status: (u.status === 'Engelli' ? 'Aktif' : 'Engelli') as 'Aktif' | 'Engelli' | 'Yeni' }
          : u
      )
    );
    const user = userList.find((u) => u.email === email);
    if (user) {
      const isBanning = user.status !== 'Engelli';
      addNotification({ type: 'user', title: isBanning ? 'Kullanıcı Engellendi' : 'Engel Kaldırıldı', message: `${user.name} ${isBanning ? 'engellendi' : 'engeli kaldırıldı'}` });
    }
  };

  const removeUser = (email: string) => {
    const user = userList.find((u) => u.email === email);
    setUserList((prev) => prev.filter((u) => u.email !== email));
    if (user) {
      addNotification({ type: 'user', title: 'Kullanıcı Silindi', message: `${user.name} sistemden kaldırıldı` });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Toplam Kullanıcı', value: '2.847', icon: Users, gradient: 'from-accent-purple/20 to-accent-purple/5' },
          { label: 'Bu Ay Yeni', value: '186', icon: TrendingUp, gradient: 'from-green-500/20 to-green-500/5' },
          { label: 'Aktif Kullanıcı', value: '1.432', icon: Activity, gradient: 'from-blue-500/20 to-blue-500/5' },
          { label: 'Ort. Harcama', value: '₺312', icon: DollarSign, gradient: 'from-accent-gold/20 to-accent-gold/5' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl bg-gradient-to-br ${s.gradient} p-5 ring-1 ring-white/[0.06]`}
          >
            <s.icon size={20} className="mb-2 text-white/40" />
            <p className="font-mono text-2xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-text-muted">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Kullanıcı ara..."
          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.03] py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-text-muted transition-colors focus:border-accent-purple/40"
        />
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white/[0.03] ring-1 ring-white/[0.06]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Kullanıcı</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Sipariş</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Harcama</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Kayıt</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">Durum</th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-text-muted">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u, i) => (
              <motion.tr
                key={u.email}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple/40 to-accent-red/40 text-xs font-bold text-white">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{u.name}</p>
                      <p className="text-[11px] text-text-muted">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-text-secondary">{u.orders}</td>
                <td className="px-6 py-4 font-mono font-semibold text-accent-gold">{u.spent}</td>
                <td className="px-6 py-4 text-text-muted">{u.date}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    u.status === 'Aktif' ? 'bg-green-500/15 text-green-400' : u.status === 'Engelli' ? 'bg-red-500/15 text-red-400' : 'bg-blue-500/15 text-blue-400'
                  }`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => banUser(u.email)}
                      title={u.status === 'Engelli' ? 'Engeli Kaldır' : 'Engelle'}
                      className={`rounded-lg p-1.5 transition-colors ${u.status === 'Engelli' ? 'text-green-400 hover:bg-green-500/10' : 'text-text-muted hover:bg-accent-gold/10 hover:text-accent-gold'}`}
                    >
                      <Ban size={14} />
                    </button>
                    <button
                      onClick={() => removeUser(u.email)}
                      title="Kullanıcıyı Sil"
                      className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-accent-red/10 hover:text-accent-red"
                    >
                      <UserMinus size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANALYTICS TAB
   ═══════════════════════════════════════════════════════════ */
function AnalyticsTab() {
  const films = useFilmStore((s) => s.films);

  const downloadCSV = (type: 'monthly' | 'films' | 'users') => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('tr-TR');
    let csvContent = '';
    let filename = '';
    if (type === 'monthly') {
      filename = `gelir-raporu-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}.csv`;
      csvContent = 'Ay,Gelir (₺),Sipariş,Ortalama Sepet (₺)\n';
      ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'].forEach((m) => {
        const rev = Math.floor(Math.random() * 8000 + 2000);
        const orders = Math.floor(Math.random() * 30 + 10);
        csvContent += `${m},${rev},${orders},${(rev / orders).toFixed(2)}\n`;
      });
    } else if (type === 'films') {
      filename = `film-performans-${dateStr.replace(/\./g, '-')}.csv`;
      csvContent = 'Film,Yönetmen,Fiyat (₺),İndirimli (₺),Puan,Durum\n';
      films.forEach((f) => {
        csvContent += `"${f.title}","${f.director}",${f.price},${f.discountPrice || '-'},${f.rating},${f.status}\n`;
      });
    } else {
      filename = `kullanici-raporu-${dateStr.replace(/\./g, '-')}.csv`;
      csvContent = 'Ad,E-posta,Sipariş Sayısı,Harcama,Durum\nAli Yılmaz,ali@example.com,5,₺432,Aktif\nAyşe Demir,ayse@example.com,3,₺289,Aktif\nMehmet Kara,mehmet@example.com,8,₺756,Aktif\n';
    }
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Report Downloads */}
      <div className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06]">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={18} className="text-accent-purple" />
          <h3 className="font-semibold text-white">Rapor İndir</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { type: 'monthly' as const, label: 'Aylık Gelir Raporu', desc: 'Aylık gelir, sipariş sayısı ve ortalama sepet tutarı', icon: Calendar },
            { type: 'films' as const, label: 'Film Performans Raporu', desc: 'Tüm filmler: fiyat, puan, durum ve indirim bilgisi', icon: Film },
            { type: 'users' as const, label: 'Kullanıcı Raporu', desc: 'Kullanıcı listesi, sipariş ve harcama bilgileri', icon: Users },
          ].map((r) => (
            <button
              key={r.type}
              onClick={() => downloadCSV(r.type)}
              className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition-all hover:bg-accent-purple/5 hover:border-accent-purple/20"
            >
              <div className="rounded-lg bg-accent-purple/10 p-2 group-hover:bg-accent-purple/20 transition-colors">
                <r.icon size={16} className="text-accent-purple" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{r.label}</p>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{r.desc}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-accent-purple">
                  <Download size={11} />
                  CSV İndir
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Ortalama Sepet', value: '₺187', color: 'text-accent-purple' },
          { label: 'Dönüşüm Oranı', value: '%3.7', color: 'text-green-400' },
          { label: 'Bounce Rate', value: '%28', color: 'text-accent-red' },
          { label: 'Ort. Oturum Süresi', value: '4:32', color: 'text-blue-400' },
        ].map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06]"
          >
            <p className={`font-mono text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="mt-1 text-xs text-text-muted">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <h3 className="mb-6 font-semibold text-white">Ödeme Yöntemi Dağılımı</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={4}>
                {paymentData.map((_entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={chartTooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 flex justify-center gap-6">
            {paymentData.map((entry, i) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-text-secondary">{entry.name}</span>
                <span className="font-mono font-semibold text-white">%{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <h3 className="mb-6 font-semibold text-white">Tür Bazlı Gelir</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={genreRevenueData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" stroke="#6B6B80" fontSize={12} />
              <YAxis type="category" dataKey="genre" stroke="#6B6B80" fontSize={12} width={80} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="revenue" radius={[0, 8, 8, 0]}>
                {genreRevenueData.map((_entry, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
        <h3 className="mb-6 font-semibold text-white">Aylık Gelir Karşılaştırması</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" stroke="#6B6B80" fontSize={12} />
            <YAxis stroke="#6B6B80" fontSize={12} />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Line type="monotone" dataKey="previous" stroke="rgba(255,255,255,0.2)" strokeWidth={2} dot={{ r: 3, fill: 'rgba(255,255,255,0.2)' }} name="Geçen Yıl" />
            <Line type="monotone" dataKey="revenue" stroke="#A259FF" strokeWidth={3} dot={{ r: 4, fill: '#A259FF' }} name="Bu Yıl" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
        <h3 className="mb-4 font-semibold text-white">Tür Performansı</h3>
        <div className="space-y-3">
          {[...genreRevenueData].sort((a, b) => b.revenue - a.revenue).map((item, i) => (
            <div key={item.genre} className="flex items-center gap-4">
              <span className="w-5 text-center font-mono text-xs text-text-muted">{i + 1}</span>
              <span className="w-24 text-sm text-white">{item.genre}</span>
              <div className="flex-1">
                <div className="h-2 rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.revenue / 3200) * 100}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
              <span className="font-mono text-sm font-semibold text-white">₺{item.revenue.toLocaleString('tr-TR')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   SETTINGS TAB
   ═══════════════════════════════════════════════════════════ */
function AdminSettingsTab() {
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [emailPass, setEmailPass] = useState('');
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [deleteText, setDeleteText] = useState('');

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const inputClass =
    'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-text-muted transition-all focus:border-accent-purple/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-accent-purple/20';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-400 ring-1 ring-green-500/20"
          >
            <Check size={16} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
        <div className="mb-5 flex items-center gap-2">
          <Globe size={18} className="text-accent-purple" />
          <h3 className="font-semibold text-white">Site Ayarları</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Site Adı</label>
            <input type="text" defaultValue="CineVerse" className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Site Açıklaması</label>
            <input type="text" defaultValue="Premium film deneyimi" className={inputClass} />
          </div>
          <button onClick={() => showSuccess('Site ayarları güncellendi')} className="rounded-xl bg-accent-purple px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-purple/90 hover:shadow-lg hover:shadow-accent-purple/20">
            Kaydet
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
        <div className="mb-5 flex items-center gap-2">
          <Mail size={18} className="text-accent-purple" />
          <h3 className="font-semibold text-white">E-posta Güncelle</h3>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); showSuccess('E-posta güncellendi'); setAdminEmail(''); setEmailPass(''); }} className="space-y-3">
          <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Yeni e-posta" className={inputClass} />
          <input type="password" value={emailPass} onChange={(e) => setEmailPass(e.target.value)} placeholder="Mevcut şifre" className={inputClass} />
          <button type="submit" className="rounded-xl bg-accent-purple px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-purple/90 hover:shadow-lg hover:shadow-accent-purple/20">
            Güncelle
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
        <div className="mb-5 flex items-center gap-2">
          <Lock size={18} className="text-accent-gold" />
          <h3 className="font-semibold text-white">Şifre Değiştir</h3>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (newPass === confirmPass && newPass.length >= 6) { showSuccess('Şifre güncellendi'); setCurPass(''); setNewPass(''); setConfirmPass(''); } }} className="space-y-3">
          <input type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} placeholder="Mevcut şifre" className={inputClass} />
          <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} placeholder="Yeni şifre (min 6 karakter)" className={inputClass} />
          <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} placeholder="Yeni şifre tekrar" className={inputClass} />
          <button type="submit" className="rounded-xl bg-accent-gold px-5 py-2.5 text-sm font-semibold text-bg-primary transition-all hover:bg-accent-gold/90 hover:shadow-lg hover:shadow-accent-gold/20">
            Şifreyi Güncelle
          </button>
        </form>
      </div>

      <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-white">Oturumu Kapat</p>
            <p className="text-sm text-text-muted">Admin panelinden çıkış yap</p>
          </div>
          <button onClick={() => { logout(); navigate('/login'); }} className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2.5 text-sm text-text-secondary transition-colors hover:bg-white/[0.1] hover:text-white">
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-accent-red/15 bg-accent-red/[0.03] p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-accent-red" />
          <h3 className="font-semibold text-accent-red">Tehlikeli Bölge</h3>
        </div>
        <p className="text-sm text-text-muted">Bu işlem geri alınamaz. Tüm veriler kalıcı olarak silinecektir.</p>
        <div className="mt-4 flex items-center gap-3">
          <input
            type="text"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder='Onaylamak için "SİL" yazın'
            className="flex-1 rounded-xl border border-accent-red/20 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-text-muted focus:border-accent-red/50"
          />
          <button
            onClick={() => { if (deleteText === 'SİL') { logout(); navigate('/'); } }}
            disabled={deleteText !== 'SİL'}
            className="flex items-center gap-2 rounded-xl bg-accent-red px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-30"
          >
            <Trash2 size={16} />
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   COMMENTS TAB
   ═══════════════════════════════════════════════════════════ */
function CommentsTab() {
  const { comments, replyToComment, deleteComment } = useCommentStore();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'replied' | 'unreplied'>('all');

  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      const matchSearch =
        c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'replied' && c.adminReply) ||
        (filterStatus === 'unreplied' && !c.adminReply);
      return matchSearch && matchStatus;
    });
  }, [comments, searchQuery, filterStatus]);

  const filmName = (filmId: string) => {
    const films = useFilmStore.getState().films;
    const film = films.find((f) => f.id === filmId);
    return film?.title || 'Bilinmeyen Film';
  };

  const handleReply = (commentId: string) => {
    if (replyText.trim()) {
      replyToComment(commentId, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const stats = useMemo(() => ({
    total: comments.length,
    replied: comments.filter((c) => c.adminReply).length,
    unreplied: comments.filter((c) => !c.adminReply).length,
    avgRating: comments.length > 0 ? (comments.reduce((sum, c) => sum + c.rating, 0) / comments.length).toFixed(1) : '0',
  }), [comments]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Toplam Yorum', value: stats.total, color: 'from-accent-purple/20 to-accent-purple/5', iconColor: 'text-accent-purple', icon: MessageCircle, ring: 'ring-accent-purple/10' },
          { label: 'Cevaplanmış', value: stats.replied, color: 'from-green-500/20 to-green-500/5', iconColor: 'text-green-400', icon: Check, ring: 'ring-green-500/10' },
          { label: 'Bekleyen', value: stats.unreplied, color: 'from-accent-gold/20 to-accent-gold/5', iconColor: 'text-accent-gold', icon: Clock, ring: 'ring-accent-gold/10' },
          { label: 'Ort. Puan', value: stats.avgRating, color: 'from-accent-red/20 to-accent-red/5', iconColor: 'text-accent-red', icon: Star, ring: 'ring-accent-red/10' },
        ].map((m) => (
          <div key={m.label} className={`rounded-2xl bg-gradient-to-br ${m.color} p-5 ring-1 ${m.ring}`}>
            <div className="mb-2 rounded-xl bg-white/[0.08] p-2 w-fit">
              <m.icon size={18} className={m.iconColor} />
            </div>
            <p className="font-mono text-2xl font-bold text-white">{m.value}</p>
            <p className="mt-1 text-[11px] text-text-muted">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {(['all', 'unreplied', 'replied'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-accent-purple/15 text-accent-purple ring-1 ring-accent-purple/20'
                  : 'text-text-muted hover:bg-white/5 hover:text-text-secondary'
              }`}
            >
              {status === 'all' ? 'Tümü' : status === 'unreplied' ? 'Bekleyen' : 'Cevaplanmış'}
              <span className="ml-1.5 opacity-60">
                {status === 'all' ? stats.total : status === 'replied' ? stats.replied : stats.unreplied}
              </span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Yorum veya kullanıcı ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-4 py-2.5 text-sm text-white outline-none placeholder:text-text-muted focus:border-accent-purple/40 focus:ring-1 focus:ring-accent-purple/20"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="rounded-2xl bg-white/[0.03] p-12 text-center ring-1 ring-white/[0.06]">
            <MessageCircle size={40} className="mx-auto mb-3 text-text-muted opacity-30" />
            <p className="text-sm text-text-muted">Yorum bulunamadı</p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-white/[0.06]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-red/80 to-pink-600/60 text-sm font-bold text-white">
                  {comment.userName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold text-white">{comment.userName}</span>
                    <span className="flex items-center gap-1 rounded-md bg-accent-gold/15 px-1.5 py-0.5 text-[11px] font-bold text-accent-gold">
                      <Star size={10} fill="#FFD700" /> {comment.rating}/10
                    </span>
                    <span className="text-[11px] text-text-muted">
                      {new Date(comment.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {!comment.adminReply && (
                      <span className="rounded-md bg-accent-gold/15 px-1.5 py-0.5 text-[10px] font-bold text-accent-gold">BEKLEYEN</span>
                    )}
                  </div>
                  <p className="text-xs text-accent-purple mb-2">
                    Film: <span className="font-medium">{filmName(comment.filmId)}</span>
                  </p>
                  <p className="text-sm leading-relaxed text-text-secondary">{comment.text}</p>

                  {/* Admin Reply */}
                  {comment.adminReply && (
                    <div className="mt-3 rounded-xl border-l-2 border-accent-purple/40 bg-accent-purple/[0.06] px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-md bg-accent-purple/20 px-1.5 py-0.5 text-[10px] font-bold text-accent-purple">ADMIN YANITI</span>
                        <span className="text-[11px] text-text-muted">
                          {comment.adminRepliedAt && new Date(comment.adminRepliedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary">{comment.adminReply}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <div className="mt-3 flex gap-2">
                      <input
                        type="text"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleReply(comment.id); }}
                        placeholder="Yanıtınızı yazın..."
                        className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none placeholder:text-text-muted focus:border-accent-purple/40"
                        autoFocus
                      />
                      <button
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyText.trim()}
                        className="flex items-center gap-1.5 rounded-xl bg-accent-purple/20 px-4 py-2.5 text-sm font-medium text-accent-purple transition-colors hover:bg-accent-purple/30 disabled:opacity-40"
                      >
                        <Send size={14} />
                        Gönder
                      </button>
                      <button
                        onClick={() => { setReplyingTo(null); setReplyText(''); }}
                        className="rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-text-muted hover:bg-white/[0.08]"
                      >
                        İptal
                      </button>
                    </div>
                  )}

                  {/* Actions */}
                  {replyingTo !== comment.id && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => { setReplyingTo(comment.id); setReplyText(comment.adminReply || ''); }}
                        className="flex items-center gap-1.5 rounded-lg bg-accent-purple/10 px-3 py-1.5 text-xs font-medium text-accent-purple transition-colors hover:bg-accent-purple/20"
                      >
                        <Send size={12} />
                        {comment.adminReply ? 'Yanıtı Düzenle' : 'Yanıtla'}
                      </button>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-accent-red/10 px-3 py-1.5 text-xs font-medium text-accent-red transition-colors hover:bg-accent-red/20"
                      >
                        <Trash2 size={12} />
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

