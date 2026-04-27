import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Tag, ShoppingCart, ArrowRight, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function CartPage() {
  const { items, removeItem, clear, total, applyCoupon, coupon, removeCoupon } = useCartStore();
  const [couponInput, setCouponInput] = useState('');

  const handleApplyCoupon = () => {
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim().toUpperCase());
      setCouponInput('');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-red/15">
          <ShoppingBag size={20} className="text-accent-red" />
        </div>
        <div>
          <h1 className="font-heading text-2xl text-white">Sepetim</h1>
          <p className="text-sm text-text-muted">{items.length} ürün</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white/[0.03] py-20 ring-1 ring-white/[0.06]">
          <ShoppingCart size={48} className="mb-4 text-text-muted opacity-30" />
          <h2 className="text-lg font-semibold text-white mb-2">Sepetiniz boş</h2>
          <p className="text-sm text-text-muted mb-6">Film keşfederek sepetinize ekleyin</p>
          <Link
            to="/explore"
            className="rounded-xl bg-gradient-to-r from-accent-red to-pink-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/25 transition-all hover:shadow-accent-red/40 hover:brightness-110"
          >
            Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item, i) => (
                <motion.div
                  key={item.film.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex gap-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/[0.06] transition-all hover:ring-white/[0.12]"
                >
                  {/* Poster */}
                  <Link to={`/film/${item.film.id}`} className="shrink-0">
                    <img
                      src={item.film.poster}
                      alt={item.film.title}
                      className="h-28 w-20 rounded-xl object-cover ring-1 ring-white/10 transition-transform group-hover:scale-105"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div>
                      <Link to={`/film/${item.film.id}`} className="hover:text-accent-red transition-colors">
                        <h3 className="text-base font-semibold text-white truncate">{item.film.title}</h3>
                      </Link>
                      <p className="text-xs text-text-muted mt-0.5">
                        {item.film.year} • {item.film.director} • {item.film.duration} dk
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.film.genres.slice(0, 3).map((g) => (
                          <span key={g} className="rounded-md bg-accent-purple/10 px-2 py-0.5 text-[10px] text-accent-purple">
                            {g}
                          </span>
                        ))}
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          item.film.resolution === '4K' ? 'bg-accent-gold/15 text-accent-gold' :
                          item.film.resolution === 'HD' ? 'bg-blue-500/15 text-blue-400' :
                          'bg-white/10 text-white'
                        }`}>
                          {item.film.resolution}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center gap-1 text-accent-gold text-xs">
                        ⭐ {item.film.rating}
                      </div>
                    </div>
                  </div>

                  {/* Price + Remove */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.film.id)}
                      className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-accent-red/15 hover:text-accent-red"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="text-right">
                      {item.film.discountPrice ? (
                        <>
                          <p className="font-mono text-lg font-bold text-accent-red">
                            {item.film.discountPrice.toFixed(2)} ₺
                          </p>
                          <p className="font-mono text-xs text-text-muted line-through">
                            {item.film.price.toFixed(2)} ₺
                          </p>
                        </>
                      ) : (
                        <p className="font-mono text-lg font-bold text-white">
                          {item.film.price.toFixed(2)} ₺
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Clear Cart */}
            <button
              onClick={clear}
              className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-4 py-2.5 text-sm text-text-muted transition-colors hover:bg-accent-red/10 hover:text-accent-red"
            >
              <Trash2 size={14} />
              Sepeti Temizle
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
              <h3 className="font-heading text-lg text-white mb-5">Sipariş Özeti</h3>

              {/* Items Summary */}
              <div className="space-y-3 mb-5">
                {items.map((item) => (
                  <div key={item.film.id} className="flex items-center justify-between text-sm">
                    <span className="text-text-secondary truncate mr-3">{item.film.title}</span>
                    <span className="font-mono text-white shrink-0">
                      {(item.film.discountPrice ?? item.film.price).toFixed(2)} ₺
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/[0.06] pt-4 mb-4">
                {/* Coupon */}
                {coupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-accent-purple/10 px-4 py-2.5 mb-4 ring-1 ring-accent-purple/20">
                    <span className="flex items-center gap-2 text-sm text-accent-purple">
                      <Tag size={14} />
                      {coupon}
                    </span>
                    <button onClick={removeCoupon} className="text-xs text-text-muted hover:text-white">
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      placeholder="Kupon kodu"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleApplyCoupon(); }}
                      className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:border-accent-purple/40"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="rounded-xl bg-accent-purple/15 px-4 py-2.5 text-sm font-medium text-accent-purple transition-colors hover:bg-accent-purple/25"
                    >
                      Uygula
                    </button>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mb-5">
                <span className="text-text-secondary font-medium">Toplam</span>
                <span className="font-mono text-2xl font-bold text-white">{total().toFixed(2)} ₺</span>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-red to-pink-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-red/25 transition-all hover:shadow-accent-red/40 hover:brightness-110"
              >
                Ödemeye Geç
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
