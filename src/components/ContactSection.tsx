import { motion } from 'framer-motion';
import { MessageCircle, Send, Instagram } from 'lucide-react';

export default function ContactSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="mt-24"
    >
      <div className="mb-10 text-center">
        <span className="text-gold/50 text-sm tracking-[0.3em]">✦ ✦ ✦</span>
        <h2 className="mt-4 font-serif text-3xl font-light text-champagne sm:text-4xl">
          Связаться со мной
        </h2>
      </div>

      {/* Intro card */}
      <div className="mb-8 rounded-[28px] border border-gold/15 bg-black/30 p-7 text-center shadow-2xl backdrop-blur-2xl">
        <p className="text-[15px] font-light leading-[1.8] text-white/70">
          По всем вопросам переходите в Telegram, WhatsApp или Instagram. Я с вниманием познакомлюсь с вашим запросом, отвечу на ваши вопросы и помогу подобрать наиболее подходящий формат нашей совместной работы.
        </p>
      </div>

      {/* Contact buttons */}
      <div className="space-y-4">
        <motion.a
          href="https://wa.me/77014373665"
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.98 }}
          className="group flex items-center gap-4 rounded-[28px] border border-[#25D366]/30 bg-black/30 p-5 shadow-xl backdrop-blur-2xl transition-colors hover:bg-[#25D366]/10"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15">
            <MessageCircle className="h-7 w-7 text-[#25D366]" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-white">Написать в WhatsApp</p>
            <p className="mt-0.5 text-xs font-light text-white/45">
              Обсудить ваш запрос · Договориться о консультации
            </p>
          </div>
        </motion.a>

        <motion.a
          href="https://t.me/aikeriamedium"
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.98 }}
          className="group flex items-center gap-4 rounded-[28px] border border-[#229ED9]/30 bg-black/30 p-5 shadow-xl backdrop-blur-2xl transition-colors hover:bg-[#229ED9]/10"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#229ED9]/15">
            <Send className="h-7 w-7 text-[#229ED9]" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-white">Написать в Telegram</p>
            <p className="mt-0.5 text-xs font-light text-white/45">
              Задать вопрос · Записаться на сеанс
            </p>
          </div>
        </motion.a>

        <motion.a
          href="https://www.instagram.com/aikeria"
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.98 }}
          className="group flex items-center gap-4 rounded-[28px] border border-[#E1306C]/30 bg-black/30 p-5 shadow-xl backdrop-blur-2xl transition-colors hover:bg-[#E1306C]/10"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]">
            <Instagram className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-medium text-white">Написать в Instagram</p>
            <p className="mt-0.5 text-xs font-light text-white/45">
              @aikeria · Моменты и вдохновение
            </p>
          </div>
        </motion.a>
      </div>

      {/* Closing photo */}
      <div className="relative mt-14 h-72 overflow-hidden rounded-[28px] border border-gold/15">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-light/15 to-obsidian" />
        <img
          src="/Photo6.jpg"
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.opacity = '0';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/30 to-transparent" />
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <span className="text-gold/50 text-sm tracking-[0.3em]">✦ ✦ ✦</span>
          <p className="mt-3 font-serif text-xl font-light text-champagne/80">
            С любовью и светом
          </p>
        </div>
      </div>

      <footer className="mt-10 text-center">
        <p className="text-xs font-light text-white/25">
          © 2024 Айкерия Хамидуллина · Духовный наставник
        </p>
      </footer>
    </motion.section>
  );
}
