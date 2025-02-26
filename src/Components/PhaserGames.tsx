import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';

const PhaserGame = () => {
  const gameRef = useRef<any>(null);

  useEffect(() => {
    const initPhaser = async () => {
      const Phaser = (await import('phaser')).default;
      const { config } = await import('@/config/config');
      
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }

      gameRef.current = new Phaser.Game(config);
    };

    initPhaser();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);

  return (
    <div 
      id="game-container" 
      style={{
        width: '100%',
        height: '100vh',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
      }}
    />
  );
};

// Exportar con SSR deshabilitado
export default dynamic(() => Promise.resolve(PhaserGame), {
  ssr: false
});