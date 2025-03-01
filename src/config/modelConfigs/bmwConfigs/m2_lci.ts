import { CarConfig } from '../../../types/carConfig';

export const m2_lciConfig: CarConfig = {
  modelFile: '/models/bmw/m2/m2_lci/m2_lci.gltf',
  materials: {
    // Vorläufige Materialnamen, die später angepasst werden müssen
    // Sobald Sie die genauen Namen kennen, ersetzen Sie diese
    body: "m8f92_CarPaint", // Vermuteter Name für die Karosserie
    wheel: "m8f92_SpecularTintA", // Vermuteter Name für die Räder
    drl: "m8f92_runninglight3", // Vermuteter Name für die Tagfahrlichter
    interiorMain: "m8f92_InteriorColourZone", // Vermuteter Name für das Hauptinterieur
    interiorSecondary: "m8f92_InteriorTillingColourZone", // Vermuteter Name für das sekundäre Interieur
    glass: "m8f92_glass" // Material für das Glas
  },
  // Spezielle Einstellung für das M2 LCI-Modell
  // Bei diesem Modell müssen wir nach Material-Namen statt nach Mesh-Namen suchen
  useMaterialNameInsteadOfMeshName: true,
  // Spezielle Farbe für das Glas (schwarz)
  initialGlassColor: "#000000",
  // Anpassungen für das M2 LCI-Modell, da es zu klein dargestellt wird
  scale: 1.0, // Größere Skalierung für das M2 LCI-Modell
  position: {
    x: 0,
    y: 0,
    z: 0
  },
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