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
    }

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
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
          
          if (child.name === config.materials.body) {
            child.material.color.set(bodyColor)
          } 
          else if (child.name === config.materials.wheel) {
            child.material.color.set(wheelColor)
          } 
          else if (child.name.includes(config.materials.drl)) {
            const drlMaterial = new THREE.ShaderMaterial({
              uniforms: drlUniforms,
              vertexShader: drlVertexShader,
              fragmentShader: drlFragmentShader,
              transparent: true,
              blending: THREE.AdditiveBlending
            });
            child.material = drlMaterial;
          }
          else if (child.name === config.materials.interiorMain) {
            child.material.color.set(interiorMainColor)
          }
          else if (child.name === config.materials.interiorSecondary) {
            child.material.color.set(interiorSecondaryColor)
          }
        }
      })
    }
  }, [scene, bodyColor, wheelColor, drlColor, interiorMainColor, interiorSecondaryColor, isInitialRender, config, drlUniforms])

  useEffect(() => {
    if (groupRef.current) {
      const box = new THREE.Box3().setFromObject(groupRef.current)
      const center = box.getCenter(new THREE.Vector3())
      const size = box.getSize(new THREE.Vector3())

      // Reset the position
      groupRef.current.position.set(0, 0, 0)
      
      // Adjust the y-position to place the car on the ground
      groupRef.current.position.y = -box.min.y

      const fov = camera.fov * (Math.PI / 180)
      const distance = Math.abs(size.y / Math.sin(fov / 2)) * 1.5
      camera.position.set(distance, distance / 2, distance)
      camera.lookAt(new THREE.Vector3(0, size.y / 2, 0))
    }
  }, [scene, camera])

  return <group ref={groupRef}><primitive object={scene} /></group>
}