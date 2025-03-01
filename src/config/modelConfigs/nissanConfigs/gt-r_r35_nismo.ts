import { CarConfig } from '../../../types/carConfig';

export const gtrR35NismoConfig: CarConfig = {
  modelFile: '/models/nissan/gt-r/r35/nismo/gt-r_r35_nismo.gltf',
  materials: {
    // Vorläufige Materialnamen, die später angepasst werden müssen
    body: "body", // Vermuteter Name für die Karosserie
    wheel: "gtr_r35_wheel", // Vermuteter Name für die Räder
    drl: "Object_65", // Vermuteter Name für die Tagfahrlichter
    interiorMain: "gtr_r35_interior_main", // Vermuteter Name für das Hauptinterieur
    interiorSecondary: "gtr_r35_interior_secondary" // Vermuteter Name für das sekundäre Interieur
  },
  // Referenzwerte für das GT-R R35 Nismo-Modell
  scale: 0.01,
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
