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

const glowVertexShader = `
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  void main() 
  {
    vNormal = normalize( normalMatrix * normal );
    vPositionNormal = normalize( ( modelViewMatrix * vec4( position, 1.0 ) ).xyz );
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }
`

const glowFragmentShader = `
  uniform vec3 glowColor;
  uniform float intensity;
  varying vec3 vNormal;
  varying vec3 vPositionNormal;
  void main() 
  {
    float a = pow( 0.7 - dot( vNormal, vPositionNormal ), 4.0 );
    gl_FragColor = vec4( glowColor, min(a * intensity, 1.0) );
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

  const glowUniforms = useMemo(() => {
    return {
      glowColor: { value: new THREE.Color(drlColor) },
      intensity: { value: 1.5 }
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
            // Create a new ShaderMaterial for the DRL
            const drlMaterial = new THREE.ShaderMaterial({
              uniforms: glowUniforms,
              vertexShader: glowVertexShader,
              fragmentShader: glowFragmentShader,
              side: THREE.FrontSide,
              blending: THREE.AdditiveBlending,
              transparent: true
            })
            
            // Apply the new material to the DRL mesh
            child.material = drlMaterial
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
  }, [scene, bodyColor, wheelColor, drlColor, interiorMainColor, interiorSecondaryColor, isInitialRender, config, glowUniforms])

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