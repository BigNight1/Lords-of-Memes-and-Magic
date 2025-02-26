import { BuildingSystem } from "../systems/BuildingSystem";
import { GridSystem } from "../systems/GridSystem";
import { UIManager } from "../systems/UIManager";

export default class MainScene extends Phaser.Scene {
  private buildingSystem!: BuildingSystem;
  private gridSystem!: GridSystem;
  private uiManager!: UIManager;

  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    this.setupMap();
    this.setupCamera();
    
    // Inicializar sistemas en orden
    this.gridSystem = new GridSystem(this);
    this.uiManager = new UIManager(this);
    this.buildingSystem = new BuildingSystem(this, this.gridSystem, this.uiManager);

    this.buildingSystem.init();
  }

  private setupMap() {
    const map = this.make.tilemap({ key: "tilemap" });
    const tileset = map.addTilesetImage("aaaaa", "tiles");
    if (!tileset) throw new Error("Failed to load tileset");

    const layer = map.createLayer("campo", tileset);
    if (!layer) throw new Error("Failed to create layer");
    layer.setOrigin(0, 0);

    this.cameras.main.setZoom(1);
  }

  private setupCamera() {
    const mapWidth = 960;
    const mapHeight = 960;
    
    // Configurar límites de la cámara
    this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
    
    // Calcular el zoom mínimo basado en el tamaño de la pantalla y el mapa
    const minZoomX = this.cameras.main.width / mapWidth;
    const minZoomY = this.cameras.main.height / mapHeight;
    const minZoom = Math.max(minZoomX, minZoomY); // Usar el valor más grande para evitar espacios vacíos
    
    // Configurar límites de zoom
    const maxZoom = 1.5;
    
    // Variables para el control de arrastre
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;

    // Función para ajustar los límites de la cámara según el zoom
    const updateCameraBounds = () => {
      const zoom = this.cameras.main.zoom;
      const width = this.cameras.main.width / zoom;
      const height = this.cameras.main.height / zoom;

      // Calcular límites máximos para mantener la cámara dentro del mapa
      const maxX = Math.max(0, mapWidth - width);
      const maxY = Math.max(0, mapHeight - height);

      this.cameras.main.scrollX = Phaser.Math.Clamp(
        this.cameras.main.scrollX,
        0,
        maxX
      );
      this.cameras.main.scrollY = Phaser.Math.Clamp(
        this.cameras.main.scrollY,
        0,
        maxY
      );
    };

    // Control de zoom con rueda del mouse
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      const newZoom = Phaser.Math.Clamp(
        zoom - (deltaY * 0.001),
        minZoom,
        maxZoom
      );
      
      this.cameras.main.setZoom(newZoom);
      updateCameraBounds();
    });

    // Control de zoom con gestos táctiles
    this.input.on('pinch', (pointer: any, drag1: any, drag2: any, pinch: number) => {
      const zoom = this.cameras.main.zoom;
      const newZoom = Phaser.Math.Clamp(
        zoom * (1 + (pinch * 0.001)),
        minZoom,
        maxZoom
      );
      
      this.cameras.main.setZoom(newZoom);
      updateCameraBounds();
    });

    // Mover la cámara mientras se arrastra
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (isDragging && !this.buildingSystem.isBuilding()) {
        const zoom = this.cameras.main.zoom;
        const deltaX = (pointer.x - lastX) / zoom;
        const deltaY = (pointer.y - lastY) / zoom;

        this.cameras.main.scrollX -= deltaX;
        this.cameras.main.scrollY -= deltaY;

        // Actualizar límites considerando el zoom
        const width = this.cameras.main.width / zoom;
        const height = this.cameras.main.height / zoom;
        const maxX = Math.max(0, mapWidth - width);
        const maxY = Math.max(0, mapHeight - height);

        this.cameras.main.scrollX = Phaser.Math.Clamp(
          this.cameras.main.scrollX,
          0,
          maxX
        );
        this.cameras.main.scrollY = Phaser.Math.Clamp(
          this.cameras.main.scrollY,
          0,
          maxY
        );

        lastX = pointer.x;
        lastY = pointer.y;
      }
    });

    // Iniciar arrastre
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.buildingSystem.isBuilding()) {
        isDragging = true;
        lastX = pointer.x;
        lastY = pointer.y;
      }
    });

    // Detener arrastre
    this.input.on('pointerup', () => {
      isDragging = false;
    });
  }
}