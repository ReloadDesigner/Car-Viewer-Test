import { CarConfig } from '../../../types/carConfig';

export const a45_amgConfig: CarConfig = {
  modelFile: '/models/mercedes/a-class/a45_amg/a45_amg.gltf',
  materials: {
    body: "Material2", // Platzhalter - muss mit dem tatsächlichen Materialnamen aktualisiert werden
    wheel: "a45_amg_wheel", // Platzhalter - muss mit dem tatsächlichen Materialnamen aktualisiert werden
    drl: "Material3", // Platzhalter - muss mit dem tatsächlichen Materialnamen aktualisiert werden
    interiorMain: "a45_amg_interior_main", // Platzhalter - muss mit dem tatsächlichen Materialnamen aktualisiert werden
    interiorSecondary: "a45_amg_interior_secondary" // Platzhalter - muss mit dem tatsächlichen Materialnamen aktualisiert werden
  },
  // Anpassungen für das A45 AMG-Modell
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