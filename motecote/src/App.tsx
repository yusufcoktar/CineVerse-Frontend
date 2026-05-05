import { BrowserRouter, Routes, Route, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import LenisProvider from "@/providers/LenisProvider";
import AuroraBackground from "@/components/ui/AuroraBackground";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import HomePage from "@/pages/HomePage";
import ExplorePage from "@/pages/ExplorePage";
import DetailPage from "@/pages/DetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrdersPage from "@/pages/OrdersPage";
import FavoritesPage from "@/pages/FavoritesPage";
import CartPage from "@/pages/CartPage";
import LibraryPage from "@/pages/LibraryPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import SettingsPage from "@/pages/SettingsPage";
import AdminPage from "@/pages/AdminPage";
import AdminAddFilmPage from "@/pages/AdminAddFilmPage";
import { useFilmStore } from "@/store/filmStore";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-heading text-6xl text-accent-red">404</h1>
      <p className="text-lg text-text-secondary">Aradığınız sayfa bulunamadı</p>
      <Link to="/" className="mt-2 rounded-xl bg-accent-red/15 px-6 py-2.5 text-sm font-semibold text-accent-red transition-colors hover:bg-accent-red/25">
        Anasayfaya Dön
      </Link>
    </div>
  );
}

export default function App() {
  // 2. Zustand deposundan o yazdığımız API çekme fonksiyonunu alıyoruz
  const fetchFilmsFromApi = useFilmStore((state) => state.fetchFilmsFromApi);

  // 3. Unity'deki void Start() gibi: Uygulama açılır açılmaz motoru ateşle!
  useEffect(() => {
    fetchFilmsFromApi();
  }, [fetchFilmsFromApi]);
  
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <LenisProvider>
          <AuroraBackground />
          <ScrollToTop />
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/film/:id" element={<DetailPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/film-ekle" element={<AdminAddFilmPage />} />
            </Route>
          </Routes>
        </LenisProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

