import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Building, Check, ArrowLeft, ArrowRight, PartyPopper } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { useLibraryStore } from '@/store/libraryStore';
import { Link } from 'react-router-dom';

type Step = 1 | 2 | 3 | 4 | 5;
type PaymentMethod = 'card' | 'wallet' | 'iban';

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [orderId, setOrderId] = useState('');
  const { items, total, clear, coupon } = useCartStore();
  const addOrder = useOrderStore((s) => s.addOrder);
  const addFilmsToLibrary = useLibraryStore((s) => s.addFilms);

  if (items.length === 0 && step !== 5) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg text-text-muted">Sepetiniz boş</p>
          <Link to="/explore" className="inline-block text-accent-purple hover:underline">
            Alışverişe başla
          </Link>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderId(newOrderId);
    addOrder({
      id: newOrderId,
      items: [...items],
      total: total(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      paymentMethod: paymentMethod === 'card' ? 'Kredi Kartı' : paymentMethod === 'wallet' ? 'Dijital Cüzdan' : 'IBAN',
    });
    addFilmsToLibrary(items.map((i) => i.film));
    clear();
    setStep(5);
  };

  const steps = [
    { num: 1, label: 'Sepet' },
    { num: 2, label: 'Giriş' },
    { num: 3, label: 'Ödeme' },
    { num: 4, label: 'Onay' },
    { num: 5, label: 'Başarı' },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Step Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {steps.map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                step >= s.num
                  ? 'bg-accent-red text-white'
                  : 'bg-white/5 text-text-muted'
              }`}
            >
              {step > s.num ? <Check size={14} /> : s.num}
            </div>
            <span className="hidden text-xs text-text-secondary sm:block">{s.label}</span>
            {s.num < 5 && <div className={`h-px w-6 ${step > s.num ? 'bg-accent-red' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Sepet Özeti */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="font-heading text-2xl text-accent-gold">Sepet Özeti</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.film.id} className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                  <img src={item.film.poster} alt={item.film.title} className="h-16 w-11 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.film.title}</h3>
                    <p className="text-sm text-text-muted">{item.film.genres.join(', ')}</p>
                  </div>
                  <span className="font-mono font-bold text-accent-red">
                    {(item.film.discountPrice ?? item.film.price).toFixed(2)} ₺
                  </span>
                </div>
              ))}
            </div>
            {coupon && (
              <div className="rounded-lg bg-accent-purple/10 px-4 py-2 text-sm text-accent-purple">
                Kupon: {coupon} uygulandı
              </div>
            )}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="text-lg text-text-secondary">Toplam</span>
              <span className="font-mono text-2xl font-bold text-white">{total().toFixed(2)} ₺</span>
            </div>
            <button onClick={() => setStep(2)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-red py-3 font-semibold text-white transition-all hover:bg-accent-red/90">
              Devam Et <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Step 2: Kullanıcı Girişi */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="font-heading text-2xl text-accent-gold">Kullanıcı Girişi</h2>
            <div className="rounded-xl bg-white/5 p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-text-secondary">E-posta</label>
                <input type="email" defaultValue="ali@example.com" className="w-full rounded-lg bg-white/5 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-accent-purple" />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">Ad Soyad</label>
                <input type="text" defaultValue="Ali Yılmaz" className="w-full rounded-lg bg-white/5 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-accent-purple" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex items-center gap-1 rounded-xl border border-white/10 px-6 py-3 text-text-secondary hover:bg-white/5">
                <ArrowLeft size={18} /> Geri
              </button>
              <button onClick={() => setStep(3)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-red py-3 font-semibold text-white transition-all hover:bg-accent-red/90">
                Devam Et <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Ödeme Yöntemi */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="font-heading text-2xl text-accent-gold">Ödeme Yöntemi</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { key: 'card' as PaymentMethod, icon: CreditCard, label: 'Kredi Kartı' },
                { key: 'wallet' as PaymentMethod, icon: Wallet, label: 'Dijital Cüzdan' },
                { key: 'iban' as PaymentMethod, icon: Building, label: 'IBAN' },
              ].map((method) => (
                <button
                  key={method.key}
                  onClick={() => setPaymentMethod(method.key)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-6 transition-all ${
                    paymentMethod === method.key
                      ? 'bg-accent-purple/20 border border-accent-purple ring-1 ring-accent-purple'
                      : 'bg-white/5 border border-white/5 hover:bg-white/10'
                  }`}
                >
                  <method.icon size={24} className={paymentMethod === method.key ? 'text-accent-purple' : 'text-text-secondary'} />
                  <span className={`text-sm ${paymentMethod === method.key ? 'text-white' : 'text-text-secondary'}`}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
            {paymentMethod === 'card' && (
              <div className="rounded-xl bg-white/5 p-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-text-secondary">Kart Numarası</label>
                  <input type="text" placeholder="**** **** **** ****" maxLength={19} className="w-full rounded-lg bg-white/5 px-4 py-3 font-mono text-white outline-none focus:ring-1 focus:ring-accent-purple" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-text-secondary">Son Kullanma</label>
                    <input type="text" placeholder="MM/YY" maxLength={5} className="w-full rounded-lg bg-white/5 px-4 py-3 font-mono text-white outline-none focus:ring-1 focus:ring-accent-purple" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-text-secondary">CVV</label>
                    <input type="text" placeholder="***" maxLength={3} className="w-full rounded-lg bg-white/5 px-4 py-3 font-mono text-white outline-none focus:ring-1 focus:ring-accent-purple" />
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex items-center gap-1 rounded-xl border border-white/10 px-6 py-3 text-text-secondary hover:bg-white/5">
                <ArrowLeft size={18} /> Geri
              </button>
              <button onClick={() => setStep(4)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-red py-3 font-semibold text-white transition-all hover:bg-accent-red/90">
                Devam Et <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Onay */}
        {step === 4 && (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="font-heading text-2xl text-accent-gold">Sipariş Onayı</h2>
            <div className="rounded-xl bg-white/5 p-6 space-y-3">
              {items.map((item) => (
                <div key={item.film.id} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{item.film.title}</span>
                  <span className="font-mono text-white">{(item.film.discountPrice ?? item.film.price).toFixed(2)} ₺</span>
                </div>
              ))}
              <div className="border-t border-white/5 pt-3 flex justify-between">
                <span className="font-semibold text-white">Toplam</span>
                <span className="font-mono text-xl font-bold text-accent-red">{total().toFixed(2)} ₺</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex items-center gap-1 rounded-xl border border-white/10 px-6 py-3 text-text-secondary hover:bg-white/5">
                <ArrowLeft size={18} /> Geri
              </button>
              <button onClick={handleComplete} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-red py-3 font-semibold text-white transition-all hover:bg-accent-red/90">
                Ödemeyi Tamamla <Check size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Başarı */}
        {step === 5 && (
          <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-12 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20"
            >
              <PartyPopper size={40} className="text-green-400" />
            </motion.div>
            <h2 className="font-heading text-3xl text-accent-gold">Siparişiniz Tamamlandı!</h2>
            <p className="text-text-secondary">Sipariş numaranız: <span className="font-mono text-white">{orderId}</span></p>
            <div className="flex gap-3">
              <Link to="/orders" className="rounded-xl bg-accent-purple/20 px-6 py-3 text-accent-purple hover:bg-accent-purple/30">
                Siparişlerim
              </Link>
              <Link to="/" className="rounded-xl bg-accent-red px-6 py-3 font-semibold text-white hover:bg-accent-red/90">
                Anasayfa
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
