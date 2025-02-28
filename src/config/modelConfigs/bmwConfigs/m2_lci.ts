import { CarConfig } from '../../../types/carConfig';

export const m2_lciConfig: CarConfig = {
  modelFile: '/models/bmw/m2/m2_lci/m2_lci.gltf',
  materials: {
    // Vorläufige Materialnamen, die später angepasst werden müssen
    // Sobald Sie die genauen Namen kennen, ersetzen Sie diese
    body: "bBMW_M2Competition_2018Paint_Material1", // Vermuteter Name für die Karosserie
    wheel: "Wheel", // Vermuteter Name für die Räder
    drl: "DRL", // Vermuteter Name für die Tagfahrlichter
    interiorMain: "InteriorMain", // Vermuteter Name für das Hauptinterieur
    interiorSecondary: "InteriorSecondary" // Vermuteter Name für das sekundäre Interieur
  },
  // Anpassungen für das M2 LCI-Modell, da es zu klein dargestellt wird
  scale: 100.0, // Größere Skalierung für das M2 LCI-Modell
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