import React, { useEffect } from 'react';

const GameCanvas: React.FC = () => {
  const drawGame = () => {
    // Implementation of drawGame
  };

  useEffect(() => {
    const timeout = setTimeout(drawGame, 1000);
    return () => clearTimeout(timeout);
  }, [drawGame]);

  return (
    <div>Game Canvas</div>
  );
};

export default GameCanvas; 