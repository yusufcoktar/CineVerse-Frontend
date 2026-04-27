import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ChatPanel from '@/components/ChatPanel';
import ChatToggle from '@/components/ChatToggle';
import PageTransition from '@/components/PageTransition';

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className="pt-16">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <ChatPanel />
      <ChatToggle />
      {/* Footer */}
      <footer className="border-t border-white/5 bg-bg-secondary py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="font-heading text-accent-red">CineVerse</p>
            <p className="text-sm text-text-muted">
              © 2026 CineVerse. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
