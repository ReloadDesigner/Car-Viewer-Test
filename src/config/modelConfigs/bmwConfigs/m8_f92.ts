import { CarConfig } from '../../../types/carConfig';

export const m8_f92Config: CarConfig = {
  modelFile: '/models/bmw/8series/m8/m8_f92/m8_f92.gltf',
  materials: {
    // Vorläufige Materialnamen, die später angepasst werden müssen
    // Sobald Sie die genauen Namen kennen, ersetzen Sie diese
    body: "m8f92_CarPaint", // Vermuteter Name für die Karosserie
    wheel: "m8f92_SpecularTintA", // Vermuteter Name für die Räder
    drl: "m8f92_runninglight3", // Vermuteter Name für die Tagfahrlichter
    interiorMain: ["m8f92_InteriorColourZone", "m8f92_InteriorColor2"], // Beide Interior-Materialien, die gefärbt werden sollen
    interiorSecondary: "m8f92_InteriorTillingColourZone", // Vermuteter Name für das sekundäre Interieur
    glass: "m8f92_glass" // Material für das Glas
  },
  // Spezielle Einstellung für das M8 Modell
  // Bei diesem Modell müssen wir nach Material-Namen statt nach Mesh-Namen suchen
  useMaterialNameInsteadOfMeshName: true,
  // Spezielle Farbe für das Glas (schwarz)
  initialGlassColor: "#000000",
  // Anpassungen für das M8 Modell, da es zu klein dargestellt wird
  scale: 1.0, // Größere Skalierung für das M8 Modell
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