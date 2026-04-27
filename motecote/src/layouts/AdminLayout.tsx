import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  // SİHİRLİ DOKUNUŞ: user.role'ü toLowerCase() ile küçük harfe çevirip kontrol ediyoruz.
  // Böylece veritabanından 'Admin', 'ADMIN' veya 'admin' gelmesi fark etmez!
  if (!user || user.role.toLowerCase() !== 'admin') {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <Outlet />
    </div>
  );
}