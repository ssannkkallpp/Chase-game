import React from 'react';

export default function RulesPage() {
  return (
    <main style={{ background: 'black', minHeight: '100vh', color: 'white', padding: '2rem' }}>
      <hr style={{ clear: 'both' }} />
      <h1 style={{ fontSize: '2rem', color: 'green', textAlign: 'center' }}>RULES</h1>
      <h2 style={{ fontSize: '1.5rem', color: 'cornflowerblue', textAlign: 'center' }}>
        Here are the (incomplete) rules to the online game Dodge:
      </h2>
      <div style={{ maxWidth: 600, margin: '2rem auto', fontSize: '1.2rem', color: 'white' }}>
        <ol>
          <li>Guide the blue dot with the mouse pointer across the grid, and stay away from the red dot.</li>
          <li>You may proceed to the next level once the grid is filled with green dots.</li>
          <li>A green dot placed by the blue dot earns points, based on the number of lives left in a level, while a green dot placed by the red dot earns none.</li>
          <li>You go back to the previous level once you lose all lives in a level.</li>
        </ol>
      </div>
      <hr style={{ clear: 'both' }} />
    </main>
  );
}
