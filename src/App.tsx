import { useScroll, motion } from 'framer-motion';
import AnimatedBackground from './components/AnimatedBackground';
import FilmGrain from './components/FilmGrain';
import Header from './components/Header';
import AboutSection from './components/AboutSection';
import ServicesSection from './components/ServicesSection';
import ContactSection from './components/ContactSection';
import SoundToggle from './components/SoundToggle';
import ChatWidget from './components/ChatWidget';

export default function App() {
  const { scrollYProgress } = useScroll();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white">
      <AnimatedBackground />
      <FilmGrain />
      <SoundToggle />
      <ChatWidget />

      <motion.div
        className="fixed left-0 top-0 z-50 h-0.5 w-full origin-left bg-gradient-to-r from-gold-light to-gold-dark"
        style={{ scaleX: scrollYProgress }}
      />

      <main className="relative mx-auto max-w-lg px-5 pb-20" style={{ zIndex: 10 }}>
        <Header />
        <AboutSection />
        <ServicesSection />
        <ContactSection />
      </main>
    </div>
  );
}
