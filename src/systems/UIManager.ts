export class UIManager {
    private scene: Phaser.Scene;
    private confirmationButtons: Phaser.GameObjects.Container | null = null;
  
    constructor(scene: Phaser.Scene) {
      this.scene = scene;
    }
  
    showConfirmationButtons(x: number, y: number, onConfirm: () => void, onCancel: () => void) {
      if (this.confirmationButtons) {
        this.confirmationButtons.destroy();
      }
  
      this.confirmationButtons = this.scene.add.container(x, y);
  
      const confirmButton = this.scene.add.circle(20, 0, 15, 0x00ff00).setInteractive();
      const checkmark = this.scene.add.text(20, 0, '✓', {
        color: '#ffffff',
        fontSize: '20px'
      }).setOrigin(0.5);
  
      const cancelButton = this.scene.add.circle(-20, 0, 15, 0xff0000).setInteractive();
      const cross = this.scene.add.text(-20, 0, '✕', {
        color: '#ffffff',
        fontSize: '20px'
      }).setOrigin(0.5);
  
      this.confirmationButtons.add([confirmButton, checkmark, cancelButton, cross]);
  
      confirmButton.on('pointerdown', onConfirm);
      cancelButton.on('pointerdown', onCancel);
    }
  
    hideConfirmationButtons() {
      if (this.confirmationButtons) {
        this.confirmationButtons.destroy();
        this.confirmationButtons = null;
      }
    }
  }