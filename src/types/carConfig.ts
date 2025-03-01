export interface CarConfig {
  modelFile: string;
  materials: {
    body: string;
    wheel: string;
    drl: string;
    interiorMain: string | string[]; // Kann ein einzelner Materialname oder eine Liste von Materialnamen sein
    interiorSecondary: string;
    glass?: string; // Optionales Material für Glas
  };
  // Optionale spezielle Konfiguration für DRL-Lichter mit komplexen Materialien
  drlConfig?: {
    meshFilter: string[]; // Welche Mesh-Namen für DRL verwendet werden sollen
    materialName: string; // Welches Material für diese Meshes geändert werden soll
  };
  // Optionale Einstellung für Modelle, bei denen nach Material-Namen statt nach Mesh-Namen gesucht werden soll
  useMaterialNameInsteadOfMeshName?: boolean;
  // Optionale Einstellung für die initiale Glasfarbe
  initialGlassColor?: string;
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