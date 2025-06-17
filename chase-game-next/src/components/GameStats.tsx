"use client";

import React from 'react';

interface GameStatsProps {
  score: number;
  level: number;
  lives: number;
  hscore: number;
}

export default function GameStats({ score, level, lives, hscore }: GameStatsProps) {
  return (
    <div className="game-stats">
      <div className="stats-grid">
        <div className="stat-item score">
          <div className="stat-label">Score</div>
          <div className="stat-value">{score.toLocaleString()}</div>
        </div>
        
        <div className="stat-item level">
          <div className="stat-label">Level</div>
          <div className="stat-value">{level}</div>
        </div>
        
        <div className="stat-item lives">
          <div className="stat-label">Lives</div>
          <div className="stat-value">
            <div className="lives-display">
              {Array.from({ length: Math.max(lives, 0) }, (_, i) => (
                <span key={i} className="life-heart">❤️</span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="stat-item highscore">
          <div className="stat-label">High Score</div>
          <div className="stat-value">{hscore.toLocaleString()}</div>
        </div>
      </div>
      
      <style jsx>{`
        .game-stats {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          padding: 1rem;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .stat-item {
          text-align: center;
          padding: 0.75rem;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }
        
        .stat-item:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
        }
        
        .stat-label {
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
          margin-bottom: 0.25rem;
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: 'Orbitron', monospace;
        }
        
        .score .stat-value {
          color: var(--neon-green);
          text-shadow: 0 0 10px var(--neon-green);
        }
        
        .level .stat-value {
          color: var(--neon-blue);
          text-shadow: 0 0 10px var(--neon-blue);
        }
        
        .lives .stat-value {
          color: var(--neon-red);
        }
        
        .highscore .stat-value {
          color: var(--neon-purple);
          text-shadow: 0 0 10px var(--neon-purple);
        }
        
        .lives-display {
          display: flex;
          justify-content: center;
          gap: 0.25rem;
          flex-wrap: wrap;
        }
        
        .life-heart {
          font-size: 1.2rem;
          filter: drop-shadow(0 0 5px #ff073a);
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
            padding: 0.75rem;
          }
          
          .stat-item {
            padding: 0.5rem;
          }
          
          .stat-value {
            font-size: 1.25rem;
          }
          
          .life-heart {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
}