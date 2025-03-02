import { CarConfig } from '../../../types/carConfig';

export const a45_amgConfig: CarConfig = {
  modelFile: '/models/mercedes/a-class/a45_amg/a45_amg.gltf',
  // Debug aktivieren, um alle Mesh- und Materialnamen auszugeben
  debug: true,
  materials: {
    body: "body", // Bestätigt durch Screenshot - Material mit ID 17 und Name "body"
    wheel: "material_29", // Basierend auf GLTF-Viewer-Screenshot 
    drl: "material_7", // Basierend auf GLTF-Viewer-Screenshot
    interiorMain: "Seats1", // Sitze-Material aus dem Screenshot
    interiorSecondary: "Dash1", // Armaturenbrett-Material aus dem Screenshot
    glass: "material_37" // Glas-Material aus dem Screenshot
  },
  // Speziell für Sitze und Innenraum des A45 AMG
  interiorConfig: {
    mainMeshes: ["Material3_31"], // Mesh für die Hauptsitze aus dem Screenshot
    mainMaterialName: "Seats1", // Material für die Hauptsitze
    secondaryMeshes: ["Material2_26"], // Mesh für das Armaturenbrett aus dem Screenshot
    secondaryMaterialName: "Dash1" // Material für das Armaturenbrett
  },
  // Speziell für Felgen des A45 AMG
  wheelConfig: {
    materialName: "material_29", // Material aus dem Screenshot
    meshName: "Material2_22", // Mesh aus dem Screenshot
    requiresCloning: true // Gibt an, dass Materialien geklont werden müssen (für bessere Leistung)
  },
  // Feste schwarze Farbe für das Glas
  initialGlassColor: "#000000",
  // Spezifisches DRL-Setup für den A45 AMG
  drlConfig: {
    meshFilter: ["Material3_20"], // Das Mesh aus dem GLTF-Viewer-Screenshot
    materialName: "material_7" // Das Material aus dem GLTF-Viewer-Screenshot
  },
  useMaterialNameInsteadOfMeshName: true, // Nach Materialname suchen, nicht nach Mesh-Name
  scale: 0.02, // Korrekte Skalierung für das Modell
  // Position-Eigenschaft entfernt, um automatische Zentrierung zu nutzen
  rotation: {
    x: 0, 
    y: 0, 
    z: 0
  },
  cameraPosition: {
    x: 0, 
    y: 1,
    z: 5
  }
};