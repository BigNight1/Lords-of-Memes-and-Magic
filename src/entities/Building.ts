export class Building extends Phaser.GameObjects.Image {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, width: number, height: number) {
      super(scene, x, y, texture);
      this.setOrigin(0.5, 0.5);
      this.adjustScale(width, height);
    }
  
    private adjustScale(width: number, height: number) {
      const scaleX = (width * 16) / this.width;
      const scaleY = (height * 16) / this.height;
      this.setScale(scaleX, scaleY);
    }
  }