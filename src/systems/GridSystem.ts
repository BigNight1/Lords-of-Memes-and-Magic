import { BUILDING_CONFIGS } from "../config/buildingConfigs";
import { Building } from "../entities/Building";

export class GridSystem {
  private scene: Phaser.Scene;
  private buildingGrid: Phaser.GameObjects.Graphics;
  private occupiedAreasGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.buildingGrid = scene.add.graphics().setVisible(false);
    this.occupiedAreasGraphics = scene.add.graphics();
  }

  showBuildingGrid(width: number, height: number, x: number, y: number) {
    this.buildingGrid.clear();

    const offsetX = -(width * 16) / 2;
    const offsetY = -(height * 16) / 2;

    this.buildingGrid.lineStyle(2, 0xffff00, 0.5);
    this.buildingGrid.strokeRect(offsetX, offsetY, width * 16, height * 16);

    // Dibujar cuadrícula interior
    this.buildingGrid.lineStyle(1, 0xffffff, 0.3);
    for (let i = 0; i <= width; i++) {
      this.buildingGrid.moveTo(offsetX + i * 16, offsetY);
      this.buildingGrid.lineTo(offsetX + i * 16, offsetY + height * 16);
    }
    for (let i = 0; i <= height; i++) {
      this.buildingGrid.moveTo(offsetX, offsetY + i * 16);
      this.buildingGrid.lineTo(offsetX + width * 16, offsetY + i * 16);
    }

    this.buildingGrid.setPosition(x, y).setVisible(true);
  }

  showOccupiedAreas(buildings: Building[]) {
    this.occupiedAreasGraphics.clear();

    buildings.forEach((building) => {
      const config = BUILDING_CONFIGS[building.texture.key];
      if (!config) return;

      // Dibujar borde blanco suave
      this.occupiedAreasGraphics.lineStyle(2, 0xffffff, 0.4);
      this.occupiedAreasGraphics.fillStyle(0xffffff, 0.15);

      const x = building.x - (config.width * 16) / 2;
      const y = building.y - (config.height * 16) / 2;

      this.occupiedAreasGraphics.strokeRect(
        x,
        y,
        config.width * 16,
        config.height * 16
      );
      this.occupiedAreasGraphics.fillRect(
        x,
        y,
        config.width * 16,
        config.height * 16
      );
    });
  }

  setValidPlacement(isValid: boolean) {
    this.buildingGrid.setAlpha(isValid ? 0.5 : 0.8);
  }

  clear() {
    this.buildingGrid.clear().setVisible(false);
    this.occupiedAreasGraphics.clear();
  }
}
