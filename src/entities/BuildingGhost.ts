export class BuildingGhost extends Phaser.GameObjects.Image {
    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, width: number, height: number) {
      super(scene, x, y, texture);
      scene.add.existing(this);
      this.setOrigin(0.5, 0.5);
      this.setAlpha(0.6);
      
      const scaleX = (width * 16) / this.width;
      const scaleY = (height * 16) / this.height;
      this.setScale(scaleX, scaleY);
    }
  
    setValidPosition(isValid: boolean) {
      this.setTint(isValid ? 0x00ff00 : 0xff0000);
    }
  }