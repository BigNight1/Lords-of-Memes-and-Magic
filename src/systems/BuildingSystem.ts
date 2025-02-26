import { Building } from "../entities/Building";
import { BuildingGhost } from "../entities/BuildingGhost";
import { BUILDING_CONFIGS } from "../config/buildingConfigs";
import { GameState } from "../config/types";
import { GridSystem } from "./GridSystem";
import { UIManager } from "./UIManager";

export class BuildingSystem {
  private scene: Phaser.Scene;
  private gridSystem: GridSystem;
  private uiManager: UIManager;
  private placedBuildings: Building[] = [];
  private buildingGhost: BuildingGhost | null = null;
  private selectedBuilding: string | null = null;
  private currentState: GameState = GameState.IDLE;
  private readonly TILE_SIZE = 16; // Tamaño de cada tile

  constructor(scene: Phaser.Scene, gridSystem: GridSystem, uiManager: UIManager) {
    this.scene = scene;
    this.gridSystem = gridSystem;
    this.uiManager = uiManager;
  }

  init() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.scene.events.on('startPlacement', this.startPlacement, this);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerdown', this.handlePointerDown, this);
  }

  startPlacement(buildingKey: string) {
    this.selectedBuilding = buildingKey;
    const config = BUILDING_CONFIGS[buildingKey];
    
    if (!config) return;

    this.setState(GameState.BUILDING_MODE);
    this.createBuildingGhost(buildingKey, config);
  }

  private createBuildingGhost(key: string, config: any) {
    const pointer = this.scene.input.activePointer;
    const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const snappedX = Math.floor(worldPoint.x / 16) * 16;
    const snappedY = Math.floor(worldPoint.y / 16) * 16;

    if (this.buildingGhost) this.buildingGhost.destroy();
    
    this.buildingGhost = new BuildingGhost(
      this.scene,
      snappedX,
      snappedY,
      key,
      config.width,
      config.height
    );

    this.gridSystem.showBuildingGrid(config.width, config.height, snappedX, snappedY);
  }

  placeBuilding(x: number, y: number) {
    if (!this.selectedBuilding || !this.buildingGhost) return;

    const config = BUILDING_CONFIGS[this.selectedBuilding];
    const building = new Building(
      this.scene,
      x,
      y,
      this.selectedBuilding,
      config.width,
      config.height
    );

    this.placedBuildings.push(building);
    this.scene.add.existing(building);

    // Agregar log con información de la construcción
    console.log(`Edificio colocado:`, {
      tipo: this.selectedBuilding,
      posición: { x, y },
      dimensiones: {
        ancho: config.width * 16,
        alto: config.height * 16
      }
    });

    this.setState(GameState.IDLE);
  }

  setState(newState: GameState) {
    this.currentState = newState;
    
    if (newState === GameState.BUILDING_MODE) {
      // Mostrar áreas ocupadas cuando entramos en modo construcción
      this.gridSystem.showOccupiedAreas(this.placedBuildings);
    } else if (newState === GameState.IDLE) {
      if (this.buildingGhost) {
        this.buildingGhost.destroy();
        this.buildingGhost = null;
      }
      this.selectedBuilding = null;
      // Limpiar áreas ocupadas cuando salimos del modo construcción
      this.gridSystem.clear();
    }
  }

  private snapToGrid(x: number, y: number): { x: number, y: number } {
    // Ajustar a la cuadrícula del tilemap
    return {
      x: Math.floor(x / this.TILE_SIZE) * this.TILE_SIZE + (this.TILE_SIZE / 2),
      y: Math.floor(y / this.TILE_SIZE) * this.TILE_SIZE + (this.TILE_SIZE / 2)
    };
  }

  private handlePointerMove(pointer: Phaser.Input.Pointer) {
    if (this.buildingGhost && this.currentState === GameState.BUILDING_MODE && this.selectedBuilding) {
      const config = BUILDING_CONFIGS[this.selectedBuilding];
      const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      
      // Usar el nuevo método de snap
      const { x: snappedX, y: snappedY } = this.snapToGrid(worldPoint.x, worldPoint.y);

      this.buildingGhost.setPosition(snappedX, snappedY);
      this.gridSystem.showBuildingGrid(config.width, config.height, snappedX, snappedY);

      const isValid = this.isValidPlacement(snappedX, snappedY);
      this.buildingGhost.setValidPosition(isValid);
      this.gridSystem.setValidPlacement(isValid);
    }
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonDown() && this.currentState === GameState.BUILDING_MODE) {
      this.cancelPlacement();
      return;
    }

    if (this.buildingGhost && this.currentState === GameState.BUILDING_MODE) {
      const worldPoint = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
      const { x: snappedX, y: snappedY } = this.snapToGrid(worldPoint.x, worldPoint.y);

      if (this.isValidPlacement(snappedX, snappedY)) {
        this.showConfirmationButtons(snappedX, snappedY);
      }
    }
  }

  private showConfirmationButtons(x: number, y: number) {
    const config = BUILDING_CONFIGS[this.selectedBuilding!];
    const buttonY = y - (config.height * 16) / 2 - 30;

    this.uiManager.showConfirmationButtons(
      x,
      buttonY,
      () => this.confirmPlacement(x, y),
      () => this.cancelPlacement()
    );
  }

  private confirmPlacement(x: number, y: number) {
    this.placeBuilding(x, y);
    this.gridSystem.clear();
    this.uiManager.hideConfirmationButtons();
    this.setState(GameState.IDLE);
  }

  private cancelPlacement() {
    this.gridSystem.clear();
    this.uiManager.hideConfirmationButtons();
    this.setState(GameState.IDLE);
  }

  private isValidPlacement(x: number, y: number): boolean {
    if (!this.selectedBuilding) return false;
    const config = BUILDING_CONFIGS[this.selectedBuilding];

    // Ajustar las coordenadas considerando el origen centrado
    const halfWidth = (config.width * 16) / 2;
    const halfHeight = (config.height * 16) / 2;

    // Verificar límites del mapa considerando el centro del edificio
    if (x - halfWidth < 0 || 
        x + halfWidth > 960 || 
        y - halfHeight < 0 || 
        y + halfHeight > 960) {
      return false;
    }

    // Verificar colisiones con otros edificios
    for (const building of this.placedBuildings) {
      const existingConfig = BUILDING_CONFIGS[building.texture.key];
      if (!existingConfig) continue;

      const existingHalfWidth = (existingConfig.width * 16) / 2;
      const existingHalfHeight = (existingConfig.height * 16) / 2;

      // Verificar superposición considerando los centros
      const overlap = !(
        x + halfWidth <= building.x - existingHalfWidth ||
        x - halfWidth >= building.x + existingHalfWidth ||
        y + halfHeight <= building.y - existingHalfHeight ||
        y - halfHeight >= building.y + existingHalfHeight
      );

      if (overlap) return false;
    }

    return true;
  }

  isBuilding(): boolean {
    return this.currentState === GameState.BUILDING_MODE;
  }

  // ... más métodos según necesites
}