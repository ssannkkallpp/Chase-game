"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import GameControls from './GameControls';
import GameStats from './GameStats';
import GameModal from './GameModal';
import ParticleSystem from './ParticleSystem';

const CANVAS_SIZE = 625;
const INFO_HEIGHT = 30;
const GRID_STEP = 25;
const INITIAL_CIRCLE: [number, number] = [25, 25];
const MAX_CIRCLES = 576;

const audioFiles = {
  blop: '/assets/audio/blop.mp3',
  level_up: '/assets/audio/level_up.mp3',
  game_over: '/assets/audio/game_over.mp3',
  bgmusic: '/assets/audio/background_music.mp3',
};

function getStoredNumber(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback;
  const val = localStorage.getItem(key);
  return val !== null ? Number(val) : fallback;
}

function setStoredNumber(key: string, value: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, String(value));
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // UI state
  const [level, setLevel] = useState(() => getStoredNumber('level', 1));
  const [lives, setLives] = useState(() => getStoredNumber('lives', Math.round(1 * 1.5)));
  const [score, setScore] = useState(() => getStoredNumber('score', 0));
  const [hscore, setHScore] = useState(() => getStoredNumber('hscore', 0));
  const [play, setPlay] = useState(false);
  const [showModal, setShowModal] = useState<{ open: boolean; message: string; type: 'win' | 'lose' | 'info' }>({ 
    open: false, 
    message: '', 
    type: 'info' 
  });
  
  // Mutable game state refs
  const circlesRef = useRef<[number, number][]>([INITIAL_CIRCLE]);
  const cxRef = useRef(25);
  const cyRef = useRef(25);
  const dxRef = useRef(-25);
  const dyRef = useRef(-25);
  const chaseRef = useRef(false);
  const duration = 100;
  const playGameRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});
  const particleSystemRef = useRef<any>(null);

  // Utility functions
  const noDuplicates = useCallback((array: [number, number][], elem: [number, number]) => {
    return !array.some(([x, y]) => x === elem[0] && y === elem[1]);
  }, []);

  const isOnTrack = useCallback((x: number, y: number, dir: string) => {
    switch (dir) {
      case 'l': x -= GRID_STEP; break;
      case 'r': x += GRID_STEP; break;
      case 'u': y -= GRID_STEP; break;
      case 'd': y += GRID_STEP; break;
    }
    return (
      x >= GRID_STEP && x <= CANVAS_SIZE - GRID_STEP &&
      y >= GRID_STEP && y <= CANVAS_SIZE - GRID_STEP
    );
  }, []);

  const bestMove = useCallback((x: number, y: number, a: number, b: number) => {
    const dx = x - a;
    const dy = y - b;
    let move = '';
    if ((Math.abs(dx) > Math.abs(dy) && dy !== 0) || dx === 0) {
      move = dy > 0 ? 'u' : 'd';
    }
    if ((Math.abs(dy) > Math.abs(dx) && dx !== 0) || dy === 0) {
      move = dx > 0 ? 'l' : 'r';
    }
    if (dx === dy) {
      if (dx === 0 && dy === 0) {
        return [25, 25, 'u'];
      } else if (dx > 0) move = 'l';
      else if (dy > 0) move = 'u';
      else if (dx < 0) move = 'r';
      else if (dy < 0) move = 'd';
    }
    switch (move) {
      case 'u': y -= GRID_STEP; break;
      case 'd': y += GRID_STEP; break;
      case 'l': x -= GRID_STEP; break;
      case 'r': x += GRID_STEP; break;
    }
    return [x, y, move];
  }, []);

  // Enhanced draw helpers with neon effects
  const drawCircle = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, glowing = false) => {
    ctx.save();
    
    if (glowing) {
      // Create glow effect
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.globalCompositeOperation = 'screen';
    }
    
    // Outer glow ring
    if (glowing) {
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = color + '40'; // Semi-transparent
      ctx.fill();
    }
    
    // Main circle
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    
    // Create gradient for depth
    const gradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 10);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + '80');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#ffffff40';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }, []);

  // Enhanced game drawing with modern effects
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw background with gradient
    const bgGradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    bgGradient.addColorStop(0, '#0a0a0f');
    bgGradient.addColorStop(0.5, '#1a1a2e');
    bgGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw enhanced grid with neon effect
    ctx.strokeStyle = '#00d4ff40';
    ctx.lineWidth = 1;
    ctx.shadowColor = '#00d4ff';
    ctx.shadowBlur = 2;
    
    ctx.beginPath();
    for (let i = GRID_STEP; i <= CANVAS_SIZE - GRID_STEP; i += GRID_STEP) {
      ctx.moveTo(i, GRID_STEP);
      ctx.lineTo(i, CANVAS_SIZE - GRID_STEP);
      ctx.moveTo(GRID_STEP, i);
      ctx.lineTo(CANVAS_SIZE - GRID_STEP, i);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // Draw all green dots with glow
    for (const [x, y] of circlesRef.current) {
      drawCircle(ctx, x, y, '#39ff14', true);
    }
    
    // Draw red dot (chaser) with intense glow
    drawCircle(ctx, cxRef.current, cyRef.current, '#ff073a', true);
    
    // Draw blue dot (player) with glow
    if (dxRef.current >= 0 && dyRef.current >= 0) {
      drawCircle(ctx, dxRef.current, dyRef.current, '#00d4ff', true);
    }
  }, [drawCircle]);

  // Win/lose logic with particle effects
  const win = useCallback(() => {
    setShowModal({ open: true, message: `Level ${level} Complete!`, type: 'win' });
    audioRef.current.level_up?.play();
    
    // Trigger celebration particles
    if (particleSystemRef.current) {
      particleSystemRef.current.celebrate();
    }
    
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setStoredNumber('level', nextLevel);
    setLives(Math.round(nextLevel * 1.5));
    setStoredNumber('lives', Math.round(nextLevel * 1.5));
    
    setTimeout(() => {
      circlesRef.current = [INITIAL_CIRCLE];
      cxRef.current = 25;
      cyRef.current = 25;
      dxRef.current = -25;
      dyRef.current = -25;
      chaseRef.current = false;
      setPlay(false);
      drawGame();
    }, 2000);
  }, [level, drawGame]);

  const lose = useCallback(() => {
    setShowModal({ open: true, message: 'Caught by the chaser!', type: 'lose' });
    audioRef.current.game_over?.play();
    
    // Trigger explosion particles
    if (particleSystemRef.current) {
      particleSystemRef.current.explode(cxRef.current, cyRef.current);
    }
    
    setLives(prev => {
      let next = prev - 1;
      if (next <= 0) {
        setShowModal({ open: true, message: 'Game Over - Starting Fresh!', type: 'lose' });
        setLevel(1);
        setScore(0);
        setStoredNumber('level', 1);
        setStoredNumber('score', 0);
        setTimeout(() => {
          circlesRef.current = [INITIAL_CIRCLE];
          cxRef.current = 25;
          cyRef.current = 25;
          dxRef.current = -25;
          dyRef.current = -25;
          chaseRef.current = false;
          setLives(Math.round(1 * 1.5));
          setStoredNumber('lives', Math.round(1 * 1.5));
          setPlay(false);
          drawGame();
        }, 2000);
        return Math.round(1 * 1.5);
      } else {
        setScore(prevScore => {
          const newScore = Math.max(0, prevScore - 50);
          setStoredNumber('score', newScore);
          return newScore;
        });
        setTimeout(() => {
          cxRef.current = 25;
          cyRef.current = 25;
          dxRef.current = -25;
          dyRef.current = -25;
          chaseRef.current = false;
          setPlay(false);
          drawGame();
        }, 1500);
        setStoredNumber('lives', next);
        return next;
      }
    });
  }, [drawGame]);

  // Main game loop
  const game = useCallback(() => {
    // Move chaser
    let [newCx, newCy] = [cxRef.current, cyRef.current];
    if (chaseRef.current) {
      for (let i = 0; i < level; i++) {
        const [nextX, nextY, dir] = bestMove(newCx, newCy, dxRef.current, dyRef.current);
        if (isOnTrack(newCx, newCy, dir)) {
          newCx = nextX;
          newCy = nextY;
        }
      }
    }
    cxRef.current = newCx;
    cyRef.current = newCy;
    
    // Add green dot for chaser
    if (noDuplicates(circlesRef.current, [newCx, newCy])) {
      circlesRef.current = [...circlesRef.current, [newCx, newCy]];
      audioRef.current.blop?.play();
    }
    
    // Win condition
    if (circlesRef.current.length >= MAX_CIRCLES) {
      audioRef.current.bgmusic?.pause();
      win();
      return;
    }
    
    // Lose condition
    if (newCx === dxRef.current && newCy === dyRef.current && chaseRef.current) {
      lose();
      return;
    }
    
    drawGame();
  }, [level, bestMove, isOnTrack, noDuplicates, drawGame, win, lose]);

  // Enhanced mouse move handler
  const handleMouseMove = useCallback((evt: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let mx = evt.clientX - rect.left;
    let my = evt.clientY - rect.top;
    
    if (mx >= GRID_STEP && mx <= CANVAS_SIZE - GRID_STEP && my >= GRID_STEP && my <= CANVAS_SIZE - GRID_STEP) {
      if (!chaseRef.current) chaseRef.current = true;
      
      // Snap to nearest grid
      mx = Math.round(mx / GRID_STEP) * GRID_STEP;
      my = Math.round(my / GRID_STEP) * GRID_STEP;
      
      // Add green dot for player
      if (noDuplicates(circlesRef.current, [mx, my])) {
        circlesRef.current = [...circlesRef.current, [mx, my]];
        audioRef.current.blop?.play();
        
        // Trigger collection particles
        if (particleSystemRef.current) {
          particleSystemRef.current.collect(mx, my);
        }
        
        const newScore = score + Math.round(lives / 2);
        setScore(newScore);
        setStoredNumber('score', newScore);
        if (hscore < newScore) {
          setHScore(newScore);
          setStoredNumber('hscore', newScore);
        }
      }
      dxRef.current = mx;
      dyRef.current = my;
      drawGame();
    }
  }, [score, lives, hscore, noDuplicates, drawGame]);

  // Play/pause logic
  const playPause = useCallback(() => {
    setPlay(prev => !prev);
  }, []);

  // Game loop effect
  useEffect(() => {
    if (play) {
      playGameRef.current = setInterval(game, duration);
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      if (playGameRef.current) clearInterval(playGameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (playGameRef.current) clearInterval(playGameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [play, game, handleMouseMove]);

  // Redraw on state change
  useEffect(() => {
    drawGame();
  }, [score, level, lives, hscore, drawGame]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = {
      blop: new Audio(audioFiles.blop),
      level_up: new Audio(audioFiles.level_up),
      game_over: new Audio(audioFiles.game_over),
      bgmusic: new Audio(audioFiles.bgmusic),
    };
  }, []);

  // Initial draw
  useEffect(() => {
    drawGame();
  }, []);

  return (
    <div className="game-container">
      <div className="game-header">
        <h1 className="game-title">
          <span className="title-text">CHASE</span>
          <span className="title-subtitle">Neural Grid Protocol</span>
        </h1>
        <GameStats 
          score={score}
          level={level}
          lives={lives}
          hscore={hscore}
        />
      </div>
      
      <div className="game-main">
        <GameControls 
          isPlaying={play}
          onPlayPause={playPause}
        />
        
        <div className="canvas-container">
          <canvas
            ref={particleCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="particle-canvas"
          />
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="game-canvas"
          />
          <div className="canvas-overlay">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${(circlesRef.current.length / MAX_CIRCLES) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <ParticleSystem 
        canvasRef={particleCanvasRef}
        ref={particleSystemRef}
      />
      
      <GameModal 
        isOpen={showModal.open}
        message={showModal.message}
        type={showModal.type}
        onClose={() => setShowModal({ open: false, message: '', type: 'info' })}
      />
      
      <style jsx>{`
        .game-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2rem;
          background: var(--primary-bg);
          animation: slideInFromTop 0.8s ease-out;
        }
        
        .game-header {
          text-align: center;
          margin-bottom: 2rem;
          animation: slideInFromTop 0.6s ease-out;
        }
        
        .game-title {
          margin-bottom: 1rem;
        }
        
        .title-text {
          font-family: 'Orbitron', monospace;
          font-size: 4rem;
          font-weight: 900;
          background: linear-gradient(45deg, var(--neon-blue), var(--neon-purple));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 0 0 30px var(--neon-blue);
          display: block;
          animation: glow 2s ease-in-out infinite;
        }
        
        .title-subtitle {
          font-family: 'Exo 2', sans-serif;
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          display: block;
          margin-top: 0.5rem;
        }
        
        .game-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          animation: slideInFromBottom 0.8s ease-out;
        }
        
        .canvas-container {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 
            0 0 50px rgba(0, 212, 255, 0.3),
            inset 0 0 50px rgba(0, 212, 255, 0.1);
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 2px solid var(--glass-border);
        }
        
        .game-canvas, .particle-canvas {
          display: block;
          position: absolute;
          top: 0;
          left: 0;
        }
        
        .particle-canvas {
          pointer-events: none;
          z-index: 2;
        }
        
        .game-canvas {
          z-index: 1;
        }
        
        .canvas-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 3;
          pointer-events: none;
        }
        
        .progress-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--neon-green), var(--neon-blue));
          transition: width 0.3s ease;
          box-shadow: 0 0 10px var(--neon-green);
        }
        
        @media (max-width: 768px) {
          .game-container {
            padding: 1rem;
          }
          
          .title-text {
            font-size: 2.5rem;
          }
          
          .canvas-container {
            transform: scale(0.8);
          }
        }
      `}</style>
    </div>
  );
}