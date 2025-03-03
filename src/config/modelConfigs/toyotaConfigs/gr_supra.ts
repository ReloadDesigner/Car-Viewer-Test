import { CarConfig } from '../../../types/carConfig';

export const grSupraConfig: CarConfig = {
  modelFile: '/models/toyota/Supra/gr_supra/gr_supra.gltf',
  // Debug aktivieren, um alle Mesh- und Materialnamen zu identifizieren
  debug: true,
  useMaterialNameInsteadOfMeshName: true,
  materials: {
    // Material-Namen aus der GLTF-Datei
    body: "body.012", // Karosserie-Material (rote Farbe)
    wheel: "glossy_black.003", // Räder-Material
    drl: "headlight", // DRL Material-Name (emissive)
    interiorMain: "glossy_black.003", // Interior Haupt-Material
    interiorSecondary: "grillg", // Interior Sekundär-Material
    glass: "Glass.013" // Glas-Material (für Scheiben)
  },
  // Feste schwarze Farbe für das Glas
  initialGlassColor: "#000000",
  // Spezielle Konfiguration für das DRL beim GR Supra
  drlConfig: {
    materialName: "headlight", // Das Material des DRL-Elements
    meshFilter: ["Object_60"], // Mesh-Name für DRL basierend auf Debug-Ausgabe
    // Rendering-Optionen für bessere Sichtbarkeit
    renderOptions: {
      customRenderOrder: true,
      renderingPriority: 2
    }
  },
  // Anpassungen für das GR Supra Modell
  scale: 1.4, // Vorläufige Skalierung, kann angepasst werden
  position: {
    x: 0,
    y: 0,
    z: 0
  },
  rotation: {
    x: 0,
    y: 0, // Anpassbar je nach Modell-Ausrichtung
    z: 0
  },
  cameraPosition: {
    x: 0,
    y: 0.5,
    z: 3.0
  }
};
