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

    // DEBUG: Ausgabe aller Materialnamen für das A45 AMG-Modell
    console.log("Verfügbare Materialnamen im Modell:");
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log(`Mesh Name: ${child.name}`);
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat, index) => {
              console.log(`  Material ${index}: ${mat.name}`);
            });
          } else {
            console.log(`  Material: ${child.material.name}`);
          }
        }
      }
    });

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // Unterschiedliche Logik je nach Modell-Konfiguration
        if (config.useMaterialNameInsteadOfMeshName && child.material && !Array.isArray(child.material)) {
          // Suche nach Material-Namen (speziell für m2_lci)
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
            // Wenn initialGlassColor definiert ist, setze die Glasfarbe sofort
            if (config.initialGlassColor) {
              child.material.color.set(config.initialGlassColor);
            }
          }
        } else {
          // Standard-Logik: Suche nach Mesh-Namen
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
            // Wenn initialGlassColor definiert ist, setze die Glasfarbe sofort
            if (config.initialGlassColor) {
              child.material.color.set(config.initialGlassColor);
            }
          }
        }
      }
    })

    setOriginalColors(originalColors)
    setIsInitialRender(false)
  }, [scene, setOriginalColors, config])

  useEffect(() => {
    if (!isInitialRender) {
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.needsUpdate = true
          
          // Bedingungsvariablen für klarere Logik
          const isDrlMesh = config.drlConfig && config.drlConfig.meshFilter.includes(child.name);
          const isStandardDrl = !config.drlConfig && child.name.includes(config.materials.drl);
          
          // Erweiterte Bedingung für Felgen, um auch wheelConfig zu berücksichtigen
          const isWheelByMeshName = config.materials.wheel && 
                                     (child.name === config.materials.wheel || 
                                     (config.wheelConfig && 
                                      (child.name.includes(config.wheelConfig.materialName) || 
                                       child.name === config.wheelConfig.materialName)) ||
                                     child.name.includes(config.materials.wheel));
                                     
          const isGlassByMeshName = config.materials.glass && child.name === config.materials.glass;
          
          // Debug-Ausgabe für Räder
          if (isWheelByMeshName) {
            console.log(`Felgen-Mesh gefunden: ${child.name}`);
            if (child.material) {
              console.log(`Material der Felge: ${Array.isArray(child.material) ? 'Array von Materialien' : child.material.name}`);
            }
          }
          
          // Debug-Ausgabe für Glas
          if (isGlassByMeshName) {
            console.log(`Glas-Mesh gefunden: ${child.name}`);
            if (child.material) {
              console.log(`Material des Glases: ${Array.isArray(child.material) ? 'Array von Materialien' : child.material.name}`);
            }
          }
          
          // Spezielle DRL-Konfiguration für Modelle mit bestimmten Filter-Einstellungen
          if (isDrlMesh) {
            const drlMaterial = new THREE.ShaderMaterial({
              uniforms: drlUniforms,
              vertexShader: drlVertexShader,
              fragmentShader: drlFragmentShader,
              transparent: true,
              blending: THREE.AdditiveBlending
            });
            child.material = drlMaterial;
          } 
          // Standard-DRL-Logik für Modelle ohne spezielle drlConfig
          else if (isStandardDrl) {
            const drlMaterial = new THREE.ShaderMaterial({
              uniforms: drlUniforms,
              vertexShader: drlVertexShader,
              fragmentShader: drlFragmentShader,
              transparent: true,
              blending: THREE.AdditiveBlending
            });
            child.material = drlMaterial;
          }
          // Spezielle Behandlung für die Sitze (Object_42) - Material-Klonen für isolierte Farbänderung
          else if (child.name === "Object_42") {
            // Wir erstellen für die Sitze ein eigenes Material, das vom Original isoliert ist
            if (child.material) {
              if (Array.isArray(child.material)) {
                // Bei einem Array von Materialien klonen wir jedes Material
                child.material = child.material.map(mat => {
                  const clonedMat = mat.clone();
                  clonedMat.name = mat.name + "_seat_clone";
                  clonedMat.color.set(interiorMainColor);
                  console.log(`Geklontes Sitzmaterial erstellt und gefärbt: ${clonedMat.name}`);
                  return clonedMat;
                });
              } else {
                // Bei einem einzelnen Material klonen wir es
                const originalMat = child.material;
                const clonedMat = originalMat.clone();
                clonedMat.name = originalMat.name + "_seat_clone";
                clonedMat.color.set(interiorMainColor);
                child.material = clonedMat;
                console.log(`Geklontes Sitzmaterial erstellt und gefärbt: ${clonedMat.name} für Mesh ${child.name}`);
              }
            }
          }
          // Direkter Zugriff auf Felgen durch Mesh-Namen - höhere Priorität als andere Methoden
          else if (isWheelByMeshName) {
            if (child.material) {
              // Spezielle Behandlung für Felgen mit wheelConfig
              if (config.wheelConfig && (child.name.includes(config.wheelConfig.materialName) || child.name === config.wheelConfig.materialName)) {
                console.log(`Spezielle Felge gefunden (wheelConfig): ${child.name}`);
                
                // Wenn requiresCloning aktiviert ist, erstellen wir Klone der Materialien
                if (config.wheelConfig.requiresCloning) {
                  // Bei einem Array von Materialien
                  if (Array.isArray(child.material)) {
                    // Für jeden Mesh der Felge erstellen wir Klone aller Materialien
                    child.material = child.material.map(mat => {
                      // Erstelle ein neues Material, das vom Original isoliert ist
                      const clonedMat = mat.clone();
                      clonedMat.name = `${mat.name}_wheel_clone`;
                      clonedMat.color.set(wheelColor);
                      return clonedMat;
                    });
                    console.log(`Felgenfarbe gesetzt (Array von Materialien, geklont) für Felge: ${child.name}`);
                  } 
                  // Bei einem einzelnen Material
                  else {
                    // Erstelle ein neues Material, das vom Original isoliert ist
                    const clonedMat = child.material.clone();
                    clonedMat.name = `${child.material.name}_wheel_clone`;
                    clonedMat.color.set(wheelColor);
                    child.material = clonedMat;
                    console.log(`Felgenfarbe gesetzt (geklont) für Felge: ${child.name}, Material: ${clonedMat.name}`);
                  }
                }
                // Wenn kein Klonen erforderlich ist, setzen wir die Farbe direkt
                else {
                  if (Array.isArray(child.material)) {
                    child.material.forEach(mat => {
                      mat.color.set(wheelColor);
                    });
                    console.log(`Felgenfarbe gesetzt (Array von Materialien) für spezielle Felge: ${child.name}`);
                  } else {
                    child.material.color.set(wheelColor);
                    console.log(`Felgenfarbe gesetzt für spezielle Felge: ${child.name}, Material: ${child.material.name}`);
                  }
                }
              }
              // Standard-Behandlung für andere Felgen
              else {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    mat.color.set(wheelColor);
                  });
                  console.log(`Felgenfarbe gesetzt (Array von Materialien) für Mesh: ${child.name}`);
                } else {
                  child.material.color.set(wheelColor);
                  console.log(`Felgenfarbe gesetzt für Mesh: ${child.name}, Material: ${child.material.name}`);
                }
              }
            }
          }
          // Direkter Zugriff auf Glas durch Mesh-Namen
          else if (isGlassByMeshName) {
            if (child.material) {
              const glassColor = config.initialGlassColor || '#000000'; // Schwarz als Standardfarbe für Glas
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  mat.color.set(glassColor);
                  mat.transparent = true;
                  mat.opacity = 0.7; // Leichte Transparenz für Glas
                });
                console.log(`Glasfarbe gesetzt (Array von Materialien) für Mesh: ${child.name}`);
              } else {
                child.material.color.set(glassColor);
                child.material.transparent = true;
                child.material.opacity = 0.7; // Leichte Transparenz für Glas
                console.log(`Glasfarbe gesetzt für Mesh: ${child.name}, Material: ${child.material.name}`);
              }
            }
          }
          // Andere Material-Zuweisungen
          else if (config.useMaterialNameInsteadOfMeshName && child.material && !Array.isArray(child.material)) {
            const materialName = child.material.name;
            
            // Prüfen, ob das Material das Body-Material ist
            if (materialName === config.materials.body) {
              child.material.color.set(bodyColor);
              console.log(`Karosseriefarbe gesetzt für Material: ${materialName}`);
            } 
            // Prüfen, ob das Material das Wheel-Material ist
            else if (materialName === config.materials.wheel) {
              child.material.color.set(wheelColor);
              console.log(`Felgenfarbe gesetzt für Material: ${materialName}`);
            } 
            // Prüfen, ob das Material in der interiorMain-Liste ist (falls interiorMain ein Array ist)
            else if (Array.isArray(config.materials.interiorMain) && config.materials.interiorMain.includes(materialName)) {
              child.material.color.set(interiorMainColor);
              console.log(`Interior-Hauptfarbe gesetzt für Material: ${materialName}`);
            }
            // Prüfen, ob das Material das interiorMain-Material ist (falls interiorMain ein String ist)
            else if (!Array.isArray(config.materials.interiorMain) && materialName === config.materials.interiorMain) {
              child.material.color.set(interiorMainColor);
              console.log(`Interior-Hauptfarbe gesetzt für Material: ${materialName}`);
            }
            // Prüfen, ob das Material das interiorSecondary-Material ist
            else if (materialName === config.materials.interiorSecondary) {
              child.material.color.set(interiorSecondaryColor);
              console.log(`Interior-Sekundärfarbe gesetzt für Material: ${materialName}`);
            }
            // Prüfen, ob das Material das Glass-Material ist
            else if (config.materials.glass && materialName === config.materials.glass) {
              // Verwende initialGlassColor falls vorhanden, sonst Schwarz
              const glassColor = config.initialGlassColor || '#000000';
              child.material.color.set(glassColor);
              console.log(`Glasfarbe gesetzt auf ${glassColor} für Material: ${materialName}`);
            }
          } else {
            // Standard-Logik: Suche nach Mesh-Namen (außer für DRL, die werden oben behandelt)
            if (child.name === config.materials.body) {
              child.material.color.set(bodyColor)
            } 
            // Wheel wird oben mit höherer Priorität behandelt
            else if (Array.isArray(config.materials.interiorMain) && config.materials.interiorMain.includes(child.name)) {
              child.material.color.set(interiorMainColor)
            }
            else if (!Array.isArray(config.materials.interiorMain) && child.name === config.materials.interiorMain) {
              child.material.color.set(interiorMainColor)
            }
            else if (child.name === config.materials.interiorSecondary) {
              child.material.color.set(interiorSecondaryColor)
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
      // Modellspezifische Skalierung anwenden
      if (config.scale) {
        groupRef.current.scale.set(config.scale, config.scale, config.scale);
      }

      // Modellspezifische Position anwenden
      if (config.position) {
        const { x, y, z } = config.position;
        groupRef.current.position.set(x, y, z);
      }

      // Modellspezifische Rotation anwenden
      if (config.rotation) {
        const { x, y, z } = config.rotation;
        groupRef.current.rotation.set(
          x * (Math.PI / 180), 
          y * (Math.PI / 180), 
          z * (Math.PI / 180)
        );
      }

      const box = new THREE.Box3().setFromObject(groupRef.current)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      // Zentriere das Modell horizontal, aber lass es auf dem Boden
      // Nur anwenden, wenn keine spezifische Position definiert ist
      if (!config.position) {
        groupRef.current.position.set(-center.x, -box.min.y, -center.z)
      }

      // Berechne die optimale Kameraposition
      const fov = camera.fov * (Math.PI / 180)
      const maxDim = Math.max(size.x, size.y, size.z)
      const distance = Math.abs(maxDim / Math.sin(fov / 2)) * 1.2

      // Setze die Kamera auf eine Position, die das gesamte Modell zeigt
      // Nur anwenden, wenn keine spezifische Kameraposition definiert ist
      if (!config.cameraPosition) {
        camera.position.set(distance * 0.8, distance * 0.4, distance * 0.8)
        camera.lookAt(new THREE.Vector3(0, size.y / 4, 0))
      } else {
        const { x, y, z } = config.cameraPosition;
        camera.position.set(x, y, z);
        camera.lookAt(new THREE.Vector3(0, size.y / 4, 0))
      }
      
      camera.updateProjectionMatrix()

      // Optimiere die Geometrie
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