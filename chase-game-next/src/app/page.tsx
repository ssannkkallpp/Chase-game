import React from 'react';
import GameCanvas from '../components/GameCanvas';
import styles from '../styles/button.module.css';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ background: 'black', minHeight: '100vh', color: 'white', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        {/* Play/Pause button will be wired up in GameCanvas */}
        <button className={styles.button} id="button">PAUSE</button>
        <Link href="/rules" legacyBehavior>
          <a className={styles.button} target="_blank" style={{ marginLeft: 8 }}>RULES</a>
        </Link>
      </div>
      <GameCanvas />
    </main>
  );
}
