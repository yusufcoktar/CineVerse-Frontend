import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, FileText, Gift, X, Search, CheckCircle2, Printer, ExternalLink } from 'lucide-react';
import { useOrderStore } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { mockRegisteredUsers } from '@/data/mockData';
import { Link } from 'react-router-dom';
import type { Order } from '@/types';
import type { User } from '@/types';

/* ───────────── Fatura Modal ───────────── */
function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);
  const invoiceNo = `INV-${order.id.replace('ORD-', '')}`;

  const handlePrint = () => {
    if (!printRef.current) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<html><head><title>Fatura ${invoiceNo}</title>
      <style>
        body { font-family: sans-serif; padding: 32px; color: #111; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f5f5f5; }
        .total { text-align: right; font-size: 16px; font-weight: bold; margin-top: 16px; }
        img { display: none; }
      </style></head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-lg rounded-2xl bg-bg-secondary ring-1 ring-white/[0.08] max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 sticky top-0 bg-bg-secondary z-10">
            <div className="flex items-center gap-2 text-white">
              <FileText size={18} className="text-accent-gold" />
              <span className="font-semibold">Fatura</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-white/[0.1]"
              >
                <Printer size={13} /> Yazdır
              </button>
              <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:text-white">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="px-6 py-5" ref={printRef}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-heading text-2xl text-accent-gold">CineVerse</h2>
                <p className="mt-1 text-xs text-text-muted">cineverse.com</p>
                <p className="text-xs text-text-muted">destek@cineverse.com</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Fatura No</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-white">{invoiceNo}</p>
                <p className="mt-2 text-xs text-text-muted">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="mb-5 rounded-xl bg-white/[0.03] p-4 ring-1 ring-white/[0.05]">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-text-muted">Sipariş No</p>
                  <p className="mt-0.5 font-mono font-semibold text-white">{order.id}</p>
                </div>
                <div>
                  <p className="text-text-muted">Ödeme Yöntemi</p>
                  <p className="mt-0.5 font-semibold text-white">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-text-muted">Durum</p>
                  <p className={`mt-0.5 font-semibold ${
                    order.status === 'completed' ? 'text-green-400' :
                    order.status === 'processing' ? 'text-yellow-400' : 'text-accent-red'
                  }`}>
                    {order.status === 'completed' ? 'Tamamlandı' : order.status === 'processing' ? 'İşlemde' : 'İade Edildi'}
                  </p>
                </div>
                <div>
                  <p className="text-text-muted">Teslimat</p>
                  <p className="mt-0.5 font-semibold text-white">Dijital İndirme</p>
                </div>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">Film</th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">Adet</th>
                  <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wide text-text-muted">Fiyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {order.items.map((item) => (
                  <tr key={item.film.id}>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <img src={item.film.poster} alt={item.film.title} className="h-10 w-7 rounded object-cover opacity-80" />
                        <div>
                          <p className="font-medium text-white">{item.film.title}</p>
                          <p className="text-xs text-text-muted">{item.film.year} · Dijital HD</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-mono text-text-secondary">{item.quantity}</td>
                    <td className="py-3 text-right font-mono font-semibold text-white">
                      {(item.film.discountPrice ?? item.film.price).toFixed(2)} ₺
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4 space-y-1.5 border-t border-white/[0.06] pt-4">
              <div className="flex justify-between text-xs text-text-muted">
                <span>Ara Toplam</span>
                <span className="font-mono">{order.total.toFixed(2)} ₺</span>
              </div>
              <div className="flex justify-between text-xs text-text-muted">
                <span>KDV (%18)</span>
                <span className="font-mono">{(order.total * 0.18).toFixed(2)} ₺</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-white/[0.06] pt-2 text-sm font-bold text-white">
                <span>Genel Toplam</span>
                <span className="font-mono text-accent-gold">{(order.total * 1.18).toFixed(2)} ₺</span>
              </div>
            </div>

            <p className="mt-5 text-center text-[10px] text-text-muted">
              Bu fatura CineVerse tarafından elektronik olarak düzenlenmiştir. Sorular için destek@cineverse.com adresine yazabilirsiniz.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────── Hediye Et Modal ───────────── */
function GiftModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFilmIdx, setSelectedFilmIdx] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { addNotification } = useNotificationStore();
  const currentUser = useAuthStore((s) => s.user);

  const searchResults = query.length > 1
    ? mockRegisteredUsers.filter(
        (u) =>
          u.id !== currentUser?.id &&
          (u.email.toLowerCase().includes(query.toLowerCase()) ||
           u.name.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleSend = () => {
    if (!selectedUser) { setError('Lütfen bir alıcı seçin'); return; }
    const film = order.items[selectedFilmIdx]?.film;
    if (!film) return;
    addNotification({
      type: 'order',
      title: 'Hediye Gönderildi 🎁',
      message: `"${film.title}" filmi ${selectedUser.name} adresine hediye edildi.`,
    });
    setSent(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-md rounded-2xl bg-bg-secondary ring-1 ring-white/[0.08]"
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-2 text-white">
              <Gift size={18} className="text-accent-purple" />
              <span className="font-semibold">Hediye Et</span>
            </div>
            <button onClick={onClose} className="rounded-lg p-1.5 text-text-muted hover:text-white">
              <X size={18} />
            </button>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center gap-3 px-6 py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                <CheckCircle2 size={52} className="text-green-400" />
              </motion.div>
              <p className="text-center font-semibold text-white">Hediye gönderildi!</p>
              <p className="text-center text-sm text-text-muted">
                <span className="text-accent-purple font-semibold">{selectedUser?.name}</span> hediyeni aldı.
              </p>
              <button
                onClick={onClose}
                className="mt-3 rounded-xl bg-accent-purple/15 px-6 py-2 text-sm font-semibold text-accent-purple hover:bg-accent-purple/25"
              >
                Kapat
              </button>
            </div>
          ) : (
            <div className="px-6 py-5 space-y-5">
              {order.items.length > 1 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Hangi filmi hediye ediyorsun?</p>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <button
                        key={item.film.id}
                        onClick={() => setSelectedFilmIdx(idx)}
                        className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs ring-1 transition-all ${
                          selectedFilmIdx === idx
                            ? 'bg-accent-purple/15 text-accent-purple ring-accent-purple/40'
                            : 'bg-white/[0.03] text-text-secondary ring-white/[0.06] hover:bg-white/[0.06]'
                        }`}
                      >
                        <img src={item.film.poster} alt={item.film.title} className="h-8 w-5 rounded object-cover" />
                        {item.film.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {order.items.length === 1 && (
                <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/[0.06]">
                  <img src={order.items[0].film.poster} alt={order.items[0].film.title} className="h-12 w-8 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-white">{order.items[0].film.title}</p>
                    <p className="text-xs text-text-muted">{order.items[0].film.year}</p>
                  </div>
                  <Gift size={18} className="ml-auto text-accent-purple/50" />
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Alıcıyı Bul</p>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setSelectedUser(null); setError(''); }}
                    placeholder="İsim veya e-posta ara..."
                    className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2.5 pl-9 pr-4 text-sm text-white placeholder-text-muted outline-none focus:border-accent-purple/40 focus:ring-1 focus:ring-accent-purple/20"
                  />
                </div>

                {searchResults.length > 0 && !selectedUser && (
                  <div className="mt-1.5 rounded-xl border border-white/[0.08] bg-bg-primary/90 py-1 shadow-2xl">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => { setSelectedUser(u); setQuery(u.name); }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.05]"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/20 text-xs font-bold text-accent-purple">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{u.name}</p>
                          <p className="text-xs text-text-muted">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {query.length > 1 && searchResults.length === 0 && !selectedUser && (
                  <p className="mt-2 text-xs text-text-muted">Kayıtlı kullanıcı bulunamadı.</p>
                )}
              </div>

              {selectedUser && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-xl bg-accent-purple/10 p-3 ring-1 ring-accent-purple/20"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-purple/25 text-sm font-bold text-accent-purple">
                    {selectedUser.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white">{selectedUser.name}</p>
                    <p className="text-xs text-text-muted">{selectedUser.email}</p>
                  </div>
                  <CheckCircle2 size={16} className="text-accent-purple" />
                </motion.div>
              )}

              {error && <p className="text-xs text-accent-red">{error}</p>}

              <button
                onClick={handleSend}
                disabled={!selectedUser}
                className="w-full rounded-xl bg-accent-purple py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40 hover:opacity-90"
              >
                Hediye Gönder 🎁
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ───────────── Ana Sayfa ───────────── */
export default function OrdersPage() {
  const { orders, fetchOrders } = useOrderStore();
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [giftOrder, setGiftOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (useOrderStore.getState().orders.length === 0) fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      completed: 'bg-green-500/20 text-green-400',
      processing: 'bg-yellow-500/20 text-yellow-400',
      refunded: 'bg-red-500/20 text-red-400',
    };
    const labels: Record<string, string> = {
      completed: 'Tamamlandı',
      processing: 'İşlemde',
      refunded: 'İade Edildi',
    };
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <>
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 font-heading text-3xl text-accent-gold"
      >
        Siparişlerim
      </motion.h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-muted">
          <Package size={48} className="mb-4 opacity-30" />
          <p>Henüz siparişiniz yok</p>
          <Link to="/explore" className="mt-4 text-accent-purple hover:underline">
            Alışverişe başla
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl bg-white/[0.04] ring-1 ring-white/[0.06] p-4 md:p-6"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-text-secondary">{order.id}</span>
                  {statusBadge(order.status)}
                </div>
                <span className="text-sm text-text-muted">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>

              {/* Film listesi — tıklanabilir */}
              <div className="space-y-1">
                {order.items.map((item) => (
                  <Link
                    key={item.film.id}
                    to={`/film/${item.film.id}`}
                    className="group flex items-center gap-3 rounded-xl p-2 -mx-2 transition-colors hover:bg-white/[0.04]"
                  >
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={item.film.poster}
                        alt={item.film.title}
                        className="h-14 w-10 object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-white group-hover:text-accent-purple transition-colors truncate">
                          {item.film.title}
                        </p>
                        <ExternalLink size={11} className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity text-accent-purple" />
                      </div>
                      <p className="text-xs text-text-muted">{item.film.genres.join(', ')}</p>
                    </div>
                    <span className="font-mono text-sm text-text-secondary shrink-0">
                      {(item.film.discountPrice ?? item.film.price).toFixed(2)} ₺
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-white/[0.05] pt-4 gap-2">
                <div className="text-sm text-text-muted">
                  Ödeme: {order.paymentMethod}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-white">{order.total.toFixed(2)} ₺</span>
                  <button
                    onClick={() => setInvoiceOrder(order)}
                    className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-white/[0.1] hover:text-white"
                  >
                    <FileText size={13} /> Fatura
                  </button>
                  <button
                    onClick={() => setGiftOrder(order)}
                    className="flex items-center gap-1.5 rounded-lg bg-accent-purple/10 px-3 py-1.5 text-xs text-accent-purple transition-colors hover:bg-accent-purple/20"
                  >
                    <Gift size={13} /> Hediye Et
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>

    {/* Modaller */}
    {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    {giftOrder && <GiftModal order={giftOrder} onClose={() => setGiftOrder(null)} />}
  </>
  );
}
