import { CarConfig } from '../../../types/carConfig';

export const c63_amgConfig: CarConfig = {
  modelFile: '/models/mercedes/c-class/c63/c63_amg/c63_amg.gltf',
  // Debug aktivieren, um alle Mesh- und Materialnamen auszugeben
  debug: true,
  materials: {
    body: "Paint1Mtl", // Material-Name für die Karosserie
    wheel: "MesheswheeI0051Mtl", // Rad-Material
    drl: "Object_83", // DRL-Objekt
    interiorMain: ["Meshesleather0081Mtl", "Meshesleather0071Mtl", "Meshesleather0011Mtl", "Meshesleather0031Mtl"], // Hauptinnenraummaterialien
    interiorSecondary: "Meshesperforation1Mtl", // Sekundäres Innenraummaterial
    glass: "material_37" // Glas-Material
  },
  // Speziell für Sitze und Innenraum des C63 AMG
  interiorConfig: {
    mainMeshes: ["Object_51", "Object_50", "Object_44", "Object_46"], // Hauptsitze und Innenraum
    mainMaterialName: ["Meshesleather0081Mtl", "Meshesleather0071Mtl", "Meshesleather0011Mtl", "Meshesleather0031Mtl"], // Materialien für Hauptinnenraum
    secondaryMeshes: ["Object_58"], // Sekundäre Innenraum-Mesh-Namen
    secondaryMaterialName: "Meshesperforation1Mtl" // Material für perforierte Bereiche
  },
  // Speziell für Felgen des C63 AMG
  wheelConfig: {
    materialName: "MesheswheeI0051Mtl", // Vorderrad-Material
    meshName: ["Object_105", "Object_106", "Object_107", "Object_108"], // Alle Rad-Objekte
    requiresCloning: true, // Gibt an, dass Materialien geklont werden müssen (für bessere Leistung)
    // Zusätzliche Materialien für die Hinterräder
    additionalMaterials: ["MesheswheeI0021Mtl"]
  },
  // Feste schwarze Farbe für das Glas
  initialGlassColor: "#000000",
  // Spezifisches DRL-Setup für den C63 AMG
  drlConfig: {
    meshFilter: ["Object_83", "Object_80"], // Beide Objekte für DRL
    materialName: "material_7", // DRL-Material
    // Zusätzliche Optionen für DRL-Rendering
    renderOptions: {
      customRenderOrder: true, // Aktiviert spezielle Rendering-Reihenfolge
      renderingPriority: 2     // Höhere Priorität für die DRLs
    }
  },
  // Wir verwenden materialbasierte Suche für den C63 AMG (speziell für Karosserie und Interieur)
  useMaterialNameInsteadOfMeshName: true,
  scale: 0.24, // Korrekte Skalierung für das Modell
  // Position-Eigenschaft entfernt, um automatische Zentrierung zu nutzen
  rotation: {
    x: 0,
    y: Math.PI, // 180 Grad in Radiant, damit das Fahrzeug in die richtige Richtung zeigt
    z: 0
  },
  cameraPosition: {
    x: 0,
    y: 1.5,
    z: 5
  }
};
