// Tipos para la configuración de edificios
interface BuildingCost {
    gold: number;
    wood: number;
  }
  
  interface BuildingConfig {
    width: number;    // Ancho en tiles
    height: number;   // Alto en tiles
    cost: BuildingCost;
    displayName: string;
  }
  
  // Configuración de cada edificio
  export const BUILDING_CONFIGS: Record<string, BuildingConfig> = {
    castle: {
      width: 5,
      height: 5,
      cost: {
        gold: 1000,
        wood: 500
      },
      displayName: 'Castle'
    },
    sawmill: {
        width: 5,
        height: 5,
      cost: {
        gold: 300,
        wood: 200
      },
      displayName: 'Sawmill'
    },
    farm: {
        width: 5,
        height: 5,
      cost: {
        gold: 200,
        wood: 100
      },
      displayName: 'Farm'
    },
    mine: {
        width: 5,
        height: 5,
      cost: {
        gold: 400,
        wood: 300
      },
      displayName: 'Mine'
    }
  };