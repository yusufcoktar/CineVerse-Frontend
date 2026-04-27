import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useCartStore } from '@/store/cartStore';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function CartDrawer() {
  const isOpen = useUIStore((s) => s.cartDrawerOpen);
  const close = useUIStore((s) => s.closeCartDrawer);
  const { items, removeItem, clear, total, applyCoupon, coupon, removeCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim().toUpperCase());
      setCouponInput('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={close}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-bg-secondary"
            role="dialog"
            aria-modal="true"
            aria-label="Sepet"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 p-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="text-accent-red" size={20} />
                <h2 className="font-heading text-lg text-white">Sepetim</h2>
                <span className="rounded-full bg-accent-red/20 px-2 py-0.5 text-xs text-accent-red">
                  {items.length}
                </span>
              </div>
              <button onClick={close} className="rounded-lg p-1 hover:bg-white/5" aria-label="Sepeti kapat">
                <X size={20} className="text-text-secondary" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                  <ShoppingBag size={48} className="mb-4 opacity-30" />
                  <p>Sepetiniz boş</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={item.film.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      className="flex gap-3 rounded-xl bg-white/5 p-3"
                    >
                      <img
                        src={item.film.poster}
                        alt={item.film.title}
                        className="h-20 w-14 rounded-lg object-cover"
                      />
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-white">{item.film.title}</h3>
                          <p className="text-xs text-text-muted">{item.film.genres.join(', ')}</p>
                        </div>
                        <span className="font-mono text-sm font-bold text-accent-red">
                          {(item.film.discountPrice ?? item.film.price).toFixed(2)} ₺
                        </span>
                      </div>
                      <button
                        onClick={() => removeItem(item.film.id)}
                        className="self-start rounded-lg p-1 hover:bg-white/10"
                        aria-label={`${item.film.title} filmini sepetten kaldır`}
                      >
                        <Trash2 size={16} className="text-text-muted hover:text-accent-red" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-white/5 p-4 space-y-3">
                {/* Coupon */}
                <div className="flex gap-2">
                  {coupon ? (
                    <div className="flex flex-1 items-center justify-between rounded-lg bg-accent-purple/10 px-3 py-2">
                      <span className="flex items-center gap-1 text-sm text-accent-purple">
                        <Tag size={14} />
                        {coupon}
                      </span>
                      <button onClick={removeCoupon} className="text-xs text-text-muted hover:text-white">
                        Kaldır
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder="Kupon kodu"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-white placeholder-text-muted outline-none"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        className="rounded-lg bg-accent-purple/20 px-3 py-2 text-sm text-accent-purple hover:bg-accent-purple/30"
                      >
                        Uygula
                      </button>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Toplam</span>
                  <span className="font-mono text-xl font-bold text-white">{total().toFixed(2)} ₺</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={close}
                  className="block w-full rounded-xl bg-accent-red py-3 text-center font-semibold text-white transition-all hover:bg-accent-red/90 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Ödemeye Geç
                </Link>
                <button
                  onClick={clear}
                  className="w-full py-2 text-sm text-text-muted hover:text-accent-red transition-colors"
                >
                  Sepeti Temizle
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
