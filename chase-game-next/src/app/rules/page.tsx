import React from 'react';
import Link from 'next/link';

export default function RulesPage() {
  return (
    <main className="rules-page">
      <div className="rules-container">
        <div className="rules-header">
          <h1 className="rules-title">
            <span className="title-main">NEURAL GRID</span>
            <span className="title-sub">Protocol Manual</span>
          </h1>
          <Link href="/" className="back-button">
            <span>←</span> Back to Game
          </Link>
        </div>
        
        <div className="rules-content">
          <div className="rule-section">
            <h2 className="section-title">🎯 Objective</h2>
            <p>Navigate the neural grid and fill it with energy nodes while avoiding the pursuing AI hunter.</p>
          </div>
          
          <div className="rule-section">
            <h2 className="section-title">🎮 Controls</h2>
            <div className="control-grid">
              <div className="control-item">
                <span className="control-icon">🖱️</span>
                <span className="control-desc">Move your cursor to guide the blue energy node</span>
              </div>
              <div className="control-item">
                <span className="control-icon">▶️</span>
                <span className="control-desc">Use PLAY/PAUSE to control game flow</span>
              </div>
            </div>
          </div>
          
          <div className="rule-section">
            <h2 className="section-title">⚡ Game Mechanics</h2>
            <div className="mechanics-list">
              <div className="mechanic-item">
                <span className="mechanic-number">01</span>
                <div className="mechanic-content">
                  <h3>Energy Collection</h3>
                  <p>Guide the blue node across the grid to create green energy points. Each point you create earns score based on remaining lives.</p>
                </div>
              </div>
              
              <div className="mechanic-item">
                <span className="mechanic-number">02</span>
                <div className="mechanic-content">
                  <h3>AI Hunter</h3>
                  <p>The red AI hunter will pursue you once you start moving. It also creates energy points but gives you no score.</p>
                </div>
              </div>
              
              <div className="mechanic-item">
                <span className="mechanic-number">03</span>
                <div className="mechanic-content">
                  <h3>Level Progression</h3>
                  <p>Complete a level by filling the entire grid with energy nodes. Each level increases the AI hunter's speed.</p>
                </div>
              </div>
              
              <div className="mechanic-item">
                <span className="mechanic-number">04</span>
                <div className="mechanic-content">
                  <h3>Lives System</h3>
                  <p>Getting caught by the red hunter costs a life. Lose all lives and you'll restart the current level.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="rule-section">
            <h2 className="section-title">🏆 Scoring</h2>
            <div className="scoring-grid">
              <div className="score-item">
                <span className="score-value">+Lives/2</span>
                <span className="score-desc">Points per energy node you create</span>
              </div>
              <div className="score-item">
                <span className="score-value">-50</span>
                <span className="score-desc">Points lost when caught</span>
              </div>
              <div className="score-item">
                <span className="score-value">Bonus</span>
                <span className="score-desc">Level completion rewards</span>
              </div>
            </div>
          </div>
          
          <div className="rule-section">
            <h2 className="section-title">💡 Pro Tips</h2>
            <div className="tips-list">
              <div className="tip-item">
                <span className="tip-icon">⚡</span>
                <span>Move efficiently to maximize your score before the hunter catches up</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🧠</span>
                <span>Plan your path to avoid getting cornered by the AI</span>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🎯</span>
                <span>Higher levels mean faster hunters but also higher potential scores</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .rules-page {
          min-height: 100vh;
          background: var(--primary-bg);
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(191, 0, 255, 0.1) 0%, transparent 50%);
          padding: 2rem;
          animation: slideInFromTop 0.8s ease-out;
        }
        
        .rules-container {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .rules-header {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
        }
        
        .rules-title {
          margin-bottom: 2rem;
        }
        
        .title-main {
          font-family: 'Orbitron', monospace;
          font-size: 3rem;
          font-weight: 900;
          background: linear-gradient(45deg, var(--neon-blue), var(--neon-green));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: block;
          text-shadow: 0 0 30px var(--neon-blue);
        }
        
        .title-sub {
          font-family: 'Exo 2', sans-serif;
          font-size: 1.2rem;
          color: var(--text-secondary);
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          display: block;
          margin-top: 0.5rem;
        }
        
        .back-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--neon-blue);
          border-radius: 8px;
          color: var(--neon-blue);
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
        }
        
        .back-button:hover {
          background: rgba(0, 212, 255, 0.1);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.3);
        }
        
        .rules-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .rule-section {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
        
        .section-title {
          font-family: 'Orbitron', monospace;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--neon-green);
          margin-bottom: 1.5rem;
          text-shadow: 0 0 10px var(--neon-green);
        }
        
        .control-grid, .scoring-grid {
          display: grid;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .control-item, .score-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .control-icon, .score-value {
          font-size: 1.5rem;
          min-width: 2rem;
        }
        
        .score-value {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          color: var(--neon-yellow);
          text-shadow: 0 0 10px var(--neon-yellow);
        }
        
        .control-desc, .score-desc {
          color: var(--text-secondary);
          line-height: 1.5;
        }
        
        .mechanics-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1rem;
        }
        
        .mechanic-item {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .mechanic-number {
          font-family: 'Orbitron', monospace;
          font-size: 2rem;
          font-weight: 900;
          color: var(--neon-blue);
          text-shadow: 0 0 10px var(--neon-blue);
          min-width: 3rem;
        }
        
        .mechanic-content h3 {
          font-family: 'Orbitron', monospace;
          font-size: 1.1rem;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        
        .mechanic-content p {
          color: var(--text-secondary);
          line-height: 1.6;
        }
        
        .tips-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .tip-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border-left: 3px solid var(--neon-purple);
        }
        
        .tip-icon {
          font-size: 1.5rem;
          min-width: 2rem;
        }
        
        @media (max-width: 768px) {
          .rules-page {
            padding: 1rem;
          }
          
          .title-main {
            font-size: 2rem;
          }
          
          .rule-section {
            padding: 1.5rem;
          }
          
          .mechanic-item {
            flex-direction: column;
            gap: 1rem;
          }
          
          .mechanic-number {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </main>
  );
}