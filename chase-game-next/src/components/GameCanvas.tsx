"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';
import GameControls from './GameControls';
import GameStats from './GameStats';
import GameModal from './GameModal';
import ParticleSystem from './ParticleSystem';

const CANVAS_SIZE = 625;
const GRID_STEP = 25;
const INITIAL_CIRCLE: [number, number] = [25, 25];
const MAX_CIRCLES = 576; // 24x24 grid

// Storage helpers
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
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const particleSystemRef = useRef<any>(null);
  
  // Game state
  const [level, setLevel] = useState(() => getStoredNumber('level', 1));
  const [lives, setLives] = useState(() => getStoredNumber('lives', Math.round(1 * 1.5)));
  const [score, setScore] = useState(() => getStoredNumber('score', 0));
  const [hscore, setHScore] = useState(() => getStoredNumber('hscore', 0));
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState<{ open: boolean; message: string; type: 'win' | 'lose' | 'info' }>({ 
    open: false, 
    message: '', 
    type: 'info' 
  });
  
  // Game objects - using refs to maintain state across renders
  const circlesRef = useRef<[number, number][]>([INITIAL_CIRCLE]);
  const chaserRef = useRef({ x: 25, y: 25 });
  const playerRef = useRef({ x: -25, y: -25 });
  const chaseActiveRef = useRef(false);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = {
        blop: new Audio('/assets/audio/blop.mp3'),
        level_up: new Audio('/assets/audio/level_up.mp3'),
        game_over: new Audio('/assets/audio/game_over.mp3'),
        bgmusic: new Audio('/assets/audio/background_music.mp3'),
      };
      
      // Set audio properties
      Object.values(audioRef.current).forEach(audio => {
        audio.volume = 0.3;
        audio.preload = 'auto';
      });
      
      if (audioRef.current.bgmusic) {
        audioRef.current.bgmusic.loop = true;
        audioRef.current.bgmusic.volume = 0.1;
      }
    }
  }, []);

  // Utility functions
  const noDuplicates = useCallback((array: [number, number][], elem: [number, number]) => {
    return !array.some(([x, y]) => x === elem[0] && y === elem[1]);
  }, []);

  const isOnTrack = useCallback((x: number, y: number, dir: string) => {
    let newX = x, newY = y;
    switch (dir) {
      case 'l': newX -= GRID_STEP; break;
      case 'r': newX += GRID_STEP; break;
      case 'u': newY -= GRID_STEP; break;
      case 'd': newY += GRID_STEP; break;
    }
    return newX >= GRID_STEP && newX <= CANVAS_SIZE - GRID_STEP && 
           newY >= GRID_STEP && newY <= CANVAS_SIZE - GRID_STEP;
  }, []);

  const bestMove = useCallback((chaserX: number, chaserY: number, playerX: number, playerY: number) => {
    const dx = chaserX - playerX;
    const dy = chaserY - playerY;
    let move = '';

    if ((Math.abs(dx) > Math.abs(dy) && dy !== 0) || dx === 0) {
      move = dy > 0 ? 'u' : 'd';
    }
    if ((Math.abs(dy) > Math.abs(dx) && dx !== 0) || dy === 0) {
      move = dx > 0 ? 'l' : 'r';
    }
    if (Math.abs(dx) === Math.abs(dy)) {
      if (dx === 0 && dy === 0) {
        return { x: 25, y: 25, move: 'u' };
      } else if (dx > 0) move = 'l';
      else if (dy > 0) move = 'u';
      else if (dx < 0) move = 'r';
      else if (dy < 0) move = 'd';
    }

    let newX = chaserX, newY = chaserY;
    switch (move) {
      case 'u': newY -= GRID_STEP; break;
      case 'd': newY += GRID_STEP; break;
      case 'l': newX -= GRID_STEP; break;
      case 'r': newX += GRID_STEP; break;
    }
    return { x: newX, y: newY, move };
  }, []);

  // Drawing functions
  const drawCircle = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string, glowing = false) => {
    ctx.save();
    
    if (glowing) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
    }
    
    // Outer glow
    if (glowing) {
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = color + '40';
      ctx.fill();
    }
    
    // Main circle
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    
    const gradient = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, 10);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, color + '80');
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = '#ffffff40';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
  }, []);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    bgGradient.addColorStop(0, '#0a0a0f');
    bgGradient.addColorStop(0.5, '#1a1a2e');
    bgGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Grid
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
    
    // Draw all green dots
    for (const [x, y] of circlesRef.current) {
      drawCircle(ctx, x, y, '#39ff14', true);
    }
    
    // Draw chaser (red)
    drawCircle(ctx, chaserRef.current.x, chaserRef.current.y, '#ff073a', true);
    
    // Draw player (blue) if active
    if (playerRef.current.x >= 0 && playerRef.current.y >= 0) {
      drawCircle(ctx, playerRef.current.x, playerRef.current.y, '#00d4ff', true);
    }
  }, [drawCircle]);

  // Game logic
  const gameLoop = useCallback(() => {
    if (!chaseActiveRef.current) return;

    // Move chaser towards player
    for (let i = 0; i < level; i++) {
      const move = bestMove(chaserRef.current.x, chaserRef.current.y, playerRef.current.x, playerRef.current.y);
      if (isOnTrack(chaserRef.current.x, chaserRef.current.y, move.move)) {
        chaserRef.current.x = move.x;
        chaserRef.current.y = move.y;
      }
    }

    // Add green dot for chaser path
    if (noDuplicates(circlesRef.current, [chaserRef.current.x, chaserRef.current.y])) {
      circlesRef.current = [...circlesRef.current, [chaserRef.current.x, chaserRef.current.y]];
      audioRef.current.blop?.play().catch(() => {});
    }

    // Check win condition
    if (circlesRef.current.length >= MAX_CIRCLES) {
      win();
      return;
    }

    // Check collision
    if (chaserRef.current.x === playerRef.current.x && chaserRef.current.y === playerRef.current.y) {
      lose();
      return;
    }

    drawGame();
  }, [level, bestMove, isOnTrack, noDuplicates, drawGame]);

  // Win/lose handlers
  const win = useCallback(() => {
    setIsPlaying(false);
    audioRef.current.bgmusic?.pause();
    audioRef.current.level_up?.play().catch(() => {});
    
    if (particleSystemRef.current) {
      particleSystemRef.current.celebrate();
    }
    
    setShowModal({ open: true, message: `Level ${level} Complete!`, type: 'win' });
    
    setTimeout(() => {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setLives(Math.round(nextLevel * 1.5));
      setStoredNumber('level', nextLevel);
      setStoredNumber('lives', Math.round(nextLevel * 1.5));
      
      // Reset game state
      circlesRef.current = [INITIAL_CIRCLE];
      chaserRef.current = { x: 25, y: 25 };
      playerRef.current = { x: -25, y: -25 };
      chaseActiveRef.current = false;
      
      drawGame();
      setShowModal({ open: false, message: '', type: 'info' });
    }, 3000);
  }, [level, drawGame]);

  const lose = useCallback(() => {
    setIsPlaying(false);
    audioRef.current.bgmusic?.pause();
    audioRef.current.game_over?.play().catch(() => {});
    
    if (particleSystemRef.current) {
      particleSystemRef.current.explode(chaserRef.current.x, chaserRef.current.y);
    }
    
    setLives(prev => {
      const newLives = prev - 1;
      if (newLives <= 0) {
        setShowModal({ open: true, message: 'Game Over - Starting Fresh!', type: 'lose' });
        setTimeout(() => {
          setLevel(1);
          setScore(0);
          setLives(Math.round(1 * 1.5));
          setStoredNumber('level', 1);
          setStoredNumber('score', 0);
          setStoredNumber('lives', Math.round(1 * 1.5));
          
          circlesRef.current = [INITIAL_CIRCLE];
          chaserRef.current = { x: 25, y: 25 };
          playerRef.current = { x: -25, y: -25 };
          chaseActiveRef.current = false;
          
          drawGame();
          setShowModal({ open: false, message: '', type: 'info' });
        }, 3000);
        return Math.round(1 * 1.5);
      } else {
        setShowModal({ open: true, message: 'Caught! Try again!', type: 'lose' });
        setScore(prevScore => {
          const newScore = Math.max(0, prevScore - 50);
          setStoredNumber('score', newScore);
          return newScore;
        });
        
        setTimeout(() => {
          chaserRef.current = { x: 25, y: 25 };
          playerRef.current = { x: -25, y: -25 };
          chaseActiveRef.current = false;
          drawGame();
          setShowModal({ open: false, message: '', type: 'info' });
        }, 2000);
        
        setStoredNumber('lives', newLives);
        return newLives;
      }
    });
  }, [drawGame]);

  // Mouse handler
  const handleMouseMove = useCallback((evt: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlaying) return;
    
    const rect = canvas.getBoundingClientRect();
    let mx = evt.clientX - rect.left;
    let my = evt.clientY - rect.top;
    
    if (mx >= GRID_STEP && mx <= CANVAS_SIZE - GRID_STEP && 
        my >= GRID_STEP && my <= CANVAS_SIZE - GRID_STEP) {
      
      if (!chaseActiveRef.current) {
        chaseActiveRef.current = true;
      }
      
      // Snap to grid
      mx = Math.round(mx / GRID_STEP) * GRID_STEP;
      my = Math.round(my / GRID_STEP) * GRID_STEP;
      
      // Only move if position changed
      if (mx !== playerRef.current.x || my !== playerRef.current.y) {
        playerRef.current.x = mx;
        playerRef.current.y = my;
        
        // Add green dot for player
        if (noDuplicates(circlesRef.current, [mx, my])) {
          circlesRef.current = [...circlesRef.current, [mx, my]];
          audioRef.current.blop?.play().catch(() => {});
          
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
        
        drawGame();
      }
    }
  }, [isPlaying, score, lives, hscore, noDuplicates, drawGame]);

  // Play/pause handler
  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => {
      const newPlaying = !prev;
      if (newPlaying) {
        audioRef.current.bgmusic?.play().catch(() => {});
      } else {
        audioRef.current.bgmusic?.pause();
      }
      return newPlaying;
    });
  }, []);

  // Game loop effect
  useEffect(() => {
    if (isPlaying) {
      gameLoopRef.current = setInterval(gameLoop, 100);
      window.addEventListener('mousemove', handleMouseMove);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      window.removeEventListener('mousemove', handleMouseMove);
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPlaying, gameLoop, handleMouseMove]);

  // Initial draw
  useEffect(() => {
    drawGame();
  }, [drawGame]);

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
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
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