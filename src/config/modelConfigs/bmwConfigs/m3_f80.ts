import { CarConfig } from '../../../types/carConfig';

export const m3_f80Config: CarConfig = {
  modelFile: '/models/bmw/m3/m3_f80/m3_f80.gltf',
  materials: {
    body: "ARm4_body_ARm4_main_0",
    wheel: "ARm4_common_black",
    drl: "ARm4_runninglight",
    interiorMain: "ARm4_buckedseat_R_ARm4_color_interior_0",
    interiorSecondary: "ARm4_buckedseat_R_ARm4_INTER_tcz_0"
  },
  // Referenzwerte für das M3 F80-Modell (optimal dargestellt)
  scale: 1.0, // Standardskalierung
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