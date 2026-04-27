/**
 * TMDB + OMDB API ile film verisi çekip mockData.ts dosyasına gömen script.
 *
 * Kullanım:
 *   1. https://www.themoviedb.org/signup adresinden ücretsiz hesap aç
 *   2. Profil → Settings → API → "Request an API Key" ile v3 key al
 *   3. (Opsiyonel) https://www.omdbapi.com/apikey.aspx → IMDB puanı için key al
 *   4. Aşağıdaki değişkenlere key'leri yapıştır
 *   5. Çalıştır: node scripts/fetchFilms.mjs
 */

const TMDB_API_KEY = 'ef99dd7088a7cb918e2736b525a9459f';
const OMDB_API_KEY = ''; // Opsiyonel — gerçek IMDB puanı istiyorsan

const TMDB_BASE = 'https://api.themoviedb.org/3';
const OMDB_BASE = 'https://www.omdbapi.com';
const IMG_BASE = 'https://image.tmdb.org/t/p';

// Çekilecek film sayısı (sayfa başı 20 film × PAGE_COUNT)
const PAGE_COUNT = 5;

// TMDB tür ID → Türkçe karşılık
const genreMap = {
  28: 'Aksiyon',
  12: 'Macera',
  16: 'Animasyon',
  35: 'Komedi',
  80: 'Gerilim',
  99: 'Belgesel',
  18: 'Dram',
  14: 'Macera',
  27: 'Korku',
  10402: 'Komedi',
  9648: 'Gerilim',
  10749: 'Romantik',
  878: 'Bilim Kurgu',
  10770: 'Dram',
  53: 'Gerilim',
  10752: 'Aksiyon',
  37: 'Macera',
};

// Çözünürlük tahmini
function guessResolution(releaseDate) {
  const year = new Date(releaseDate).getFullYear();
  if (year >= 2016) return '4K';
  if (year >= 2000) return 'HD';
  return 'SD';
}

// Yaş sınıfı — TMDB certification
function mapAgeRating(certifications) {
  const tr = certifications?.results?.find((r) => r.iso_3166_1 === 'TR');
  const us = certifications?.results?.find((r) => r.iso_3166_1 === 'US');
  const cert = tr?.release_dates?.[0]?.certification || us?.release_dates?.[0]?.certification || '';
  if (['G', '7+'].includes(cert)) return '7+';
  if (['PG', 'PG-13', '13+'].includes(cert)) return '13+';
  if (['R', '16+'].includes(cert)) return '16+';
  if (['NC-17', '18+'].includes(cert)) return '18+';
  return '13+';
}

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function getImdbRating(imdbId) {
  if (!OMDB_API_KEY || !imdbId) return null;
  try {
    const data = await fetchJSON(`${OMDB_BASE}/?i=${imdbId}&apikey=${OMDB_API_KEY}`);
    return data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null;
  } catch {
    return null;
  }
}

async function fetchAllFilms() {
  console.log('🎬 Film verileri çekiliyor...\n');

  if (TMDB_API_KEY === 'BURAYA_TMDB_API_KEY_YAZ') {
    console.error('❌ Lütfen TMDB_API_KEY değişkenini doldurun!');
    console.log('   https://www.themoviedb.org/signup adresinden alabilirsiniz.');
    process.exit(1);
  }

  // 1. Popüler filmler listesi
  let allMovies = [];
  for (let page = 1; page <= PAGE_COUNT; page++) {
    const data = await fetchJSON(
      `${TMDB_BASE}/movie/top_rated?api_key=${TMDB_API_KEY}&language=tr-TR&page=${page}`
    );
    allMovies.push(...data.results);
    console.log(`  Sayfa ${page} çekildi (${data.results.length} film)`);
  }

  // 2. Her film için detay + video + credits + certifications
  const films = [];
  for (let i = 0; i < allMovies.length; i++) {
    const m = allMovies[i];
    console.log(`  [${i + 1}/${allMovies.length}] ${m.title}...`);

    try {
      const [detail, credits, videos, releaseDates] = await Promise.all([
        fetchJSON(`${TMDB_BASE}/movie/${m.id}?api_key=${TMDB_API_KEY}&language=tr-TR`),
        fetchJSON(`${TMDB_BASE}/movie/${m.id}/credits?api_key=${TMDB_API_KEY}&language=tr-TR`),
        fetchJSON(`${TMDB_BASE}/movie/${m.id}/videos?api_key=${TMDB_API_KEY}&language=tr-TR`),
        fetchJSON(`${TMDB_BASE}/movie/${m.id}/release_dates?api_key=${TMDB_API_KEY}`),
      ]);

      // Trailer URL
      let trailer = videos.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
      if (!trailer) {
        // Fallback: İngilizce trailer
        const videosEn = await fetchJSON(
          `${TMDB_BASE}/movie/${m.id}/videos?api_key=${TMDB_API_KEY}&language=en-US`
        );
        trailer = videosEn.results?.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
      }

      // IMDB puanı (opsiyonel)
      const imdbRating = await getImdbRating(detail.imdb_id);

      // Tür dönüştürme
      const genres = detail.genres
        ?.map((g) => genreMap[g.id])
        .filter(Boolean)
        .filter((v, idx, arr) => arr.indexOf(v) === idx)
        .slice(0, 3) || ['Dram'];

      // Rastgele fiyat
      const basePrice = (Math.floor(Math.random() * 6) + 5) * 10 - 0.01; // 49.99 - 99.99
      const hasDiscount = Math.random() > 0.6;
      const discountPrice = hasDiscount
        ? Math.round(basePrice * (0.6 + Math.random() * 0.2) * 100) / 100
        : undefined;

      const film = {
        id: String(m.id),
        title: detail.title || m.title,
        originalTitle: detail.original_title || m.original_title,
        year: new Date(detail.release_date || m.release_date).getFullYear(),
        duration: detail.runtime || 120,
        director: credits.crew?.find((c) => c.job === 'Director')?.name || 'Bilinmiyor',
        cast: credits.cast?.slice(0, 4).map((c) => c.name) || [],
        genres,
        rating: imdbRating || Math.round(detail.vote_average * 10) / 10,
        price: basePrice,
        ...(discountPrice && { discountPrice }),
        poster: m.poster_path ? `${IMG_BASE}/w500${m.poster_path}` : '',
        backdrop: m.backdrop_path ? `${IMG_BASE}/original${m.backdrop_path}` : '',
        ...(trailer && { trailerUrl: `https://www.youtube.com/embed/${trailer.key}` }),
        description: detail.overview || m.overview || '',
        language: detail.spoken_languages?.[0]?.name || 'İngilizce',
        country:
          detail.production_countries?.[0]?.name === 'United States of America'
            ? 'ABD'
            : detail.production_countries?.[0]?.name || 'Bilinmiyor',
        resolution: guessResolution(detail.release_date),
        subtitles: ['Türkçe', 'İngilizce'],
        ageRating: mapAgeRating(releaseDates),
        awards: [],
        status: 'published',
        createdAt: new Date().toISOString().split('T')[0],
      };

      films.push(film);
    } catch (err) {
      console.warn(`  ⚠ ${m.title} atlandı: ${err.message}`);
    }
  }

  return films;
}

function generateTypeScript(films) {
  const filmLines = films
    .map((f) => {
      const entries = Object.entries(f)
        .map(([key, val]) => {
          if (val === undefined) return null;
          if (typeof val === 'string') return `    ${key}: ${JSON.stringify(val)},`;
          if (Array.isArray(val))
            return `    ${key}: ${JSON.stringify(val)},`;
          return `    ${key}: ${val},`;
        })
        .filter(Boolean)
        .join('\n');
      return `  {\n${entries}\n  }`;
    })
    .join(',\n');

  return `// ⚡ Bu dosya otomatik oluşturuldu — scripts/fetchFilms.mjs tarafından
// Son güncelleme: ${new Date().toISOString()}
import type { Film, Order, User } from '@/types';

export const mockFilms: Film[] = [
${filmLines},
];

export const mockUser: User = {
  id: 'u1',
  name: 'Ali Yılmaz',
  email: 'ali@example.com',
  role: 'user',
  loyaltyPoints: 250,
};

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    items: [{ film: mockFilms[0], quantity: 1 }, { film: mockFilms[4], quantity: 1 }],
    total: 109.98,
    status: 'completed',
    createdAt: '2026-04-10T14:30:00Z',
    paymentMethod: 'Kredi Kartı',
  },
  {
    id: 'ORD-002',
    items: [{ film: mockFilms[2], quantity: 1 }],
    total: 54.99,
    status: 'processing',
    createdAt: '2026-04-15T09:15:00Z',
    paymentMethod: 'Dijital Cüzdan',
  },
];

export const genres: { name: string; icon: string }[] = [
  { name: 'Aksiyon', icon: '💥' },
  { name: 'Dram', icon: '🎭' },
  { name: 'Komedi', icon: '😂' },
  { name: 'Bilim Kurgu', icon: '🚀' },
  { name: 'Korku', icon: '👻' },
  { name: 'Romantik', icon: '💕' },
  { name: 'Gerilim', icon: '🔍' },
  { name: 'Animasyon', icon: '✨' },
  { name: 'Belgesel', icon: '📽️' },
  { name: 'Macera', icon: '🗺️' },
];

export const moods = [
  { emoji: '😊', label: 'Mutlu', genres: ['Komedi', 'Romantik', 'Animasyon'] },
  { emoji: '😢', label: 'Duygusal', genres: ['Dram', 'Romantik'] },
  { emoji: '😱', label: 'Heyecanlı', genres: ['Aksiyon', 'Gerilim', 'Korku'] },
  { emoji: '🤔', label: 'Düşünceli', genres: ['Bilim Kurgu', 'Belgesel', 'Dram'] },
  { emoji: '😴', label: 'Rahat', genres: ['Animasyon', 'Komedi'] },
  { emoji: '🤩', label: 'Maceracı', genres: ['Macera', 'Aksiyon', 'Bilim Kurgu'] },
];
`;
}

async function main() {
  const films = await fetchAllFilms();
  console.log(`\n✅ ${films.length} film çekildi.`);

  const { writeFileSync } = await import('fs');
  const { resolve, dirname } = await import('path');
  const { fileURLToPath } = await import('url');

  const __dirname = dirname(fileURLToPath(import.meta.url));
  const outPath = resolve(__dirname, '..', 'src', 'data', 'mockData.ts');
  writeFileSync(outPath, generateTypeScript(films), 'utf-8');
  console.log(`📁 ${outPath} dosyasına yazıldı.\n`);
}

main().catch((err) => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
