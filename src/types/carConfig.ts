export interface CarConfig {
  modelFile: string;
  materials: {
    body: string;
    wheel: string;
    drl: string;
    interiorMain: string;
    interiorSecondary: string;
  };
  // Neue Eigenschaften für modellspezifische Anpassungen
  scale?: number; // Skalierungsfaktor für das Modell
  position?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  cameraPosition?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface ModelConfig {
  [key: string]: CarConfig;
}