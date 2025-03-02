'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { CarConfig } from '../types/carConfig'

interface CarModelProps {
  config: CarConfig;
  bodyColor: string;
  wheelColor: string;
  drlColor: string;
  interiorMainColor: string;
  interiorSecondaryColor: string;
  setOriginalColors: (colors: {
    body: string | null;
    wheel: string | null;
    drl: string;
    interiorMain: string | null;
    interiorSecondary: string | null;
    glass: string | null;
  }) => void;
}

const drlVertexShader = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal = normalMatrix * normal;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const drlFragmentShader = `
  uniform vec3 baseColor;
  uniform float glowIntensity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
    
    // Basis-Leuchtfarbe ist die gewählte Farbe
    vec3 glowColor = baseColor;
    
    // Addiere einen subtilen weißen Glanz nur an den Kanten
    vec3 finalColor = glowColor + vec3(0.2) * fresnel * glowIntensity;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

export default function CarModel({
  config,
  bodyColor,
  wheelColor,
  drlColor,
  interiorMainColor,
  interiorSecondaryColor,
  setOriginalColors,
}: CarModelProps) {
  const { scene } = useGLTF(config.modelFile)
  const groupRef = useRef<THREE.Group>(null)
  const { camera } = useThree()
  const [isInitialRender, setIsInitialRender] = useState(true)
  const [modelLoaded, setModelLoaded] = useState(false);

  const drlUniforms = useMemo(() => {
    return {
      baseColor: { value: new THREE.Color(drlColor).multiplyScalar(1.5) },
      glowIntensity: { value: 0.5 }
    }
  }, [drlColor])

  useEffect(() => {
    let originalColors = {
      body: null,
      wheel: null,
      drl: '#FFFFFF',
      interiorMain: null,
      interiorSecondary: null,
      glass: null,
    }

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat, index) => {
            });
          } else {
          }
        }
      }
    });

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (config.useMaterialNameInsteadOfMeshName && child.material && !Array.isArray(child.material)) {
          if (child.material.name === config.materials.body) {
            originalColors.body = '#' + child.material.color.getHexString()
          } 
          else if (child.material.name === config.materials.wheel) {
            originalColors.wheel = '#' + child.material.color.getHexString()
          } 
          else if (Array.isArray(config.materials.interiorMain)) {
            if (config.materials.interiorMain.includes(child.material.name)) {
              originalColors.interiorMain = '#' + child.material.color.getHexString()
            }
          } else if (child.material.name === config.materials.interiorMain) {
            originalColors.interiorMain = '#' + child.material.color.getHexString()
          }
          else if (child.material.name === config.materials.interiorSecondary) {
            originalColors.interiorSecondary = '#' + child.material.color.getHexString()
          }
          else if (config.materials.glass && child.material.name === config.materials.glass) {
            originalColors.glass = '#' + child.material.color.getHexString()
            if (config.initialGlassColor) {
              child.material.color.set(config.initialGlassColor);
            }
          }
        } else {
          if (child.name === config.materials.body) {
            originalColors.body = '#' + child.material.color.getHexString()
          } 
          else if (child.name === config.materials.wheel) {
            originalColors.wheel = '#' + child.material.color.getHexString()
          } 
          else if (child.name === config.materials.interiorMain) {
            originalColors.interiorMain = '#' + child.material.color.getHexString()
          }
          else if (child.name === config.materials.interiorSecondary) {
            originalColors.interiorSecondary = '#' + child.material.color.getHexString()
          }
          else if (config.materials.glass && child.name === config.materials.glass) {
            originalColors.glass = '#' + child.material.color.getHexString()
            if (config.initialGlassColor) {
              child.material.color.set(config.initialGlassColor);
            }
          }
        }
      }
    })

    setOriginalColors(originalColors)
    setIsInitialRender(false)
    setModelLoaded(true);
  }, [scene, setOriginalColors, config])

  useEffect(() => {
    if (!isInitialRender) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.needsUpdate = true
          
          // DRL-Erkennung je nach Modell anpassen
          const isDrlMesh = config.drlConfig && (
            // Allgemeine Prüfung für alle Modelle - prüft, ob der Mesh im definierten meshFilter ist
            config.drlConfig.meshFilter.includes(child.name)
          );
          
          // Für Modelle ohne drlConfig
          const isStandardDrl = !config.drlConfig && (
            // Allgemeine Prüfung für alle Modelle
            child.name.includes(config.materials.drl)
          );
          
          const isWheelByMeshName = config.materials.wheel && 
                                     (child.name === config.materials.wheel || 
                                     (config.wheelConfig && 
                                      (child.name.includes(config.wheelConfig.materialName) || 
                                       child.name === config.wheelConfig.materialName ||
                                       (typeof config.wheelConfig.meshName === 'string' && 
                                        (child.name === config.wheelConfig.meshName || 
                                         child.name.includes(config.wheelConfig.meshName))) ||
                                       (Array.isArray(config.wheelConfig.meshName) && 
                                        config.wheelConfig.meshName.includes(child.name)) ||
                                       (config.wheelConfig.additionalMaterials && 
                                        config.wheelConfig.additionalMaterials.some(mat => 
                                          child.material && 
                                          !Array.isArray(child.material) && 
                                          child.material.name === mat))
                                      )) || 
                                     child.name.includes(config.materials.wheel));
          
          const isGlassByMaterial = config.materials.glass && 
            config.useMaterialNameInsteadOfMeshName && 
            child.material && 
            !Array.isArray(child.material) &&
            child.material.name === config.materials.glass;
          
          const isGlassByMeshName = config.materials.glass && child.name === config.materials.glass;
          
          if (isDrlMesh) {
            console.log(`DRL-Mesh gefunden: ${child.name} mit Material: ${child.material.name}, ID: ${child.id}`);
            
            let glowIntensity = 0.5;
            let baseColorMultiplier = 1.5;
            
            // Für den GT-R ein spezielles Setting
            if (config.modelFile.includes('gt-r_r35_nismo') && child.name === "Object_5") {
              glowIntensity = 0.8;
              baseColorMultiplier = 2.0;
            }
            
            // Angepasste Uniforms für den Shader
            const customUniforms = {
              baseColor: { value: new THREE.Color(drlColor).multiplyScalar(baseColorMultiplier) },
              glowIntensity: { value: glowIntensity }
            };
            
            const drlMaterial = new THREE.ShaderMaterial({
              uniforms: customUniforms,
              vertexShader: drlVertexShader,
              fragmentShader: drlFragmentShader,
              transparent: true,
              blending: THREE.AdditiveBlending
            });
            child.material = drlMaterial;
          } 
          else if (isStandardDrl) {
            console.log(`Standard-DRL gefunden: ${child.name} mit Material: ${child.material.name}`);
            
            const drlMaterial = new THREE.ShaderMaterial({
              uniforms: drlUniforms,
              vertexShader: drlVertexShader,
              fragmentShader: drlFragmentShader,
              transparent: true,
              blending: THREE.AdditiveBlending
            });
            child.material = drlMaterial;
          }
          else if (child.name === "Object_42") {
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material = child.material.map((mat) => {
                  const clonedMat = mat.clone();
                  clonedMat.name = mat.name + "_seat_clone";
                  clonedMat.color.set(interiorMainColor);
                  return clonedMat;
                });
              } else {
                const originalMat = child.material;
                const clonedMat = originalMat.clone();
                clonedMat.name = originalMat.name + "_seat_clone";
                clonedMat.color.set(interiorMainColor);
                child.material = clonedMat;
              }
            }
          }
          else if (isWheelByMeshName) {
            if (child.material) {
              if (config.wheelConfig && (child.name.includes(config.wheelConfig.materialName) || child.name === config.wheelConfig.materialName)) {
                if (config.wheelConfig.requiresCloning) {
                  if (Array.isArray(child.material)) {
                    child.material = child.material.map(mat => {
                      const clonedMat = mat.clone();
                      clonedMat.name = `${mat.name}_wheel_clone`;
                      clonedMat.color.set(wheelColor);
                      return clonedMat;
                    });
                  } 
                  else {
                    const clonedMat = child.material.clone();
                    clonedMat.name = `${child.material.name}_wheel_clone`;
                    clonedMat.color.set(wheelColor);
                    child.material = clonedMat;
                  }
                }
                else {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                      mat.color.set(wheelColor);
                    });
                  } else {
                    child.material.color.set(wheelColor);
                  }
                }
              }
              else {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    mat.color.set(wheelColor);
                  });
                } else {
                  child.material.color.set(wheelColor);
                }
              }
            }
          }
          else if (isGlassByMaterial || isGlassByMeshName) {
            if (child.material) {
              const glassColor = config.initialGlassColor || '#000000'; 
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.color.set(glassColor);
                  mat.transparent = true;
                  mat.opacity = 0.7; 
                });
              } else {
                child.material.color.set(glassColor);
                child.material.transparent = true;
                child.material.opacity = 0.7; 
              }
            }
          }
          else if (config.useMaterialNameInsteadOfMeshName && child.material && !Array.isArray(child.material)) {
            const materialName = child.material.name;
            
            if ((config.modelFile.includes('m4_f82') || config.modelFile.includes('m8_f92')) && 
                (materialName === config.materials.body || child.name === config.materials.body)) {
              // Lackierungswerte direkt setzen, ohne Material zu ersetzen
              child.material.metalness = 0.6;
              child.material.roughness = 0.39;
              child.material.clearcoat = 1.0;
              child.material.clearcoatRoughness = 0.04;
              child.material.needsUpdate = true;
              
              // Farbe setzen
              child.material.color.set(bodyColor);
              console.log(`BMW Lack verbessert für ${materialName}`);
            }
            else if (materialName === config.materials.body) {
              child.material.color.set(bodyColor);
            } 
            else if (materialName === config.materials.wheel) {
              child.material.color.set(wheelColor);
            } 
            else if (config.wheelConfig && config.wheelConfig.additionalMaterials && 
                     config.wheelConfig.additionalMaterials.includes(materialName)) {
              child.material.color.set(wheelColor);
              console.log(`Zusätzliches Rad-Material gefunden: ${materialName}`);
            }
            else if (Array.isArray(config.materials.interiorMain) && config.materials.interiorMain.includes(materialName)) {
              child.material.color.set(interiorMainColor);
            }
            else if (!Array.isArray(config.materials.interiorMain) && materialName === config.materials.interiorMain) {
              child.material.color.set(interiorMainColor);
            }
            else if (materialName === config.materials.interiorSecondary || 
                     (config.modelFile.includes('c63_amg') && materialName === 'Meshesperforation1Mtl')) {
              child.material.color.set(interiorSecondaryColor);
            }
            else if ((Array.isArray(config.materials.interiorMain) && config.materials.interiorMain.includes(materialName)) ||
                     (!Array.isArray(config.materials.interiorMain) && materialName === config.materials.interiorMain) || 
                     (config.modelFile.includes('c63_amg') && 
                      (materialName === 'Meshesleather0081Mtl' || 
                       materialName === 'Meshesleather0071Mtl' || 
                       materialName === 'Meshesleather0011Mtl' || 
                       materialName === 'Meshesleather0031Mtl'))) {
              child.material.color.set(interiorMainColor);
            }
            else if (materialName === config.materials.glass && config.materials.glass) {
              const glassColor = config.initialGlassColor || '#000000';
              child.material.color.set(glassColor);
            }
          } else {
            if ((config.modelFile.includes('m4_f82') || config.modelFile.includes('m8_f92')) && 
                child.name === config.materials.body && child.material && !Array.isArray(child.material)) {
              // Lackierungswerte direkt setzen, ohne Material zu ersetzen
              child.material.metalness = 0.6;
              child.material.roughness = 0.39;
              child.material.clearcoat = 1.0;
              child.material.clearcoatRoughness = 0.04;
              child.material.needsUpdate = true;
              
              // Farbe setzen
              child.material.color.set(bodyColor);
              console.log(`BMW Lack verbessert für ${child.name}`);
            }
            else if (child.name === config.materials.body) {
              child.material.color.set(bodyColor)
            } 
            else if (Array.isArray(config.materials.interiorMain) && config.materials.interiorMain.includes(child.name)) {
              child.material.color.set(interiorMainColor)
            }
            else if (!Array.isArray(config.materials.interiorMain) && child.name === config.materials.interiorMain) {
              child.material.color.set(interiorMainColor)
            }
            else if (child.name === config.materials.interiorSecondary ||
                     (config.modelFile.includes('c63_amg') && child.name === 'Object_58')) {
              child.material.color.set(interiorSecondaryColor)
            }
            else if (child.name === config.materials.interiorMain ||
                     (config.modelFile.includes('c63_amg') && 
                      (child.name === 'Object_51' || 
                       child.name === 'Object_50' || 
                       child.name === 'Object_44' || 
                       child.name === 'Object_46'))) {
              child.material.color.set(interiorMainColor)
            }
            else if (config.materials.glass && child.name === config.materials.glass) {
              const glassColor = config.initialGlassColor || '#000000';
              child.material.color.set(glassColor);
            }
          }
        }
      })
    }
  }, [scene, bodyColor, wheelColor, drlColor, interiorMainColor, interiorSecondaryColor, isInitialRender, config, drlUniforms])

  useEffect(() => {
    if (groupRef.current) {
      if (config.scale) {
        groupRef.current.scale.set(config.scale, config.scale, config.scale);
      }

      const box = new THREE.Box3().setFromObject(groupRef.current)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      // Immer erst die Bounding Box berechnen, bevor wir die Position setzen
      if (config.position) {
        const { x, y, z } = config.position;
        groupRef.current.position.set(x, y, z);
      } else {
        groupRef.current.position.set(-center.x, -box.min.y, -center.z)
      }

      if (config.rotation) {
        const { x, y, z } = config.rotation;
        groupRef.current.rotation.set(
          x * (Math.PI / 180), 
          y * (Math.PI / 180), 
          z * (Math.PI / 180)
        );
      }

      const fov = camera.fov * (Math.PI / 180)
      const maxDim = Math.max(size.x, size.y, size.z)
      const distance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.2

      if (!config.cameraPosition) {
        camera.position.set(distance * 0.8, distance * 0.4, distance * 0.8)
        camera.lookAt(new THREE.Vector3(0, size.y / 4, 0))
      } else {
        const { x, y, z } = config.cameraPosition;
        camera.position.set(x, y, z);
        camera.lookAt(new THREE.Vector3(0, size.y / 4, 0))
      }
      
      camera.updateProjectionMatrix()

      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) {
            child.geometry.computeBoundingSphere()
          }
          if (child.material) {
            child.material.side = THREE.FrontSide
          }
        }
      })
    }
  }, [scene, camera, config])

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  )
}