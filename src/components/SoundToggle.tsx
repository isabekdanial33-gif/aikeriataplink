import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type OscPair = { osc: OscillatorNode; gain: GainNode };

export default function SoundToggle() {
  const [playing, setPlaying] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<OscPair[]>([]);
  const lfoRef = useRef<OscPair | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopAll = useCallback(() => {
    nodesRef.current.forEach(({ osc, gain }) => {
      try { osc.stop(); } catch { /* already stopped */ }
      try { gain.disconnect(); } catch { /* noop */ }
    });
    nodesRef.current = [];
    if (lfoRef.current) {
      try { lfoRef.current.osc.stop(); } catch { /* noop */ }
      try { lfoRef.current.gain.disconnect(); } catch { /* noop */ }
      lfoRef.current = null;
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const buildPad = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    // Soft ambient drone: two detuned sine oscillators + slow LFO on master gain
    const freqs = [110, 165, 220];
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      // gentle fade-in
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 4);
      nodesRef.current.push({ osc, gain });
    });

    // slow tremolo via LFO
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.08;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;
    lfo.connect(lfoGain);
    lfoGain.connect(master.gain);
    lfo.start();
    lfoRef.current = { osc: lfo, gain: lfoGain };
  }, []);

  // bird chirps: short random blips
  const chirp = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;

    const now = ctx.currentTime;
    const baseFreq = 1800 + Math.random() * 1400;
    const len = 0.08 + Math.random() * 0.12;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + len * 0.5);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + len);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.05, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + len);

    osc.connect(gain);
    gain.connect(master);
    osc.start(now);
    osc.stop(now + len + 0.05);
  }, []);

  const start = useCallback(async () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = 0.6;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch { /* noop */ }
    }
    buildPad();
    // random bird chirps every 3-7 seconds
    intervalRef.current = window.setInterval(() => {
      if (Math.random() > 0.4) chirp();
    }, 3500);
    setPlaying(true);
    setShowHint(false);
  }, [buildPad, chirp]);

  const stop = useCallback(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (ctx && master) {
      // fade out then stop
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
    }
    window.setTimeout(stopAll, 700);
    setPlaying(false);
  }, [stopAll]);

  const toggle = () => {
    if (playing) {
      stop();
    } else {
      void start();
    }
  };

  useEffect(() => () => {
    stopAll();
    ctxRef.current?.close().catch(() => { /* noop */ });
  }, [stopAll]);

  return (
    <motion.div
      className="fixed right-4 top-4 z-[60] flex items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, duration: 0.5 }}
    >
      <AnimatePresence>
        {showHint && !playing && (
          <motion.span
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="mr-3 rounded-full bg-black/50 px-3 py-1.5 text-xs font-light text-white/80 backdrop-blur-md"
          >
            Звуки природы
          </motion.span>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggle}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-black/40 text-gold-light backdrop-blur-2xl transition-colors hover:bg-black/60"
        aria-label={playing ? 'Выключить звук' : 'Включить звук природы'}
      >
        <motion.span
          key={playing ? 'on' : 'off'}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {playing ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </motion.span>
      </motion.button>

      {playing && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(212,175,55,0.35)',
              '0 0 0 12px rgba(212,175,55,0)',
            ],
          }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
    </motion.div>
  );
}
