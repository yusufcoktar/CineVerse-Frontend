import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/store/notificationStore'; // Yolun projene göre doğru olduğundan emin ol
import {
  ArrowLeft, Upload, Film, Star, Clock, Globe, Tag, Users as UsersIcon,
  Award, Image, Play, DollarSign, Check, X, Plus, Trash2, Eye,
  ChevronDown, Sparkles, Clapperboard, Save, Send,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Genre } from '@/types';
import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Kurşun Geçirmez YouTube Embed Dönüştürücü
const getEmbedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('/embed/')) return url; // Zaten embed ise dokunma
  
  // Linkin içindeki 11 haneli asıl video ID'sini bulur
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}` // Tertemiz embed linki
    : url;
};
/* ─── Prop Interfaces ─── */
interface InfoStepProps {
  title: string; setTitle: (v: string) => void;
  originalTitle: string; setOriginalTitle: (v: string) => void;
  year: number; setYear: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
  director: string; setDirector: (v: string) => void;
  castInput: string; setCastInput: (v: string) => void;
  cast: string[]; addCast: () => void; removeCast: (v: string) => void;
  genres: Genre[]; toggleGenre: (g: Genre) => void;
  rating: number; setRating: (v: number) => void;
  description: string; setDescription: (v: string) => void;
  language: string; setLanguage: (v: string) => void;
  country: string; setCountry: (v: string) => void;
  resolution: '4K' | 'HD' | 'SD'; setResolution: (v: '4K' | 'HD' | 'SD') => void;
  subtitles: string[]; toggleSubtitle: (v: string) => void;
  ageRating: string; setAgeRating: (v: string) => void;
  awardName: string; setAwardName: (v: string) => void;
  awardYear: number; setAwardYear: (v: number) => void;
  awardCategory: string; setAwardCategory: (v: string) => void;
  awards: { name: string; year: number; category: string }[];
  addAward: () => void; removeAward: (i: number) => void;
  inputClass: string; labelClass: string;
}

interface MediaStepProps {
  posterUrl: string; setPosterUrl: (v: string) => void;
  backdropUrl: string; setBackdropUrl: (v: string) => void;
  trailerUrl: string; setTrailerUrl: (v: string) => void;
  inputClass: string; labelClass: string; title: string;
}

interface PricingStepProps {
  price: number; setPrice: (v: number) => void;
  discountPrice: number | ''; setDiscountPrice: (v: number | '') => void;
  discountEnds: string; setDiscountEnds: (v: string) => void;
  inputClass: string; labelClass: string;
}

interface ReviewFilm {
  title: string; originalTitle: string; year: number; duration: number;
  director: string; cast: string[]; genres: Genre[]; rating: number;
  description: string; language: string; country: string;
  resolution: string; subtitles: string[]; ageRating: string;
  posterUrl: string; backdropUrl: string; trailerUrl: string;
  price: number; discountPrice: number | ''; discountEnds: string;
  status: string; awards: { name: string; year: number; category: string }[];
}

const ALL_GENRES: Genre[] = [
  'Aksiyon', 'Dram', 'Komedi', 'Bilim Kurgu', 'Korku',
  'Romantik', 'Gerilim', 'Animasyon', 'Belgesel', 'Macera',
];

const GENRE_ICONS: Record<string, string> = {
  'Aksiyon': '💥', 'Dram': '🎭', 'Komedi': '😂', 'Bilim Kurgu': '🚀',
  'Korku': '👻', 'Romantik': '💕', 'Gerilim': '🔍', 'Animasyon': '✨',
  'Belgesel': '📽️', 'Macera': '🗺️',
};

const RESOLUTIONS = ['4K', 'HD', 'SD'] as const;
const AGE_RATINGS = ['Genel', '7+', '13+', '16+', '18+'];
const LANGUAGES = ['Türkçe', 'English', 'Deutsch', 'Français', 'Español', '日本語', '한국어', 'العربية'];
const COUNTRIES = ['Türkiye', 'ABD', 'United Kingdom', 'Fransa', 'Almanya', 'Japan', 'Güney Kore', 'İtalya', 'İspanya'];
const SUBTITLE_OPTIONS = ['Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'İspanyolca', 'Arapça', 'Japonca', 'Korece'];

type FormStep = 'info' | 'media' | 'pricing' | 'review';

export default function AdminAddFilmPage() {
  const navigate = useNavigate();
  const posterInputRef = useRef<HTMLInputElement>(null);
  const backdropInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState<FormStep>('info');
  const [success, setSuccess] = useState(false);

  // SİHİRLİ DOKUNUŞ: Cüzdandaki pasaportu alıyoruz
  const token = useAuthStore((s) => s.token);

  const { addNotification } = useNotificationStore();
  // Form state
  const [title, setTitle] = useState('');
  const [originalTitle, setOriginalTitle] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [duration, setDuration] = useState(120);
  const [director, setDirector] = useState('');
  const [castInput, setCastInput] = useState('');
  const [cast, setCast] = useState<string[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [rating, setRating] = useState(7.0);
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Türkçe');
  const [country, setCountry] = useState('Türkiye');
  const [resolution, setResolution] = useState<'4K' | 'HD' | 'SD'>('HD');
  const [subtitles, setSubtitles] = useState<string[]>(['Türkçe', 'İngilizce']);
  const [ageRating, setAgeRating] = useState('13+');
  const [posterUrl, setPosterUrl] = useState('');
  const [backdropUrl, setBackdropUrl] = useState('');
  const [trailerUrl, setTrailerUrl] = useState('');
  const [price, setPrice] = useState(69.99);
  const [discountPrice, setDiscountPrice] = useState<number | ''>('');
  const [discountEnds, setDiscountEnds] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [awardName, setAwardName] = useState('');
  const [awardYear, setAwardYear] = useState(new Date().getFullYear());
  const [awardCategory, setAwardCategory] = useState('');
  const [awards, setAwards] = useState<{ name: string; year: number; category: string }[]>([]);

  const steps: { key: FormStep; label: string; icon: typeof Film }[] = [
    { key: 'info', label: 'Temel Bilgiler', icon: Film },
    { key: 'media', label: 'Medya & Görsel', icon: Image },
    { key: 'pricing', label: 'Fiyat & Yayın', icon: DollarSign },
    { key: 'review', label: 'Önizleme', icon: Eye },
  ];

  const stepIndex = steps.findIndex((s) => s.key === currentStep);

  const toggleGenre = (g: Genre) => {
    setGenres((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);
  };

  const addCast = () => {
    const trimmed = castInput.trim();
    if (trimmed && !cast.includes(trimmed)) {
      setCast((prev) => [...prev, trimmed]);
      setCastInput('');
    }
  };

  const removeCast = (name: string) => {
    setCast((prev) => prev.filter((c) => c !== name));
  };

  const toggleSubtitle = (sub: string) => {
    setSubtitles((prev) => prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]);
  };

  const addAward = () => {
    if (awardName.trim() && awardCategory.trim()) {
      setAwards((prev) => [...prev, { name: awardName.trim(), year: awardYear, category: awardCategory.trim() }]);
      setAwardName('');
      setAwardCategory('');
    }
  };

  const removeAward = (i: number) => {
    setAwards((prev) => prev.filter((_, idx) => idx !== i));
  };

 const handleSubmit = async () => {
    try {
      // 1. Arayüzdeki verileri senin yazdığın C# DTO'sunun (MovieCreateDto) beklediği formata çeviriyoruz
      const payload = {
        title: title,
        originalTitle: originalTitle,
        releaseYear: year, // C# tarafında ReleaseYear olarak ayarlamıştık
        duration: duration,
        director: director,
        description: description,
        imdbRating: rating,
        language: language,
        country: country,
        resolution: resolution,
        ageLimit: ageRating,
        
        // Altyazıları virgülle ayırıp tek bir string yapıyoruz
        subtitleLanguages: subtitles.join(', '), 
        
        genres: genres, 
        
        // İŞTE EKSİK OLAN KABLO BURASI:
        // Formda eklediğimiz oyuncu listesini (cast) backend'e gönderiyoruz
        cast: cast, 
        
        posterUrl: posterUrl,
        backdropUrl: backdropUrl,
        trailerUrl: trailerUrl,
        price: price,
        discountedPrice: discountPrice === '' ? null : Number(discountPrice) // C# null bekliyor
      };

     // 2. Hazırladığımız bu veri paketini PASAPORTUMUZLA (Token) birlikte backend'e gönderiyoruz
      const response = await axios.post('https://localhost:7041/api/Movies', payload, {
        headers: {
          Authorization: `Bearer ${token}` // İşte gümrükten geçiş iznimiz!
        }
      });

      if (response.status === 200) {
        // Film başarıyla eklendi! Şov (Animasyon) başlasın:
        setSuccess(true);
        setTimeout(() => {
          navigate('/'); // Admin paneli boş olduğu için şimdilik anasayfaya yönlendirsin
        }, 2000);
      }
   } catch (error) {
      console.error("Film eklenirken bir hata oluştu:", error);
      addNotification({
        type: 'system',
        title: 'Ekleme Başarısız',
        message: 'Film sunucuya gönderilirken bir hata oluştu. Lütfen verileri kontrol edin.'
      });
    }
  }

  const inputClass =
    'w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-text-muted transition-all focus:border-accent-purple/40 focus:bg-white/[0.06] focus:ring-1 focus:ring-accent-purple/20';

  const labelClass = 'mb-1.5 block text-xs font-medium text-text-muted';

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Success Overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-4 rounded-3xl bg-bg-secondary p-10 ring-1 ring-white/10"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <Check size={32} className="text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Film Başarıyla Eklendi!</h2>
              <p className="text-sm text-text-muted">Yönetim paneline yönlendiriliyorsunuz...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-bg-primary/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Admin Panel</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-red to-pink-600">
                <Plus size={16} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Yeni Film Ekle</h1>
                <p className="text-[11px] text-text-muted">Kapsamlı film bilgilerini girin</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setStatus('draft'); handleSubmit(); }}
              className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-white/[0.1] hover:text-white"
            >
              <Save size={14} />
              Taslak Kaydet
            </button>
            <button
              onClick={() => { setStatus('published'); handleSubmit(); }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-red to-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent-red/25 transition-all hover:shadow-accent-red/40 hover:brightness-110"
            >
              <Send size={14} />
              Yayınla
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Step Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <button
                key={step.key}
                onClick={() => setCurrentStep(step.key)}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <div className="flex w-full items-center">
                  <div className="flex-1 h-0.5 rounded-full bg-white/[0.06]">
                    {i <= stepIndex && i > 0 && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="h-full rounded-full bg-accent-red"
                      />
                    )}
                  </div>
                  <div
                    className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                      i <= stepIndex
                        ? 'bg-accent-red/20 text-accent-red ring-2 ring-accent-red/30'
                        : 'bg-white/[0.04] text-text-muted ring-1 ring-white/[0.06]'
                    }`}
                  >
                    {i < stepIndex ? <Check size={16} /> : <step.icon size={16} />}
                  </div>
                  <div className="flex-1 h-0.5 rounded-full bg-white/[0.06]">
                    {i < stepIndex && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        className="h-full rounded-full bg-accent-red"
                      />
                    )}
                  </div>
                </div>
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    i <= stepIndex ? 'text-white' : 'text-text-muted'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {currentStep === 'info' && (
              <InfoStep
                {...{ title, setTitle, originalTitle, setOriginalTitle, year, setYear, duration, setDuration, director, setDirector, castInput, setCastInput, cast, addCast, removeCast, genres, toggleGenre, rating, setRating, description, setDescription, language, setLanguage, country, setCountry, resolution, setResolution, subtitles, toggleSubtitle, ageRating, setAgeRating, awardName, setAwardName, awardYear, setAwardYear, awardCategory, setAwardCategory, awards, addAward, removeAward, inputClass, labelClass }}
              />
            )}
            {currentStep === 'media' && (
              <MediaStep
                {...{ posterUrl, setPosterUrl, backdropUrl, setBackdropUrl, trailerUrl, setTrailerUrl, posterInputRef, backdropInputRef, inputClass, labelClass, title }}
              />
            )}
            {currentStep === 'pricing' && (
              <PricingStep
                {...{ price, setPrice, discountPrice, setDiscountPrice, discountEnds, setDiscountEnds, status, setStatus, inputClass, labelClass }}
              />
            )}
            {currentStep === 'review' && (
              <ReviewStep
                film={{
                  title, originalTitle, year, duration, director, cast, genres, rating, description,
                  language, country, resolution, subtitles, ageRating, posterUrl, backdropUrl, trailerUrl,
                 price, discountPrice: discountPrice || "", discountEnds: discountEnds || "",
                  status, awards,
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => {
              const prev = steps[stepIndex - 1];
              if (prev) setCurrentStep(prev.key);
            }}
            disabled={stepIndex === 0}
            className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/[0.08] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
          >
            <ArrowLeft size={14} />
            Geri
          </button>
          {stepIndex < steps.length - 1 ? (
            <button
              onClick={() => {
                const next = steps[stepIndex + 1];
                if (next) setCurrentStep(next.key);
              }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/25 transition-all hover:shadow-accent-purple/40 hover:brightness-110"
            >
              Devam Et
              <ChevronDown size={14} className="-rotate-90" />
            </button>
          ) : (
            <button
              onClick={() => { setStatus('published'); handleSubmit(); }}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/40 hover:brightness-110"
            >
              <Send size={14} />
              Filmi Yayınla
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 1: INFO
   ═══════════════════════════════════════════════════════════ */
function InfoStep({
  title, setTitle, originalTitle, setOriginalTitle, year, setYear, duration, setDuration,
  director, setDirector, castInput, setCastInput, cast, addCast, removeCast,
  genres, toggleGenre, rating, setRating, description, setDescription,
  language, setLanguage, country, setCountry, resolution, setResolution,
  subtitles, toggleSubtitle, ageRating, setAgeRating,
  awardName, setAwardName, awardYear, setAwardYear, awardCategory, setAwardCategory,
  awards, addAward, removeAward, inputClass, labelClass,
}: InfoStepProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Left Column - Main Info */}
      <div className="lg:col-span-2 space-y-6">
        {/* Title Section */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Clapperboard size={18} className="text-accent-red" />
            <h3 className="font-semibold text-white">Film Bilgileri</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Film Adı *</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Türkçe başlık" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Orijinal Başlık</label>
              <input type="text" value={originalTitle} onChange={(e) => setOriginalTitle(e.target.value)} placeholder="Original title" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Yapım Yılı *</label>
              <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min={1900} max={2030} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Süre (dk) *</label>
              <div className="relative">
                <Clock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={1} className={`${inputClass} pl-10`} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Yönetmen *</label>
              <input type="text" value={director} onChange={(e) => setDirector(e.target.value)} placeholder="Yönetmen adı" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles size={18} className="text-accent-purple" />
            <h3 className="font-semibold text-white">Film Açıklaması</h3>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Film konusunu detaylı bir şekilde anlatın..."
            rows={6}
            className={`${inputClass} resize-none`}
          />
          <p className="mt-2 text-[11px] text-text-muted">{description.length} karakter</p>
        </div>

        {/* Cast */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <UsersIcon size={18} className="text-accent-gold" />
            <h3 className="font-semibold text-white">Oyuncu Kadrosu</h3>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={castInput}
              onChange={(e) => setCastInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCast(); } }}
              placeholder="Oyuncu adı ekle..."
              className={`${inputClass} flex-1`}
            />
            <button
              onClick={addCast}
              className="rounded-xl bg-accent-gold/15 px-4 text-accent-gold transition-colors hover:bg-accent-gold/25"
            >
              <Plus size={16} />
            </button>
          </div>
          {cast.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {cast.map((name: string) => (
                <span key={name} className="flex items-center gap-1.5 rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-white ring-1 ring-white/[0.06]">
                  {name}
                  <button onClick={() => removeCast(name)} className="text-text-muted hover:text-accent-red transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Awards */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Award size={18} className="text-accent-gold" />
            <h3 className="font-semibold text-white">Ödüller</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <input type="text" value={awardName} onChange={(e) => setAwardName(e.target.value)} placeholder="Ödül adı (ör. Oscar)" className={inputClass} />
            <input type="number" value={awardYear} onChange={(e) => setAwardYear(Number(e.target.value))} min={1900} max={2030} className={inputClass} />
            <div className="flex gap-2">
              <input type="text" value={awardCategory} onChange={(e) => setAwardCategory(e.target.value)} placeholder="Kategori" className={`${inputClass} flex-1`} />
              <button onClick={addAward} className="rounded-xl bg-accent-gold/15 px-4 text-accent-gold transition-colors hover:bg-accent-gold/25">
                <Plus size={16} />
              </button>
            </div>
          </div>
          {awards.length > 0 && (
            <div className="mt-4 space-y-2">
              {awards.map((aw: { name: string; year: number; category: string }, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.04] px-4 py-2.5 ring-1 ring-white/[0.04]">
                  <div className="flex items-center gap-3">
                    <Award size={14} className="text-accent-gold" />
                    <div>
                      <p className="text-sm font-medium text-white">{aw.name} ({aw.year})</p>
                      <p className="text-[11px] text-text-muted">{aw.category}</p>
                    </div>
                  </div>
                  <button onClick={() => removeAward(i)} className="text-text-muted hover:text-accent-red transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Side Info */}
      <div className="space-y-6">
        {/* Genres */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Tag size={18} className="text-accent-red" />
            <h3 className="font-semibold text-white">Türler *</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ALL_GENRES.map((g) => (
              <button
                key={g}
                onClick={() => toggleGenre(g)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                  genres.includes(g)
                    ? 'bg-accent-red/15 text-accent-red ring-1 ring-accent-red/25 shadow-sm shadow-accent-red/10'
                    : 'bg-white/[0.04] text-text-secondary ring-1 ring-white/[0.06] hover:bg-white/[0.08]'
                }`}
              >
                <span>{GENRE_ICONS[g]}</span>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Star size={18} className="text-accent-gold" />
            <h3 className="font-semibold text-white">IMDB Puanı</h3>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={10}
              step={0.1}
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="flex-1 accent-accent-gold"
            />
            <div className="flex items-center gap-1 rounded-xl bg-accent-gold/15 px-3 py-2 ring-1 ring-accent-gold/20">
              <Star size={14} className="text-accent-gold" fill="#FFD700" />
              <span className="font-mono text-lg font-bold text-accent-gold">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Language & Country */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Globe size={18} className="text-blue-400" />
            <h3 className="font-semibold text-white">Dil & Ülke</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className={labelClass}>Dil</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputClass}>
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Ülke</label>
              <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Resolution */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Film size={18} className="text-accent-purple" />
            <h3 className="font-semibold text-white">Çözünürlük</h3>
          </div>
          <div className="flex gap-2">
            {RESOLUTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setResolution(r)}
                className={`flex-1 rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                  resolution === r
                    ? r === '4K'
                      ? 'bg-accent-gold/15 text-accent-gold ring-1 ring-accent-gold/25'
                      : r === 'HD'
                      ? 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/25'
                      : 'bg-white/10 text-white ring-1 ring-white/20'
                    : 'bg-white/[0.04] text-text-muted ring-1 ring-white/[0.06] hover:bg-white/[0.08]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Age Rating */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <label className={labelClass}>Yaş Sınırı</label>
          <div className="flex flex-wrap gap-2">
            {AGE_RATINGS.map((a) => (
              <button
                key={a}
                onClick={() => setAgeRating(a)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  ageRating === a
                    ? 'bg-accent-red/15 text-accent-red ring-1 ring-accent-red/25'
                    : 'bg-white/[0.04] text-text-muted ring-1 ring-white/[0.06] hover:bg-white/[0.08]'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Subtitles */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <label className={labelClass}>Altyazı Dilleri</label>
          <div className="flex flex-wrap gap-2">
            {SUBTITLE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => toggleSubtitle(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  subtitles.includes(s)
                    ? 'bg-accent-purple/15 text-accent-purple ring-1 ring-accent-purple/25'
                    : 'bg-white/[0.04] text-text-muted ring-1 ring-white/[0.06] hover:bg-white/[0.08]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 2: MEDIA
   ═══════════════════════════════════════════════════════════ */
function MediaStep({ posterUrl, setPosterUrl, backdropUrl, setBackdropUrl, trailerUrl, setTrailerUrl, inputClass, labelClass, title }: MediaStepProps) {
  return (
    <div className="space-y-8">
      {/* Image URLs */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Poster */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Image size={18} className="text-accent-red" />
            <h3 className="font-semibold text-white">Film Posteri</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Poster URL</label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://image.tmdb.org/t/p/w500/..."
                className={inputClass}
              />
            </div>
            {/* Preview */}
            <div className="relative mx-auto aspect-[2/3] w-48 overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08]">
              {posterUrl ? (
                <img src={posterUrl} alt="Poster" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-text-muted">
                  <Upload size={32} className="text-white/10" />
                  <p className="text-xs">Poster Önizleme</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100" />
            </div>
          </div>
        </div>

        {/* Backdrop */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Image size={18} className="text-accent-purple" />
            <h3 className="font-semibold text-white">Arka Plan Görseli</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Backdrop URL</label>
              <input
                type="url"
                value={backdropUrl}
                onChange={(e) => setBackdropUrl(e.target.value)}
                placeholder="https://image.tmdb.org/t/p/original/..."
                className={inputClass}
              />
            </div>
            {/* Preview */}
            <div className="relative aspect-video overflow-hidden rounded-2xl bg-white/[0.04] ring-1 ring-white/[0.08]">
              {backdropUrl ? (
                <img src={backdropUrl} alt="Backdrop" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-text-muted">
                  <Upload size={32} className="text-white/10" />
                  <p className="text-xs">Arka Plan Önizleme</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trailer */}
      <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
        <div className="mb-5 flex items-center gap-2">
          <Play size={18} className="text-accent-gold" />
          <h3 className="font-semibold text-white">Fragman</h3>
        </div>
        <div>
          <label className={labelClass}>YouTube Embed URL</label>
          <input
            type="url"
            value={trailerUrl}
            onChange={(e) => setTrailerUrl(e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
            className={inputClass}
          />
        </div>
        {trailerUrl && (
          <div className="mt-4 aspect-video overflow-hidden rounded-2xl ring-1 ring-white/[0.08]">
           <iframe
              src={getEmbedUrl(trailerUrl)}
              title={`${title} Fragman`}
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Combined Preview */}
      {(posterUrl || backdropUrl) && (
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <div className="mb-5 flex items-center gap-2">
            <Eye size={18} className="text-green-400" />
            <h3 className="font-semibold text-white">Birleşik Önizleme</h3>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            {backdropUrl && (
              <img src={backdropUrl} alt="Backdrop" className="h-64 w-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            {posterUrl && (
              <div className="absolute bottom-4 left-6">
                <img src={posterUrl} alt="Poster" className="h-40 w-28 rounded-xl object-cover ring-2 ring-white/20 shadow-2xl" />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 3: PRICING
   ═══════════════════════════════════════════════════════════ */
function PricingStep({ price, setPrice, discountPrice, setDiscountPrice, discountEnds, setDiscountEnds, inputClass, labelClass }: PricingStepProps) {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Price */}
      <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
        <div className="mb-5 flex items-center gap-2">
          <DollarSign size={18} className="text-green-400" />
          <h3 className="font-semibold text-white">Fiyatlandırma</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Satış Fiyatı (₺) *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">₺</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                min={0}
                step={0.01}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>İndirimli Fiyat (₺)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">₺</span>
              <input
                type="number"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : '')}
                min={0}
                step={0.01}
                placeholder="Opsiyonel"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>
        </div>

        {discountPrice && (
          <div className="mt-4">
            <label className={labelClass}>İndirim Bitiş Tarihi</label>
            <input
              type="date"
              value={discountEnds}
              onChange={(e) => setDiscountEnds(e.target.value)}
              className={inputClass}
            />
          </div>
        )}

        {/* Price Preview Card */}
        <div className="mt-6 rounded-xl bg-white/[0.04] p-5 ring-1 ring-white/[0.06]">
          <p className="mb-3 text-xs font-medium text-text-muted">Fiyat Önizlemesi</p>
          <div className="flex items-end gap-3">
            {discountPrice ? (
              <>
                <span className="font-mono text-3xl font-bold text-accent-red">{Number(discountPrice).toFixed(2)} ₺</span>
                <span className="font-mono text-lg text-text-muted line-through">{price.toFixed(2)} ₺</span>
                <span className="rounded-lg bg-green-500/15 px-2 py-1 text-xs font-bold text-green-400">
                  %{Math.round((1 - Number(discountPrice) / price) * 100)} İndirim
                </span>
              </>
            ) : (
              <span className="font-mono text-3xl font-bold text-white">{price.toFixed(2)} ₺</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Price Presets */}
      <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
        <div className="mb-4 flex items-center gap-2">
          <Tag size={18} className="text-accent-purple" />
          <h3 className="font-semibold text-white">Hızlı Fiyat Ayarla</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {[29.99, 49.99, 69.99, 79.99, 89.99, 99.99, 129.99, 149.99].map((p) => (
            <button
              key={p}
              onClick={() => setPrice(p)}
              className={`rounded-xl px-4 py-2.5 font-mono text-sm font-medium transition-all ${
                price === p
                  ? 'bg-accent-purple/15 text-accent-purple ring-1 ring-accent-purple/25'
                  : 'bg-white/[0.04] text-text-secondary ring-1 ring-white/[0.06] hover:bg-white/[0.08]'
              }`}
            >
              {p.toFixed(2)} ₺
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   STEP 4: REVIEW
   ═══════════════════════════════════════════════════════════ */
function ReviewStep({ film }: { film: ReviewFilm }) {
  return (
    <div className="space-y-8">
      {/* Hero Preview */}
      <div className="relative overflow-hidden rounded-3xl">
        {film.backdropUrl ? (
          <img src={film.backdropUrl} alt="Backdrop" className="h-72 w-full object-cover" />
        ) : (
          <div className="h-72 w-full bg-gradient-to-br from-accent-red/20 via-accent-purple/10 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="flex items-end gap-6">
            {film.posterUrl ? (
              <img src={film.posterUrl} alt="Poster" className="h-48 w-32 rounded-2xl object-cover ring-2 ring-white/20 shadow-2xl" />
            ) : (
              <div className="flex h-48 w-32 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
                <Film size={32} className="text-text-muted" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-3xl font-bold text-white">{film.title || 'Film Adı'}</h2>
              {film.originalTitle && (
                <p className="mt-1 text-sm text-text-secondary italic">{film.originalTitle}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-accent-gold" fill="#FFD700" />
                  <span className="font-semibold text-white">{film.rating.toFixed(1)}</span>
                </span>
                <span>•</span>
                <span>{film.year}</span>
                <span>•</span>
                <span>{film.duration} dk</span>
                <span>•</span>
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  film.resolution === '4K' ? 'bg-accent-gold/20 text-accent-gold' :
                  film.resolution === 'HD' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-white/10 text-white'
                }`}>{film.resolution}</span>
                <span className="rounded-md bg-accent-red/15 px-2 py-0.5 text-[10px] font-bold text-accent-red">{film.ageRating}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {film.genres.map((g: string) => (
                  <span key={g} className="rounded-lg bg-white/[0.08] px-2.5 py-1 text-xs text-white">{g}</span>
                ))}
              </div>
            </div>
            <div className="text-right">
              {film.discountPrice ? (
                <div>
                  <p className="font-mono text-3xl font-bold text-accent-red">{Number(film.discountPrice).toFixed(2)} ₺</p>
                  <p className="font-mono text-sm text-text-muted line-through">{film.price.toFixed(2)} ₺</p>
                </div>
              ) : (
                <p className="font-mono text-3xl font-bold text-white">{film.price.toFixed(2)} ₺</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Info Card */}
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <h3 className="mb-4 font-semibold text-white">Film Detayları</h3>
          <div className="space-y-3">
            {[
              { label: 'Yönetmen', value: film.director },
              { label: 'Dil', value: film.language },
              { label: 'Ülke', value: film.country },
              { label: 'Altyazılar', value: film.subtitles.join(', ') },
              { label: 'Durum', value: film.status === 'published' ? 'Yayında' : 'Taslak' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between border-b border-white/[0.04] pb-2 last:border-0">
                <span className="text-sm text-text-muted">{item.label}</span>
                <span className="text-sm font-medium text-white">{item.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cast & Awards */}
        <div className="space-y-6">
          {film.cast.length > 0 && (
            <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
              <h3 className="mb-4 font-semibold text-white">Oyuncular</h3>
              <div className="flex flex-wrap gap-2">
                {film.cast.map((name: string) => (
                  <span key={name} className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-white ring-1 ring-white/[0.06]">{name}</span>
                ))}
              </div>
            </div>
          )}

          {film.awards.length > 0 && (
            <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
              <h3 className="mb-4 font-semibold text-white">Ödüller</h3>
              <div className="space-y-2">
                {film.awards.map((aw, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <Award size={14} className="text-accent-gold" />
                    <span className="text-sm text-white">{aw.name} ({aw.year})</span>
                    <span className="text-xs text-text-muted">— {aw.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {film.description && (
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <h3 className="mb-4 font-semibold text-white">Film Özeti</h3>
          <p className="text-sm leading-relaxed text-text-secondary">{film.description}</p>
        </div>
      )}

      {/* Trailer Preview */}
      {film.trailerUrl && (
        <div className="rounded-2xl bg-white/[0.03] p-6 ring-1 ring-white/[0.06]">
          <h3 className="mb-4 font-semibold text-white">Fragman Önizleme</h3>
          <div className="aspect-video overflow-hidden rounded-2xl ring-1 ring-white/[0.08]">
           <iframe
              src={getEmbedUrl(film.trailerUrl)}
              title="Fragman"
              className="h-full w-full"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
