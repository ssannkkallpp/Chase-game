"use client";

import React, { useRef, useEffect, useState, useCallback } from 'react';

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
  const infoRef = useRef<HTMLCanvasElement>(null);
  // UI state
  const [level, setLevel] = useState(() => getStoredNumber('level', 1));
  const [lives, setLives] = useState(() => getStoredNumber('lives', Math.round(1 * 1.5)));
  const [score, setScore] = useState(() => getStoredNumber('score', 0));
  const [hscore, setHScore] = useState(() => getStoredNumber('hscore', 0));
  const [play, setPlay] = useState(false);
  const [showModal, setShowModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
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

  // Draw helpers
  const drawCircle = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.strokeStyle = 'black';
    ctx.fillStyle = color;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
  }, []);

  const drawText = useCallback((ctx: CanvasRenderingContext2D, text: string, startPt: number) => {
    ctx.clearRect(startPt - 10, 0, ctx.measureText('99999999').width, 50);
    ctx.fillText(text, startPt, 25);
  }, []);

  // Draw the full game state
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const info = infoRef.current;
    if (!canvas || !info) return;
    const ctx = canvas.getContext('2d');
    const infoCtx = info.getContext('2d');
    if (!ctx || !infoCtx) return;
    // Clear and draw grid
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.strokeStyle = 'dimgray';
    for (let i = GRID_STEP; i <= CANVAS_SIZE - GRID_STEP; i += GRID_STEP) {
      ctx.moveTo(i, GRID_STEP);
      ctx.lineTo(i, CANVAS_SIZE - GRID_STEP);
      ctx.moveTo(GRID_STEP, i);
      ctx.lineTo(CANVAS_SIZE - GRID_STEP, i);
    }
    ctx.stroke();
    ctx.closePath();
    // Draw all green dots
    for (const [x, y] of circlesRef.current) {
      drawCircle(ctx, x, y, 'green');
    }
    // Draw red dot (chaser)
    drawCircle(ctx, cxRef.current, cyRef.current, 'red');
    // Draw blue dot (player)
    if (dxRef.current >= 0 && dyRef.current >= 0) {
      drawCircle(ctx, dxRef.current, dyRef.current, 'blue');
    }
    // Info bar
    infoCtx.clearRect(0, 0, CANVAS_SIZE, INFO_HEIGHT);
    infoCtx.textAlign = 'center';
    infoCtx.font = '25px Arial';
    infoCtx.strokeStyle = 'dodgerblue';
    infoCtx.fillStyle = 'lightblue';
    infoCtx.strokeText('SCORE', 100, 25);
    infoCtx.strokeText('LEVEL', CANVAS_SIZE / 2, 25);
    infoCtx.strokeText('LIVES', CANVAS_SIZE - 100, 25);
    infoCtx.textAlign = 'left';
    drawText(infoCtx, String(score), 160);
    drawText(infoCtx, String(level), CANVAS_SIZE / 2 + 60);
    drawText(infoCtx, String(lives), CANVAS_SIZE - 40);
  }, [drawCircle, drawText, score, level, lives]);

  // Win/lose logic
  const win = useCallback(() => {
    setShowModal({ open: true, message: `You won level ${level}!` });
    audioRef.current.level_up?.play();
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
    }, 1000);
  }, [level, drawGame]);

  const lose = useCallback(() => {
    setShowModal({ open: true, message: `You were caught!` });
    audioRef.current.game_over?.play();
    setLives(prev => {
      let next = prev - 1;
      if (next <= 0) {
        setShowModal({ open: true, message: 'Game Over.' });
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
        }, 1000);
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
        }, 1000);
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

  // Mouse move handler
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
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'Segoe UI,serif', fontSize: '3rem', color: 'green' }}>
        <b><i>CHASE</i></b>
      </h1>
      <button onClick={playPause} style={{ margin: 8 }}>
        {play ? 'PAUSE' : 'PLAY'}
      </button>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        style={{ border: '3px solid gray', display: 'block', margin: '0 auto' }}
      />
      <br />
      <canvas
        ref={infoRef}
        width={CANVAS_SIZE}
        height={INFO_HEIGHT}
        style={{ display: 'block', margin: '0 auto' }}
      />
      <br />
      <h1
        style={{ fontFamily: 'Arial, serif', fontSize: '1.5rem', color: 'mediumblue', textAlign: 'center' }}
        id="hscore"
      >
        HIGH-SCORE: {hscore}
      </h1>
      <hr style={{ clear: 'both' }} />
      {showModal.open && (
        <div style={{ background: 'rgba(0,0,0,0.8)', color: 'white', padding: 24, borderRadius: 8, position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', zIndex: 1000 }}>
          <div>{showModal.message}</div>
          <button onClick={() => setShowModal({ open: false, message: '' })} style={{ marginTop: 16 }}>Close</button>
        </div>
      )}
    </div>
  );
} 