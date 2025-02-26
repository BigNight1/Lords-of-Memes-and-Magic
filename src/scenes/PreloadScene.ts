// scenes/PreloadScene.ts
import Phaser from "phaser";

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: "PreloadScene" });
  }

  preload() {
    // Cargar el mapa json
    this.load.tilemapTiledJSON("tilemap", "/assets/mapa/mapa.json");

    // Cargar el tileset
    this.load.image("tiles", "/assets/tiles/tilemap.png");

    // Cargar imágenes de edificios
    this.load.image("castle", "/assets/images/castle.png");
    this.load.image("sawmill", "/assets/images/Sawmill.png");
    this.load.image("farm", "/assets/images/farm.png");
    this.load.image("mine", "/assets/images/mine.svg");

    // Cargar imágenes de recursos
    this.load.image("wood", "/assets/images/wood.svg");
    this.load.image("gold", "/assets/images/gold.png");
    this.load.image("food", "/assets/images/food.png");
    this.load.image("stone", "/assets/images/stone.png");

    // Cargar imagen del botón de construcción
    this.load.image("world", "/assets/images/world.png");
    this.load.image("building", "/assets/images/book.png");
    this.load.image("book-background", "/assets/images/book-background.png");

    // Cargar imagen de la flecha
    this.load.image("arrow-up", "/assets/images/arrow-up.webp");

    // Cargar el sonido
    this.load.audio("MenuSelection", "/assets/sounds/MenuSelection.wav");
  }

  create() {
    // Iniciar MainScene primero
    this.scene.start("MainScene");
    
    // Luego iniciar UIScene cuando MainScene esté lista
    this.scene.launch("UIScene");
  }
}
