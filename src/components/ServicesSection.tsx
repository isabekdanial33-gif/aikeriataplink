import { motion } from 'framer-motion';

const services = [
  {
    photo: '/Photo3.jpg',
    number: '01',
    title: 'Индивидуальное консультирование',
    text: 'Работаю онлайн и офлайн. Как духовный наставник, парапсихолог и медиум помогаю увидеть глубинные причины происходящего, найти ответы и направление дальнейшего Пути.',
  },
  {
    photo: '/Photo4.jpg',
    number: '02',
    title: 'Энергетический сеанс целительства',
    text: 'Авторская целительская работа с тонким планом и жизненной энергией, направленная на восстановление внутреннего баланса, освобождение от энергетических искажений в теле и активацию естественных процессов исцеления.',
  },
  {
    photo: '/Photo5.jpg',
    number: '03',
    title: 'Наставничество',
    text: 'Индивидуальное сопровождение для начинающих и практикующих мастеров. Передача знаний, раскрытие способностей, развитие чувствования и сопровождение на духовном Пути.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function ServicesSection() {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      className="mt-24"
    >
      <div className="mb-10 text-center">
        <span className="text-gold/50 text-sm tracking-[0.3em]">✦ ✦ ✦</span>
        <h2 className="mt-4 font-serif text-3xl font-light text-champagne sm:text-4xl">
          Как со мной взаимодействовать
        </h2>
      </div>

      <div className="space-y-6">
        {services.map((s, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="group overflow-hidden rounded-[28px] border border-gold/15 bg-black/30 shadow-xl backdrop-blur-2xl"
          >
            {/* Photo header */}
            <div className="relative h-56 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-light/15 to-gold-dark/10" />
              <img
                src={s.photo}
                alt={s.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.opacity = '0';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Number badge */}
              <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-black/40 font-serif text-lg text-gold backdrop-blur-md">
                {s.number}
              </div>
            </div>

            {/* Body */}
            <div className="p-7">
              <h3 className="mb-3 font-serif text-xl font-medium text-champagne">
                {s.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-white/65">
                {s.text}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
