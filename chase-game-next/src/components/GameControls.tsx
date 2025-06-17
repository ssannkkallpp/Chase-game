"use client";

import React from 'react';
import Link from 'next/link';

interface GameControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
}

export default function GameControls({ isPlaying, onPlayPause }: GameControlsProps) {
  return (
    <div className="game-controls">
      <button 
        className="control-button primary"
        onClick={onPlayPause}
      >
        <span className="button-icon">
          {isPlaying ? '⏸️' : '▶️'}
        </span>
        <span className="button-text">
          {isPlaying ? 'PAUSE' : 'PLAY'}
        </span>
      </button>
      
      <Link href="/rules" className="control-button secondary">
        <span className="button-icon">📋</span>
        <span className="button-text">RULES</span>
      </Link>
      
      <button className="control-button tertiary" onClick={() => window.location.reload()}>
        <span className="button-icon">🔄</span>
        <span className="button-text">RESET</span>
      </button>
      
      <style jsx>{`
        .game-controls {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
        }
        
        .control-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-family: 'Exo 2', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(10px);
          border: 1px solid transparent;
        }
        
        .control-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .control-button:hover::before {
          left: 100%;
        }
        
        .primary {
          background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
          color: white;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
        }
        
        .primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.5);
        }
        
        .secondary {
          background: var(--glass-bg);
          color: var(--neon-green);
          border: 1px solid var(--neon-green);
          box-shadow: 0 4px 15px rgba(57, 255, 20, 0.2);
        }
        
        .secondary:hover {
          background: rgba(57, 255, 20, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(57, 255, 20, 0.3);
        }
        
        .tertiary {
          background: var(--glass-bg);
          color: var(--neon-red);
          border: 1px solid var(--neon-red);
          box-shadow: 0 4px 15px rgba(255, 7, 58, 0.2);
        }
        
        .tertiary:hover {
          background: rgba(255, 7, 58, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 7, 58, 0.3);
        }
        
        .button-icon {
          font-size: 1.2rem;
          filter: drop-shadow(0 0 5px currentColor);
        }
        
        .button-text {
          font-weight: 700;
          text-shadow: 0 0 10px currentColor;
        }
        
        .control-button:active {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(0, 212, 255, 0.4);
        }
        
        @media (max-width: 768px) {
          .game-controls {
            gap: 0.5rem;
          }
          
          .control-button {
            padding: 0.6rem 1.2rem;
            font-size: 0.8rem;
          }
          
          .button-icon {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}