// TMDB API ile 5+ filmlik serileri çek ve mockData'ya ekle
const API_KEY = 'ef99dd7088a7cb918e2736b525a9459f';
const BASE = 'https://api.themoviedb.org/3';

// Popular collections with 5+ films
const COLLECTIONS = [
  { id: 1241, name: 'Harry Potter' },
  { id: 10, name: 'Yıldız Savaşları' },
  { id: 9485, name: 'Hızlı ve Öfkeli' },
  { id: 87359, name: 'Görevimiz Tehlike' },
];

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function getCollection(colId) {
  const url = `${BASE}/collection/${colId}?api_key=${API_KEY}&language=tr-TR`;
  return fetchJSON(url);
}

async function getMovieDetails(movieId) {
  const url = `${BASE}/movie/${movieId}?api_key=${API_KEY}&language=tr-TR&append_to_response=credits,videos`;
  return fetchJSON(url);
}

const resolutions = ['HD', '4K', 'SD'];
const priceBase = [39.99, 44.99, 49.99, 54.99, 59.99];

function generateFilmObj(movie) {
  const cast = (movie.credits?.cast || []).slice(0, 4).map(c => c.name);
  const director = (movie.credits?.crew || []).find(c => c.job === 'Director')?.name || 'Bilinmiyor';
  const genres = (movie.genres || []).map(g => g.name);
  // Map TMDB genre names to Turkish
  const genreMap = {
    'Action': 'Aksiyon', 'Adventure': 'Macera', 'Animation': 'Animasyon',
    'Comedy': 'Komedi', 'Crime': 'Gerilim', 'Documentary': 'Belgesel',
    'Drama': 'Dram', 'Family': 'Aile', 'Fantasy': 'Fantastik',
    'History': 'Tarih', 'Horror': 'Korku', 'Music': 'Müzik',
    'Mystery': 'Gizem', 'Romance': 'Romantik', 'Science Fiction': 'Bilim Kurgu',
    'TV Movie': 'TV', 'Thriller': 'Gerilim', 'War': 'Savaş', 'Western': 'Batı',
    'Aksiyon': 'Aksiyon', 'Macera': 'Macera', 'Animasyon': 'Animasyon',
    'Komedi': 'Komedi', 'Suç': 'Gerilim', 'Belgesel': 'Belgesel',
    'Dram': 'Dram', 'Aile': 'Aile', 'Fantastik': 'Fantastik',
    'Tarih': 'Tarih', 'Korku': 'Korku', 'Müzik': 'Müzik',
    'Gizem': 'Gizem', 'Romantik': 'Romantik', 'Bilim Kurgu': 'Bilim Kurgu',
    'TV Film': 'TV', 'Gerilim': 'Gerilim', 'Savaş': 'Savaş',
  };
  const trGenres = genres.map(g => genreMap[g] || g);
  
  const trailer = (movie.videos?.results || []).find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const price = priceBase[Math.floor(Math.random() * priceBase.length)];
  const hasDiscount = Math.random() > 0.5;
  const discountPrice = hasDiscount ? Math.round((price * (0.7 + Math.random() * 0.2)) * 100) / 100 : undefined;
  const resolution = resolutions[Math.floor(Math.random() * resolutions.length)];

  return {
    id: String(movie.id),
    title: movie.title || movie.original_title,
    originalTitle: movie.original_title,
    year: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : 2000,
    duration: movie.runtime || 120,
    director,
    cast,
    genres: trGenres.length > 0 ? trGenres : ['Dram'],
    rating: Math.round((movie.vote_average || 7) * 10) / 10,
    price,
    discountPrice,
    poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
    backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '',
    trailerUrl: trailer ? `https://www.youtube.com/embed/${trailer.key}` : undefined,
    description: movie.overview || '',
    language: movie.original_language === 'en' ? 'English' : movie.original_language,
    country: 'ABD',
    resolution,
    subtitles: ['Türkçe', 'İngilizce'],
    ageRating: '13+',
    awards: [],
    status: 'published',
    createdAt: '2026-04-17',
  };
}

async function main() {
  const fs = await import('fs');
  const path = await import('path');
  
  // Read current mockData to find existing film IDs
  const mockDataPath = path.resolve('src/data/mockData.ts');
  const currentData = fs.readFileSync(mockDataPath, 'utf-8');
  
  // Extract existing film IDs
  const existingIds = new Set();
  const idRegex = /id:\s*"(\d+)"/g;
  let m;
  while ((m = idRegex.exec(currentData)) !== null) {
    existingIds.add(m[1]);
  }
  console.log(`Mevcut film sayısı: ${existingIds.size}`);

  const newFilms = [];
  const seriesData = [];

  for (const col of COLLECTIONS) {
    console.log(`\n📦 ${col.name} koleksiyonu çekiliyor (ID: ${col.id})...`);
    const collection = await getCollection(col.id);
    
    // Sort by release date, take first 6 films
    const parts = (collection.parts || [])
      .filter(p => p.release_date)
      .sort((a, b) => a.release_date.localeCompare(b.release_date))
      .slice(0, 6);
    
    console.log(`  ${parts.length} film bulundu`);
    
    const filmIds = [];
    
    for (const part of parts) {
      const id = String(part.id);
      filmIds.push(id);
      
      if (!existingIds.has(id)) {
        console.log(`  Çekiliyor: ${part.title || part.original_title} (${id})`);
        const details = await getMovieDetails(part.id);
        const filmObj = generateFilmObj(details);
        newFilms.push(filmObj);
        existingIds.add(id);
        // Rate limit
        await new Promise(r => setTimeout(r, 250));
      } else {
        console.log(`  Zaten var: ${id}`);
      }
    }
    
    seriesData.push({ name: col.name, filmIds });
  }

  console.log(`\n✅ ${newFilms.length} yeni film çekildi`);
  console.log(`📋 ${seriesData.length} seri oluşturuldu`);

  // Generate the new films as TypeScript
  if (newFilms.length > 0) {
    const filmsTs = newFilms.map(f => {
      const lines = [
        `  {`,
        `    id: ${JSON.stringify(f.id)},`,
        `    title: ${JSON.stringify(f.title)},`,
        `    originalTitle: ${JSON.stringify(f.originalTitle)},`,
        `    year: ${f.year},`,
        `    duration: ${f.duration},`,
        `    director: ${JSON.stringify(f.director)},`,
        `    cast: ${JSON.stringify(f.cast)},`,
        `    genres: ${JSON.stringify(f.genres)},`,
        `    rating: ${f.rating},`,
        `    price: ${f.price},`,
        f.discountPrice ? `    discountPrice: ${f.discountPrice},` : null,
        `    poster: ${JSON.stringify(f.poster)},`,
        `    backdrop: ${JSON.stringify(f.backdrop)},`,
        f.trailerUrl ? `    trailerUrl: ${JSON.stringify(f.trailerUrl)},` : null,
        `    description: ${JSON.stringify(f.description)},`,
        `    language: ${JSON.stringify(f.language)},`,
        `    country: ${JSON.stringify(f.country)},`,
        `    resolution: ${JSON.stringify(f.resolution)},`,
        `    subtitles: ${JSON.stringify(f.subtitles)},`,
        `    ageRating: ${JSON.stringify(f.ageRating)},`,
        `    awards: [],`,
        `    status: "published",`,
        `    createdAt: "2026-04-17",`,
        `  },`,
      ].filter(Boolean).join('\n');
      return lines;
    }).join('\n');

    // Insert new films before the closing bracket of mockFilms array
    const closingBracket = currentData.lastIndexOf('];\n\nexport const mockUser');
    if (closingBracket === -1) {
      console.error('mockFilms kapanış parantezi bulunamadı');
      // Try alternative
      const alt = currentData.indexOf('];\n\nexport const mockUser');
      if (alt === -1) {
        console.error('Alternatif de bulunamadı, sadece seri verilerini güncelliyoruz');
      }
    }
    
    // Find the end of mockFilms array - look for "];" followed by mockUser or genres
    const mockFilmsEnd = currentData.search(/\];\s*\n\s*\nexport const mockUser/);
    if (mockFilmsEnd !== -1) {
      const updatedData = currentData.substring(0, mockFilmsEnd) + '\n' + filmsTs + '\n' + currentData.substring(mockFilmsEnd);
      
      // Now update filmSeries
      const seriesTs = `export const filmSeries: { name: string; filmIds: string[] }[] = [\n${seriesData.map(s => `  { name: ${JSON.stringify(s.name)}, filmIds: ${JSON.stringify(s.filmIds)} },`).join('\n')}\n];`;
      
      const finalData = updatedData.replace(
        /export const filmSeries:.*?\];/s,
        seriesTs
      );
      
      fs.writeFileSync(mockDataPath, finalData, 'utf-8');
      console.log(`\n📁 ${mockDataPath} güncellendi`);
    }
  } else {
    // Just update filmSeries
    const seriesTs = `export const filmSeries: { name: string; filmIds: string[] }[] = [\n${seriesData.map(s => `  { name: ${JSON.stringify(s.name)}, filmIds: ${JSON.stringify(s.filmIds)} },`).join('\n')}\n];`;
    
    const finalData = currentData.replace(
      /export const filmSeries:.*?\];/s,
      seriesTs
    );
    
    fs.writeFileSync(mockDataPath, finalData, 'utf-8');
    console.log(`\n📁 ${mockDataPath} güncellendi (sadece seriler)`);
  }
  
  // Print summary
  console.log('\n--- SERİ ÖZETİ ---');
  for (const s of seriesData) {
    console.log(`${s.name}: ${s.filmIds.length} film - IDs: ${s.filmIds.join(', ')}`);
  }
}

main().catch(console.error);
