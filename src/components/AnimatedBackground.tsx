import { useEffect, useState } from 'react';

const images = [
  'https://images.pexels.com/photos/8987110/pexels-photo-8987110.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/34514431/pexels-photo-34514431.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/1819660/pexels-photo-1819660.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/9167841/pexels-photo-9167841.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

export default function AnimatedBackground() {
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const imgs = images.map((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => setLoaded(true);
      return img;
    });
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % images.length);
    }, 9000);
    return () => {
      clearInterval(interval);
      imgs.forEach((i) => (i.onload = null));
    };
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden bg-obsidian"
      style={{ zIndex: 0, pointerEvents: 'none', transform: 'translateZ(0)' }}
      aria-hidden="true"
    >
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal to-obsidian" />
      )}
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === current && loaded ? 1 : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/65" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(5,8,5,0.5) 0%, rgba(5,8,5,0.15) 40%, rgba(5,8,5,0.15) 60%, rgba(5,8,5,0.85) 100%)',
        }}
      />
    </div>
  );
}
