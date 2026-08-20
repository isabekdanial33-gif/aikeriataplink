import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center pt-16 text-center"
    >
      {/* Ornamental divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="mb-8 flex items-center gap-3"
      >
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold/60" />
        <span className="text-gold text-lg tracking-[0.4em]">✦</span>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold/60" />
      </motion.div>

      {/* Avatar with glow */}
      <div className="relative mb-7">
        <div className="absolute -inset-6 rounded-full bg-gold/20 blur-3xl" />
        <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-gold-light/40 to-gold-dark/20 blur-xl" />
        <div className="relative h-40 w-40 overflow-hidden rounded-full border border-gold/30 bg-gradient-to-br from-gold-light/20 to-gold-dark/20">
          <img
            src="/Photo1.jpg"
            alt="Айкерия Хамидуллина"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.opacity = '0';
            }}
          />
          <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15" />
        </div>
      </div>

      <h1 className="font-serif text-4xl font-medium tracking-wide text-white sm:text-5xl">
        Айкерия
        <br />
        <span className="text-champagne">Хамидуллина</span>
      </h1>

      <div className="mx-auto mt-6 flex items-center gap-3">
        <span className="h-px w-8 bg-gold/40" />
        <span className="text-gold/60 text-xs">✦</span>
        <span className="h-px w-8 bg-gold/40" />
      </div>

      <p className="mt-6 max-w-xs text-sm font-light leading-relaxed text-white/55">
        Духовный наставник, исследователь тонкого плана человека и законов Мироздания.
      </p>
    </motion.header>
  );
}
