import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Wallet, Building, Check, ArrowLeft, ArrowRight, PartyPopper, AlertCircle } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useAuthStore } from '@/store/authStore';
import { Link } from 'react-router-dom';
import axios from 'axios';

type Step = 1 | 2 | 3 | 4 | 5;
type PaymentMethod = 'card' | 'wallet' | 'iban';

export default function CheckoutPage() {
  const [step, setStep] = useState<Step>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [orderId, setOrderId] = useState('');
  
  // Mağazalardan (Stores) verileri çekiyoruz
  const { items, total, clear, coupon } = useCartStore();
  const addOrder = useOrderStore((s) => s.addOrder);
  const addFilmsToLibrary = useLibraryStore((s) => s.addFilms);
  const user = useAuthStore((s) => s.user);

  // Form ve Doğrulama Durumları (State) - TERTEMİZ, TEK SEFER!
  const [email, setEmail] = useState('');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
  const [errorMsg, setErrorMsg] = useState('');

  // Eğer sepet boşsa (ve sipariş henüz tamamlanmamışsa) alışverişe yönlendir
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

  // ADIM 2'DEN ADIM 3'E GEÇİŞ KONTROLÜ (E-Posta boş mu?)
  const handleStep2Next = () => {
    if (!email.trim()) {
      setErrorMsg('Lütfen iletişim için geçerli bir e-posta adresi girin.');
      return;
    }
    setErrorMsg('');
    setStep(3);
  };

  // ADIM 3'TEN ADIM 4'E GEÇİŞ KONTROLÜ (Kart bilgileri eksik mi?)
  const handleStep3Next = () => {
    if (paymentMethod === 'card') {
      if (cardData.number.length < 16 || cardData.expiry.length < 5 || cardData.cvv.length < 3) {
        setErrorMsg('Lütfen kredi kartı bilgilerinizi eksiksiz girin.');
        return;
      }
    }
    setErrorMsg('');
    setStep(4);
  };

 // SİPARİŞİ TAMAMLAMA İŞLEMİ (C# API BAĞLANTILI)
  const handleComplete = async () => {
    try {
      // Backend'in bizden beklediği formatta (CreateOrderDto) veriyi hazırlıyoruz
      const orderPayload = {
        userId: Number(user?.id || 1), // Eğer authStore'da id yoksa test için 1 numaralı kullanıcıya atar
        movieIds: items.map((i) => Number(i.film.id)), // Sepetteki filmlerin sadece ID'lerini alıyoruz
      };

      // Veritabanına (C# API'ye) siparişi fırlatıyoruz!
      await axios.post('https://localhost:7041/api/Orders', orderPayload);
    } catch (error) {
      console.error("Sipariş veritabanına kaydedilemedi:", error);
      setErrorMsg("Sipariş tamamlanırken bir hata oluştu. Backend API'sinin açık olduğundan emin olun.");
      return; // Hata varsa başarı sayfasına geçmeyi DURDUR!
    }

    // Backend'e kayıt BAŞARILI olursa, aşağıdaki React işlemlerine (Frontend) devam et
    const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
    setOrderId(newOrderId);

    // Siparişi geçmişe ekle
    addOrder({
      id: newOrderId,
      items: [...items],
      total: total(),
      status: 'completed',
      createdAt: new Date().toISOString(),
      paymentMethod: paymentMethod === 'card' ? 'Kredi Kartı' : paymentMethod === 'wallet' ? 'Dijital Cüzdan' : 'IBAN',
    });

    // Filmleri kütüphaneye ekle
    addFilmsToLibrary(items.map((i) => i.film));

    // Sepeti temizle ve başarı sayfasına git
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
      {/* İlerleme Çubuğu (Step Indicator) */}
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
        {/* ADIM 1: SEPET ÖZETİ */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="font-heading text-2xl text-accent-gold">Sepet Özeti</h2>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.film.id} className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
                  <img src={item.film.poster} alt={item.film.title} className="h-16 w-11 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{item.film.title}</h3>
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

        {/* ADIM 2: İLETİŞİM BİLGİLERİ */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="font-heading text-2xl text-accent-gold">İletişim Bilgileri</h2>
            
            {/* Hata Mesajı Gösterimi */}
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg bg-accent-red/10 p-3 text-sm text-accent-red border border-accent-red/20">
                <AlertCircle size={16} /> {errorMsg}
              </motion.div>
            )}

            <div className="rounded-xl bg-white/5 p-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-text-secondary">E-posta</label>
                <input 
                  type="email" 
                  placeholder="Gerçek e-postanızı girin..."
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg bg-white/5 px-4 py-3 text-white outline-none focus:ring-1 focus:ring-accent-purple" 
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-text-secondary">Kullanıcı Adı</label>
                <input 
                  type="text" 
                  value={user?.username || ''} 
                  readOnly
                  className="w-full rounded-lg bg-white/5 px-4 py-3 text-white outline-none opacity-70" 
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setErrorMsg(''); setStep(1); }} className="flex items-center gap-1 rounded-xl border border-white/10 px-6 py-3 text-text-secondary hover:bg-white/5">
                <ArrowLeft size={18} /> Geri
              </button>
              <button onClick={handleStep2Next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-red py-3 font-semibold text-white transition-all hover:bg-accent-red/90">
                Ödemeye Geç <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ADIM 3: ÖDEME YÖNTEMİ */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <h2 className="font-heading text-2xl text-accent-gold">Ödeme Yöntemi</h2>
            
            {/* Hata Mesajı Gösterimi */}
            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 rounded-lg bg-accent-red/10 p-3 text-sm text-accent-red border border-accent-red/20">
                <AlertCircle size={16} /> {errorMsg}
              </motion.div>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { key: 'card' as PaymentMethod, icon: CreditCard, label: 'Kredi Kartı' },
                { key: 'wallet' as PaymentMethod, icon: Wallet, label: 'Dijital Cüzdan' },
                { key: 'iban' as PaymentMethod, icon: Building, label: 'Havale / EFT' },
              ].map((method) => (
                <button
                  key={method.key}
                  onClick={() => { setPaymentMethod(method.key); setErrorMsg(''); }}
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

            {/* Kredi Kartı Formu */}
            {paymentMethod === 'card' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/5 p-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-text-secondary">Kart Numarası</label>
                  <input 
                    type="text" 
                    placeholder="1234 5678 9101 1121" 
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => setCardData({...cardData, number: e.target.value})}
                    className="w-full rounded-lg bg-white/5 px-4 py-3 font-mono text-white outline-none focus:ring-1 focus:ring-accent-purple" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm text-text-secondary">Son Kullanma</label>
                    <input 
                      type="text" 
                      placeholder="12/28" 
                      maxLength={5}
                      value={cardData.expiry}
                      onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                      className="w-full rounded-lg bg-white/5 px-4 py-3 font-mono text-white outline-none focus:ring-1 focus:ring-accent-purple" 
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-text-secondary">CVV</label>
                    <input 
                      type="text" 
                      placeholder="123" 
                      maxLength={3}
                      value={cardData.cvv}
                      onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
                      className="w-full rounded-lg bg-white/5 px-4 py-3 font-mono text-white outline-none focus:ring-1 focus:ring-accent-purple" 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Dijital Cüzdan Bilgisi */}
            {paymentMethod === 'wallet' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/5 p-6 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-purple/20">
                  <Wallet size={32} className="text-accent-purple" />
                </div>
                <h3 className="font-semibold text-white">Güvenli Yönlendirme Simülasyonu</h3>
                <p className="text-sm text-text-secondary">
                  Bu bir test ortamıdır. Siparişi onayla butonuna bastığınızda Papara/BKM sistemine bağlanmışsınız gibi işlem doğrudan onaylanacaktır.
                </p>
              </motion.div>
            )}

            {/* IBAN Bilgisi */}
            {paymentMethod === 'iban' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-white/5 p-6 space-y-4">
                <div className="rounded-lg border border-accent-gold/20 bg-accent-gold/5 p-5">
                  <p className="mb-1 text-sm text-text-secondary">Alıcı Adı Soyadı</p>
                  <p className="font-semibold text-white">CineVerse Bilişim Hizmetleri A.Ş.</p>
                  <div className="mt-4 border-t border-accent-gold/20 pt-4">
                    <p className="mb-1 text-sm text-text-secondary">Ziraat Bankası IBAN</p>
                    <p className="font-mono text-lg font-bold tracking-wider text-accent-gold">TR12 3456 7890 0000 0000 00</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setErrorMsg(''); setStep(2); }} className="flex items-center gap-1 rounded-xl border border-white/10 px-6 py-3 text-text-secondary hover:bg-white/5">
                <ArrowLeft size={18} /> Geri
              </button>
              <button onClick={handleStep3Next} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-red py-3 font-semibold text-white transition-all hover:bg-accent-red/90">
                Siparişi Onayla <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ADIM 4: ONAY */}
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
                <span className="font-semibold text-white">Toplam Ödenecek Tutar</span>
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

        {/* ADIM 5: BAŞARI */}
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
            <p className="text-sm text-text-muted mt-2">Satın aldığınız filmler kütüphanenize eklendi. İyi seyirler!</p>
            <div className="flex gap-3 mt-4">
              <Link to="/library" className="rounded-xl bg-accent-purple/20 px-6 py-3 text-accent-purple hover:bg-accent-purple/30">
                Kütüphaneme Git
              </Link>
              <Link to="/" className="rounded-xl bg-accent-red px-6 py-3 font-semibold text-white hover:bg-accent-red/90">
                Anasayfaya Dön
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}