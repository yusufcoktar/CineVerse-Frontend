import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import type { ChatMessage } from '@/types';
import { useFilmStore } from '@/store/filmStore';
import FilmCard from './FilmCard';
import { SPRING_SNAPPY, SPRING_SOFT } from '@/constants/animations';

const quickReplies = ['Öneri iste', 'Sipariş sorgula', 'Yardım'];

const botResponses: Record<string, { text: string; filmId?: string }> = {
  'öneri iste': { text: 'Size harika bir film önereyim! "Başlangıç" hem bilim kurgu hem de aksiyon sevenler için mükemmel bir seçim.', filmId: '27205' },
  'sipariş sorgula': { text: 'Siparişlerinizi görmek için Siparişlerim sayfasını ziyaret edebilirsiniz. Giriş yapmış olmanız gerekiyor.' },
  'yardım': { text: 'Size nasıl yardımcı olabilirim? Film önerisi, sipariş takibi veya kampanya bilgisi için bana yazabilirsiniz.' },
};

export default function ChatPanel() {
  const isOpen = useUIStore((s) => s.chatOpen);
  const close = useUIStore((s) => s.closeChat);
  const allFilms = useFilmStore((s) => s.films);
  const msgIdRef = useRef(2); // Başlangıç mesajı id=1, sonrakiler artar
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Merhaba! CineVerse asistanıyım. Size nasıl yardımcı olabilirim? 🎬',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ESC key closes panel
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: String(msgIdRef.current++),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const key = text.trim().toLowerCase();
      const response = botResponses[key] || {
        text: 'İlginiz için teşekkürler! Size aksiyon türünde harika bir film önereyim.',
        filmId: '238',
      };
      const botMsg: ChatMessage = {
        id: String(msgIdRef.current++),
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toISOString(),
        filmCard: response.filmId ? allFilms.find((f) => f.id === response.filmId) : undefined,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={SPRING_SNAPPY}
          className="fixed bottom-0 right-0 top-0 z-50 flex w-full flex-col border-l border-white/10 bg-bg-secondary/95 backdrop-blur-xl sm:w-[380px]"
          role="dialog"
          aria-modal="true"
          aria-label="Film Asistanı"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-purple/20">
                <Bot size={18} className="text-accent-purple" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">CineBot</h3>
                <span className="text-xs text-green-400">Çevrimiçi</span>
              </div>
            </div>
            <button onClick={close} className="rounded-lg p-1 hover:bg-white/5">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  initial={{ opacity: 0, y: 12, scale: 0.96, x: msg.sender === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                  transition={SPRING_SOFT}
                >
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${
                  msg.sender === 'bot' ? 'bg-accent-purple/20' : 'bg-accent-red/20'
                }`}>
                  {msg.sender === 'bot' ? (
                    <Bot size={14} className="text-accent-purple" />
                  ) : (
                    <User size={14} className="text-accent-red" />
                  )}
                </div>
                <div className="max-w-[75%] space-y-2">
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      msg.sender === 'user'
                        ? 'bg-accent-red text-white'
                        : 'bg-white/5 text-text-primary'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.filmCard && (
                    <div className="w-36">
                      <FilmCard film={msg.filmCard} size="sm" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            </AnimatePresence>

            <AnimatePresence>
              {isTyping && (
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent-purple/20">
                    <Bot size={14} className="text-accent-purple" />
                  </div>
                  <div className="rounded-2xl bg-white/5 px-4 py-2">
                    <div className="flex gap-1">
                      <motion.span className="h-2 w-2 rounded-full bg-text-muted" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.span className="h-2 w-2 rounded-full bg-text-muted" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }} />
                      <motion.span className="h-2 w-2 rounded-full bg-text-muted" animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-2">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                className="flex-shrink-0 rounded-full border border-accent-purple/30 bg-accent-purple/10 px-3 py-1 text-xs text-accent-purple transition-colors hover:bg-accent-purple/20"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-white/5 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder-text-muted outline-none focus:ring-1 focus:ring-accent-purple/50"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="rounded-xl bg-accent-red px-4 py-2.5 text-white transition-all hover:bg-accent-red/90 disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
