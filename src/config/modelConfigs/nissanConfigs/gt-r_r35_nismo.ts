import { CarConfig } from '../../../types/carConfig';

export const gtrR35NismoConfig: CarConfig = {
  modelFile: '/models/nissan/gt-r/r35/nismo/gt-r_r35_nismo.gltf',
  // Debug aktivieren, um alle Mesh- und Materialnamen auszugeben
  debug: true,
  materials: {
    body: "Object_23", // Karosserie-Material
    wheel: "Object_64", // Räder-Material
    drl: "Object_5", // DRL Mesh-Name (wird in diesem Fall nicht direkt verwendet, aber für Kompatibilität beibehalten)
    interiorMain: "material", // Interior Haupt-Material
    interiorSecondary: "Object_4", // Interior Sekundär-Material
    glass: "Object_10" // Glas-Material (für Scheiben)
  },
  // Feste schwarze Farbe für das Glas
  initialGlassColor: "#000000",
  // Spezielle Konfiguration für das DRL beim GT-R
  // Nur die folgenden Meshes sollen als Tagfahrlichter gefärbt werden
  drlConfig: {
    meshFilter: ["Object_5"], // Nur Object_5 (Frontscheinwerfer) als DRL behandeln
    materialName: "material_11" // Nicht mehr verwendet in der neuen Implementierung, aber für Referenz behalten
  },
  // Anpassungen für das GT-R Modell
  scale: 0.01, // Kleinere Skalierung für das GT-R Modell
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
