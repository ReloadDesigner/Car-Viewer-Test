import { CarConfig } from '../../../types/carConfig';

export const a45_amgConfig: CarConfig = {
  modelFile: '/models/mercedes/a-class/a45_amg/a45_amg.gltf',
  // Debug aktivieren, um alle Mesh- und Materialnamen auszugeben
  debug: true,
  materials: {
    body: "Paint1Mtl", // Neuer Material-Name aus dem Screenshot
    wheel: "MesheswheeI0051Mtl", // Aktualisiert auf das neue Rad-Material aus dem Screenshot
    drl: "Object_83", // Basierend auf GLTF-Viewer-Screenshot
    interiorMain: ["Meshesleather0081Mtl", "Meshesleather0071Mtl", "Meshesleather0011Mtl", "Meshesleather0031Mtl"], // Hauptinnenraummaterialien
    interiorSecondary: "Meshesperforation1Mtl", // Sekundäres Innenraummaterial
    glass: "material_37" // Vorläufig beibehalten bis neuer Name bekannt
  },
  // Speziell für Sitze und Innenraum des A45 AMG
  interiorConfig: {
    mainMeshes: ["Object_51", "Object_50", "Object_44", "Object_46"], // Hauptsitze und Innenraum
    mainMaterialName: ["Meshesleather0081Mtl", "Meshesleather0071Mtl", "Meshesleather0011Mtl", "Meshesleather0031Mtl"], // Materialien für Hauptinnenraum
    secondaryMeshes: ["Object_58"], // Sekundäre Innenraum-Mesh-Namen
    secondaryMaterialName: "Meshesperforation1Mtl" // Material für perforierte Bereiche
  },
  // Speziell für Felgen des A45 AMG
  wheelConfig: {
    materialName: "MesheswheeI0051Mtl", // Vorderrad-Material aus dem Screenshot
    meshName: ["Object_105", "Object_106", "Object_107", "Object_108"], // Alle Rad-Objekte aus dem Screenshot
    requiresCloning: true, // Gibt an, dass Materialien geklont werden müssen (für bessere Leistung)
    // Zusätzliche Materialien für die Hinterräder
    additionalMaterials: ["MesheswheeI0021Mtl"]
  },
  // Feste schwarze Farbe für das Glas
  initialGlassColor: "#000000",
  // Spezifisches DRL-Setup für den A45 AMG
  drlConfig: {
    meshFilter: ["Object_83", "Object_80"], // Beide Objekte für DRL hinzugefügt
    materialName: "material_7" // Vorläufig beibehalten bis neuer Name bekannt
  },
  useMaterialNameInsteadOfMeshName: true, // Nach Materialname suchen, nicht nach Mesh-Name
  scale: 0.2, // Korrekte Skalierung für das Modell
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