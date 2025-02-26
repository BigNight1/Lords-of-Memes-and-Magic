import Phaser from "phaser";

export default class UIScene extends Phaser.Scene {
  private clickSound!: Phaser.Sound.BaseSound;
  private buildButton!: Phaser.GameObjects.Image;
  private buildMenu!: Phaser.GameObjects.Container;
  private dragStartX: number = 0;
  private isDragging: boolean = false;
  // Agregar recursos
  private resources = {
    gold: 1000,
    wood: 500,
    food: 300,
    stone: 200
  };

  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    // Agregar barra de recursos en la parte superior
    const resourceBar = this.add.container(0, 0);
    
    // Fondo semi-transparente para los recursos
    const resourceBg = this.add.rectangle(0, 0, this.cameras.main.width, 40, 0x000000, 0.3)
      .setOrigin(0, 0);
    
    resourceBar.add(resourceBg);

    // Configuración de los recursos
    const resourceTypes = [
      { key: 'gold', x: 10 },
      { key: 'wood', x: this.cameras.main.width * 0.25 },
      { key: 'food', x: this.cameras.main.width * 0.5 },
      { key: 'stone', x: this.cameras.main.width * 0.75 }
    ];

    const RESOURCE_TARGET_SIZE = 24; // Tamaño objetivo para los iconos de recursos

    // Crear los indicadores de recursos
    resourceTypes.forEach(resource => {
      // Icono del recurso
      const icon = this.add.image(resource.x, 20, resource.key)
        .setOrigin(0, 0.5);

      // Calcular y aplicar la escala para el icono
      const scaleX = RESOURCE_TARGET_SIZE / icon.width;
      const scaleY = RESOURCE_TARGET_SIZE / icon.height;
      const scale = Math.min(scaleX, scaleY);
      icon.setScale(scale);

      // Texto de la cantidad
      const text = this.add.text(
        resource.x + RESOURCE_TARGET_SIZE + 10, // Ajustar la posición del texto basado en el tamaño del icono
        20, 
        this.resources[resource.key as keyof typeof this.resources].toString(), 
        {
          fontSize: '18px',
          color: '#ffffff'
        }
      ).setOrigin(0, 0.5);

      resourceBar.add([icon, text]);
    });

    // Inicializar el sonido
    this.clickSound = this.sound.add("MenuSelection");

    // Crear el menú de construcción (inicialmente oculto)
    this.buildMenu = this.add.container(0, 0).setVisible(false);

    // Fondo del menú (1/4 de la pantalla en la parte inferior)
    const background = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height - this.cameras.main.height / 8,
      "book-background"
    )
    .setScale(2, 0.5) // Escala horizontal y vertical diferente
    .setOrigin(0.5);
    
    // Contenedor scrolleable para los edificios
    const scrollableContainer = this.add.container(0, 0);
    
    // Contenedor para los edificios
    const buildings = [
      { key: 'castle', name: 'Castle', x: 100 },
      { key: 'sawmill', name: 'Sawmill', x: 250 },
      { key: 'farm', name: 'Farm', x: 400 },
      { key: 'mine', name: 'Mine', x: 550 },
      // Puedes agregar más edificios aquí
    ];

    const TARGET_SIZE = 128; // Tamaño objetivo en píxeles

    const buildingButtons = buildings.map(building => {
      // Primero crear el texto para que aparezca detrás de la imagen
      const text = this.add.text(
        building.x,
        this.cameras.main.height - this.cameras.main.height / 8 - 70, // Mover el texto arriba
        building.name,
        { 
          fontSize: '20px', 
          color: '#000',
          fontStyle: 'bold'  // Opcional: hacer el texto más visible
        }
      ).setOrigin(0.5);

      const button = this.add.image(
        building.x,
        this.cameras.main.height - this.cameras.main.height / 8,
        building.key
      )
      .setInteractive();

      // Ajustar la escala basada en el tamaño original
      const scaleX = TARGET_SIZE / button.width;
      const scaleY = TARGET_SIZE / button.height;
      const scale = Math.min(scaleX, scaleY);
      button.setScale(scale);

      // Agregar el evento click para iniciar la construcción
      button.on('pointerdown', () => {
        this.clickSound.play();
        this.scene.get('MainScene').events.emit('startPlacement', building.key);
        this.buildMenu.setVisible(false);
        this.showMainButtons(true);
      });

      return [button, text];
    }).flat();

    scrollableContainer.add(buildingButtons);

    // Mejorar el control del scroll
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.buildMenu.visible) {
        this.isDragging = true;
        this.dragStartX = pointer.x - (scrollableContainer.x || 0);
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isDragging && this.buildMenu.visible) {
        const newX = pointer.x - this.dragStartX;
        const minX = this.cameras.main.width - (buildings.length * 150 + 100);
        scrollableContainer.x = Phaser.Math.Clamp(newX, minX, 0);
      }
    });

    this.input.on('pointerup', () => {
      this.isDragging = false;
    });

    // Agregar todos los elementos al contenedor del menú
    this.buildMenu.add([background, scrollableContainer]);

    // Botón de cerrar (X)
    const closeButton = this.add.text(
      this.cameras.main.width - 45,
      this.cameras.main.height - this.cameras.main.height / 4 - 15,
      'X',
      { fontSize: '32px', color: '#000' }
    )
    .setInteractive()
    .on('pointerdown', () => {
      this.buildMenu.setVisible(false);
      this.showMainButtons(true);
    });

    this.buildMenu.add(closeButton);

    // Crear el botón de construcción (inicialmente invisible)
    this.buildButton = this.add.image(
      this.cameras.main.width - 50,
      this.cameras.main.height - 170, // 50px más arriba que la flecha
      "building"
    )
    .setInteractive()
    .setScale(0.1)
    .setScrollFactor(0)
    .setVisible(false); // Inicialmente oculto

    // Evento click del botón de construcción
    this.buildButton.on('pointerdown', () => {
      this.buildMenu.setVisible(true);
      this.showMainButtons(false);
    });

    // Crear el botón de flecha arriba
    const arrowButton = this.add.image(
      this.cameras.main.width - 50,
      this.cameras.main.height - 100,
      "arrow-up"
    )
    .setInteractive()
    .setScale(0.1)
    .setScrollFactor(0);

    // Evento click de la flecha ahora muestra/oculta el botón de construcción
    arrowButton.on('pointerdown', () => {
      this.clickSound.play();
      this.buildButton.setVisible(!this.buildButton.visible);
    });

    // Crear el botón world
    const worldButton = this.add.image(
      this.cameras.main.width - 50,
      this.cameras.main.height - 50,
      "world"
    )
    .setInteractive()
    .setScale(0.1)
    .setScrollFactor(0);

    worldButton.on('pointerdown', () => {
      console.log('hola');
    });
  }

  // Método para mostrar/ocultar los botones principales
  private showMainButtons(visible: boolean) {
    // Guardar referencias a los botones principales
    const mainButtons = [
      this.buildButton,
      this.children.list.find(child => child instanceof Phaser.GameObjects.Image && (child as any).texture.key === 'world'),
      this.children.list.find(child => child instanceof Phaser.GameObjects.Image && (child as any).texture.key === 'arrow-up')
    ];

    // Ocultar/mostrar todos los botones principales
    mainButtons.forEach(button => {
      if (button) {
        (button as Phaser.GameObjects.Image).setVisible(visible);
      }
    });
  }

  // Método para actualizar la cantidad de un recurso
  updateResource(type: 'gold' | 'wood' | 'food' | 'stone', amount: number) {
    this.resources[type] += amount;
    // Actualizar el texto correspondiente
    const resourceText = this.children.list.find(
      child => child instanceof Phaser.GameObjects.Text && 
      child.x === (type === 'gold' ? 45 : 
                  type === 'wood' ? this.cameras.main.width * 0.25 + 35 :
                  type === 'food' ? this.cameras.main.width * 0.5 + 35 :
                  this.cameras.main.width * 0.75 + 35)
    ) as Phaser.GameObjects.Text;

    if (resourceText) {
      resourceText.setText(this.resources[type].toString());
    }
  }

  update() {
    // Aquí puedes actualizar elementos de la UI
  }
}
