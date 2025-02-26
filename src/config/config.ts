import PreloadScene from '@/scenes/PreloadScene';
import MainScene from '@/scenes/MainScene';
import UIScene from '@/scenes/UIScene';
import Phaser from 'phaser';

export const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#2d2d2d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 414,
    height: 896,
    min: {
      width: 375,
      height: 667
    },
    max: {
      width: 1920,
      height: 1080
    }
  },
  physics: {
    default: 'arcade',
    arcade: { 
      debug: false,
      gravity: { x: 0, y: 0 }
    }
  },
  scene: [PreloadScene, MainScene, UIScene]
};