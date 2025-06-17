"use client";

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'collect' | 'explode' | 'celebrate';
}

interface ParticleSystemProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const ParticleSystem = forwardRef<any, ParticleSystemProps>(({ canvasRef }, ref) => {
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  const createParticle = (x: number, y: number, type: 'collect' | 'explode' | 'celebrate'): Particle => {
    const colors = {
      collect: ['#39ff14', '#00d4ff', '#ffff00'],
      explode: ['#ff073a', '#ff6b00', '#ffff00'],
      celebrate: ['#39ff14', '#00d4ff', '#bf00ff', '#ffff00']
    };
    
    const color = colors[type][Math.floor(Math.random() * colors[type].length)];
    const angle = Math.random() * Math.PI * 2;
    const speed = type === 'celebrate' ? Math.random() * 8 + 4 : Math.random() * 6 + 2;
    
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === 'celebrate' ? Math.random() * 4 + 2 : 0),
      life: type === 'celebrate' ? 120 : 60,
      maxLife: type === 'celebrate' ? 120 : 60,
      color,
      size: Math.random() * 4 + 2,
      type
    };
  };

  const updateParticles = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.2; // gravity
      particle.vx *= 0.99; // air resistance
      particle.life--;

      const alpha = particle.life / particle.maxLife;
      
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();
      
      // Add sparkle effect for celebrate particles
      if (particle.type === 'celebrate' && Math.random() < 0.3) {
        ctx.beginPath();
        ctx.arc(particle.x + Math.random() * 10 - 5, particle.y + Math.random() * 10 - 5, 1, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }
      
      ctx.restore();

      return particle.life > 0;
    });

    if (particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(updateParticles);
    }
  };

  useImperativeHandle(ref, () => ({
    collect: (x: number, y: number) => {
      for (let i = 0; i < 8; i++) {
        particlesRef.current.push(createParticle(x, y, 'collect'));
      }
      if (!animationRef.current) {
        updateParticles();
      }
    },
    explode: (x: number, y: number) => {
      for (let i = 0; i < 15; i++) {
        particlesRef.current.push(createParticle(x, y, 'explode'));
      }
      if (!animationRef.current) {
        updateParticles();
      }
    },
    celebrate: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Create particles from multiple points
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.5;
        particlesRef.current.push(createParticle(x, y, 'celebrate'));
      }
      if (!animationRef.current) {
        updateParticles();
      }
    }
  }));

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return null;
});

ParticleSystem.displayName = 'ParticleSystem';

export default ParticleSystem;