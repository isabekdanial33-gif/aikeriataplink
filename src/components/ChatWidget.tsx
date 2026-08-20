import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  X,
  Send,
  LogOut,
  ArrowLeft,
  Paperclip,
  Image as ImageIcon,
} from 'lucide-react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
} from 'firebase/firestore';
import { auth, googleProvider, db, ADMIN_EMAIL } from '@/lib/firebase';

type ChatMessage = {
  id: string;
  text: string;
  senderEmail: string;
  senderName: string;
  senderPhotoURL?: string;
  attachment?: { type: 'image' | 'video'; dataUrl: string };
  createdAt: { seconds: number; nanoseconds: number } | null;
};

type Conversation = {
  email: string;
  name: string;
  photoURL?: string;
  lastMessage: string;
  lastTime: { seconds: number; nanoseconds: number } | null;
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // admin view state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  // messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAttachment, setPendingAttachment] = useState<
    { type: 'image' | 'video'; dataUrl: string } | null
  >(null);

  // listen to auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setConversations([]);
        setMessages([]);
        setActiveConversation(null);
      }
    });
    return () => unsub();
  }, []);

  // admin: load all conversations
  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const snap = await getDocs(collection(db, 'conversations'));
      const convs: Conversation[] = [];
      snap.forEach((d) => {
        const data = d.data() as Conversation;
        convs.push({ ...data, email: d.id });
      });
      convs.sort((a, b) => {
        const at = a.lastTime?.seconds ?? 0;
        const bt = b.lastTime?.seconds ?? 0;
        return bt - at;
      });
      setConversations(convs);
    };
    void load();
  }, [isAdmin, messages]);

  // subscribe to messages for current conversation
  useEffect(() => {
    const target = isAdmin ? activeConversation : user?.email;
    if (!target || !open) return;

    const q = query(
      collection(db, 'conversations', target, 'messages'),
      orderBy('createdAt', 'asc'),
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = [];
      snap.forEach((d) => {
        msgs.push({ id: d.id, ...(d.data() as Omit<ChatMessage, 'id'>) });
      });
      setMessages(msgs);
    });

    return () => unsub();
  }, [isAdmin, activeConversation, user?.email, open]);

  // scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSignIn = useCallback(async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const e = err as { code?: string; message?: string };
      setAuthError(
        e.code === 'auth/popup-closed-by-user'
          ? 'Окно входа было закрыто. Попробуйте снова.'
          : 'Не удалось войти. Попробуйте ещё раз.',
      );
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    setActiveConversation(null);
  }, []);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setAuthError('Файл слишком большой (макс. 4 МБ)');
      return;
    }
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({
        type: isImage ? 'image' : 'video',
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim() && !pendingAttachment) return;
    const target = isAdmin ? activeConversation : user?.email;
    if (!target) return;

    setSending(true);
    try {
      // ensure conversation doc exists (for user side)
      if (!isAdmin) {
        await setDoc(
          doc(db, 'conversations', target),
          {
            name: user?.displayName || target,
            photoURL: user?.photoURL || '',
            lastMessage: input.trim() || (pendingAttachment ? '📎 Вложение' : ''),
            lastTime: serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        await setDoc(
          doc(db, 'conversations', target),
          { lastMessage: input.trim() || (pendingAttachment ? '📎 Вложение' : ''), lastTime: serverTimestamp() },
          { merge: true },
        );
      }

      await addDoc(collection(db, 'conversations', target, 'messages'), {
        text: input.trim(),
        senderEmail: user?.email || 'unknown',
        senderName: isAdmin ? 'Айкерия' : user?.displayName || target,
        senderPhotoURL: user?.photoURL || '',
        attachment: pendingAttachment || null,
        createdAt: serverTimestamp(),
      });

      setInput('');
      setPendingAttachment(null);
    } finally {
      setSending(false);
    }
  }, [input, pendingAttachment, isAdmin, activeConversation, user]);

  const formatTime = (ts: ChatMessage['createdAt']) => {
    if (!ts) return '';
    const d = new Date(ts.seconds * 1000);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const currentConvName = (() => {
    if (isAdmin && activeConversation) {
      const c = conversations.find((x) => x.email === activeConversation);
      return c?.name || activeConversation;
    }
    return 'Айкерия';
  })();

  const currentConvPhoto = (() => {
    if (isAdmin && activeConversation) {
      const c = conversations.find((x) => x.email === activeConversation);
      return c?.photoURL;
    }
    return '/Photo1.jpg';
  })();

  return (
    <>
      {/* Floating button — top-left corner */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-gold/30 bg-black/40 text-gold-light shadow-2xl backdrop-blur-2xl transition-colors hover:bg-black/60"
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        aria-label="Чат"
      >
        <motion.span
          key={open ? 'open' : 'closed'}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.25 }}
        >
          {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </motion.span>
        {!open && (
          <motion.span
            className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full bg-gold-light"
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-4 top-20 z-[60] flex h-[70vh] max-h-[600px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-[28px] border border-gold/20 bg-obsidian/90 shadow-2xl backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-gold/10 bg-black/30 p-4">
              {(isAdmin && activeConversation) && (
                <button
                  onClick={() => setActiveConversation(null)}
                  className="text-gold-light/70 transition-colors hover:text-gold-light"
                  aria-label="Назад"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gold/30 bg-charcoal">
                {currentConvPhoto ? (
                  <img
                    src={currentConvPhoto}
                    alt={currentConvName}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = '0';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gold-light/40">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-obsidian bg-green-400" />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate font-serif text-lg font-light text-champagne">
                  {currentConvName}
                </p>
                <p className="truncate text-[11px] font-light text-gold-light/40">
                  {isAdmin && activeConversation ? activeConversation : 'онлайн'}
                </p>
              </div>
              {user && (
                <button
                  onClick={handleSignOut}
                  className="text-gold-light/50 transition-colors hover:text-gold-light"
                  aria-label="Выйти"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Body */}
            {!user ? (
              <SignInView onSignIn={handleSignIn} loading={authLoading} error={authError} />
            ) : isAdmin && !activeConversation ? (
              <AdminList
                conversations={conversations}
                onSelect={setActiveConversation}
              />
            ) : (
              <ConversationView
                messages={messages}
                input={input}
                setInput={setInput}
                onSend={sendMessage}
                sending={sending}
                isAdmin={isAdmin}
                myEmail={user.email || ''}
                formatTime={formatTime}
                fileInputRef={fileInputRef}
                onFile={handleFile}
                pendingAttachment={pendingAttachment}
                clearAttachment={() => setPendingAttachment(null)}
                messagesEndRef={messagesEndRef}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ---------- Sub views ---------- */

function SignInView({
  onSignIn,
  loading,
  error,
}: {
  onSignIn: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gold/20 bg-black/30">
        <MessageSquare className="h-8 w-8 text-gold-light/60" />
      </div>
      <div>
        <p className="font-serif text-xl font-light text-champagne">Чат с Айкерией</p>
        <p className="mt-2 text-sm font-light leading-relaxed text-white/50">
          Войдите через Google, чтобы написать сообщение и получить ответ.
        </p>
      </div>
      {error && <p className="text-xs text-red-300/80">{error}</p>}
      <button
        onClick={onSignIn}
        disabled={loading}
        className="flex items-center gap-3 rounded-full border border-gold/30 bg-white/5 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
      >
        <GoogleIcon />
        {loading ? 'Вход…' : 'Войти через Google'}
      </button>
    </div>
  );
}

function AdminList({
  conversations,
  onSelect,
}: {
  conversations: Conversation[];
  onSelect: (email: string) => void;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <p className="text-sm font-light text-white/40">
          Пока нет ни одного сообщения.
        </p>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto p-2">
      {conversations.map((c) => (
        <button
          key={c.email}
          onClick={() => onSelect(c.email)}
          className="flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-colors hover:bg-white/5"
        >
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gold/20 bg-charcoal">
            {c.photoURL ? (
              <img src={c.photoURL} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gold-light/40">
                <MessageSquare className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{c.name}</p>
            <p className="truncate text-xs font-light text-white/40">
              {c.lastMessage || c.email}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

function ConversationView({
  messages,
  input,
  setInput,
  onSend,
  sending,
  isAdmin,
  myEmail,
  formatTime,
  fileInputRef,
  onFile,
  pendingAttachment,
  clearAttachment,
  messagesEndRef,
}: {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  isAdmin: boolean;
  myEmail: string;
  formatTime: (ts: ChatMessage['createdAt']) => string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pendingAttachment: { type: 'image' | 'video'; dataUrl: string } | null;
  clearAttachment: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-sm font-light text-white/40">
              {isAdmin ? 'Напишите ответ вашему клиенту.' : 'Напишите своё сообщение — Айкерия ответит вам.'}
            </p>
          </div>
        )}
        {messages.map((m) => {
          const mine = isAdmin
            ? m.senderEmail === ADMIN_EMAIL
            : m.senderEmail === myEmail;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  mine
                    ? 'rounded-br-md bg-gold/20 text-champagne'
                    : 'rounded-bl-md bg-white/5 text-white/90'
                }`}
              >
                {m.attachment && (
                  <div className="mb-1.5 overflow-hidden rounded-xl">
                    {m.attachment.type === 'image' ? (
                      <img
                        src={m.attachment.dataUrl}
                        alt="вложение"
                        className="max-h-48 w-full object-cover"
                      />
                    ) : (
                      <video
                        src={m.attachment.dataUrl}
                        controls
                        className="max-h-48 w-full object-cover"
                      />
                    )}
                  </div>
                )}
                {m.text && <p className="whitespace-pre-wrap break-words font-light leading-relaxed">{m.text}</p>}
                <p className={`mt-1 text-right text-[10px] ${mine ? 'text-gold-light/40' : 'text-white/30'}`}>
                  {formatTime(m.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Pending attachment preview */}
      <AnimatePresence>
        {pendingAttachment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gold/10 bg-black/20 px-4 py-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-12 w-12 overflow-hidden rounded-lg border border-gold/20">
                {pendingAttachment.type === 'image' ? (
                  <img src={pendingAttachment.dataUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <video src={pendingAttachment.dataUrl} className="h-full w-full object-cover" />
                )}
              </div>
              <span className="flex-1 text-xs font-light text-white/50">
                {pendingAttachment.type === 'image' ? 'Фото' : 'Видео'} готово к отправке
              </span>
              <button
                onClick={clearAttachment}
                className="text-white/40 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="flex items-center gap-2 border-t border-gold/10 bg-black/30 p-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={onFile}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-gold-light/50 transition-colors hover:text-gold-light"
          aria-label="Прикрепить файл"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !sending) onSend();
          }}
          placeholder="Сообщение…"
          className="flex-1 bg-transparent text-sm font-light text-white placeholder-white/30 focus:outline-none"
        />
        <motion.button
          onClick={onSend}
          disabled={sending || (!input.trim() && !pendingAttachment)}
          whileTap={{ scale: 0.9 }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-gold-light transition-colors hover:bg-gold/30 disabled:opacity-40"
          aria-label="Отправить"
        >
          <Send className="h-4 w-4" />
        </motion.button>
      </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}
