import { motion } from 'framer-motion';

const aboutParagraphs = [
  'Мой путь — сопровождать человека к самому себе. Не давать готовые ответы, а помогать вспомнить то, что Душа всегда знала. Возвращать утраченную связь с внутренним Источником, раскрывать природную мудрость, силу и способность жить в согласии со своим истинным предназначением.',
  'Через передачу Shaktipat я делюсь живым опытом пробуждения сознания, помогая раскрыть естественное течение пранической энергии и пробудить внутренний потенциал Кундалини.',
  'Я сопровождаю человека в освобождении от иллюзий, внутренних ограничений и искажений тонкого плана, чтобы вернуть его к ясности восприятия, внутренней свободе и прямому переживанию своей истинной природы.',
  'Я не верю в зависимость от учителя. Настоящий наставник не создаёт последователей — он помогает человеку обрести внутреннюю опору, расширить сознание и стать Мастером собственной жизни.',
  'Для меня целительство — это не исправление человека и не вмешательство в его судьбу. Это создание пространства высокой осознанности, где пробуждается память Души, раскрываются внутренние ресурсы и естественным образом начинается глубокая трансформация.',
  'Моя миссия — помочь человеку вспомнить, кем он является за пределами личности, страхов и иллюзий. Когда эта встреча с собой происходит, человек перестаёт искать Истину вовне и начинает жить, опираясь на мудрость собственного Духа.',
];

export default function AboutSection() {
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
          Обо мне
        </h2>
      </div>

      <div className="relative rounded-[28px] border border-gold/15 bg-black/30 p-7 shadow-2xl backdrop-blur-2xl">
        {/* Decorative corner accents */}
        <span className="absolute left-3 top-3 h-6 w-6 border-l border-t border-gold/30 rounded-tl-lg" />
        <span className="absolute right-3 top-3 h-6 w-6 border-r border-t border-gold/30 rounded-tr-lg" />
        <span className="absolute bottom-3 left-3 h-6 w-6 border-b border-l border-gold/30 rounded-bl-lg" />
        <span className="absolute bottom-3 right-3 h-6 w-6 border-b border-r border-gold/30 rounded-br-lg" />

        {/* Photo */}
        <div className="mb-7 flex justify-center">
          <div className="relative">
            <div className="absolute -inset-2 rounded-[24px] bg-gold/15 blur-xl" />
            <div className="relative h-52 w-52 overflow-hidden rounded-[24px] border border-gold/25 bg-gradient-to-br from-gold-light/15 to-gold-dark/10">
              <img
                src="/Photo2.jpg"
                alt="Айкерия"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-5 text-[15px] font-light leading-[1.8] text-white/70">
          {aboutParagraphs.map((para, i) => (
            <p key={i} className={i === 0 ? 'text-white/85' : ''}>
              {para}
            </p>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
