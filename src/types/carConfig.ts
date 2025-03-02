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
    meshFilter?: string | string[]; // Welche Mesh-Namen für DRL verwendet werden sollen
    materialName?: string; // Welches Material für diese Meshes geändert werden soll
    // Neue Optionen für spezielles DRL-Rendering
    renderOptions?: {
      customRenderOrder?: boolean;  // Ob eine benutzerdefinierte Rendering-Reihenfolge verwendet werden soll
      renderingPriority?: number;   // Priorität für die Rendering-Reihenfolge (höher = wichtiger)
    };
  };
  // Optionale spezielle Konfiguration für Felgen mit komplexen Materialien
  wheelConfig?: {
    materialName: string; // Welches Material für die Felgen verwendet wird
    meshName?: string | string[]; // Welcher Mesh-Name oder welche Mesh-Namen für die Felgen verwendet werden
    requiresCloning?: boolean; // Gibt an, ob Materialien geklont werden müssen für isolierte Farbänderungen
    additionalMaterials?: string[]; // Zusätzliche Material-Namen, die ebenfalls als Rad-Materialien behandelt werden sollen
  };
  // Optionale Einstellung für Modelle, bei denen nach Material-Namen statt nach Mesh-Namen gesucht werden soll
  useMaterialNameInsteadOfMeshName?: boolean;
  // Optionale Einstellung für die initiale Glasfarbe
  initialGlassColor?: string;
  // Debug-Modus für das Ausgeben aller Mesh- und Material-Namen
  debug?: boolean;
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