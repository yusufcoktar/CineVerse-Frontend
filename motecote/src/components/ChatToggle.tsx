import { MessageCircle } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';

export default function ChatToggle() {
  const toggleChat = useUIStore((s) => s.toggleChat);
  const chatOpen = useUIStore((s) => s.chatOpen);

  if (chatOpen) return null;

  return (
    <motion.button
      onClick={toggleChat}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent-red shadow-lg shadow-accent-red/25 transition-all hover:scale-110 hover:shadow-accent-red/40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Chatbot aç"
    >
      <MessageCircle size={24} className="text-white" />
    </motion.button>
  );
}
