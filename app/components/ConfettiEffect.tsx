'use client';

import { useEffect, useState } from 'react';

interface ConfettiEffectProps {
  active: boolean;
  duration?: number;
  count?: number;
}

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
  animDuration: number;
}

const COLORS = ['#6366f1', '#8b5cf6', '#d946ef', '#10b981', '#f59e0b', '#f43f5e', '#3b82f6', '#22d3ee'];

export default function ConfettiEffect({ active, duration = 3000, count = 50 }: ConfettiEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }

    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 0.5,
      rotation: Math.random() * 360,
      size: Math.random() * 6 + 4,
      animDuration: 1.5 + Math.random(),
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [active, duration, count]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!active || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[70] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-fall"
          style={{
            left: `${p.x}%`,
            top: -10,
            width: p.size,
            height: p.size * 1.5,
            backgroundColor: p.color,
            borderRadius: '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.animDuration}s`,
            transform: `rotate(${p.rotation}deg)`,
            opacity: 0.8,
          }}
        />
      ))}
    </div>
  );
}
