export interface CarConfig {
  modelFile: string;
  materials: {
    body: string;
    wheel: string;
    drl: string;
    interiorMain: string;
    interiorSecondary: string;
  };
}

export interface ModelConfig {
  [key: string]: CarConfig;
}