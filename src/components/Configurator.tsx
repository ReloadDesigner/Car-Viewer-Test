'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, ACESFilmicToneMapping } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Palette, Car, SunDim } from 'lucide-react'
import * as THREE from 'three'
import CarModel from './CarModel'
import Dropdown from './Dropdown'
import ColorPicker from './ColorPicker'
import ConfigSection from './ConfigSection'
import { CarConfig, ModelConfig } from '../types/carConfig'
import { m3_f80Config } from '../config/modelConfigs/bmwConfigs/m3_f80'

const carBrands = ['BMW', 'Audi', 'Mercedes']

const carModels = {
  BMW: ['M3', 'M4', 'X5'],
  Audi: ['A4', 'A6', 'Q5'],
  Mercedes: ['C-Class', 'E-Class', 'GLC'],
}

const carConfigs: ModelConfig = {
  'BMW_M3': m3_f80Config,
  'BMW_M4': m3_f80Config, // Temporär das gleiche Modell für M4
  'BMW_X5': m3_f80Config, // Temporär das gleiche Modell für X5
  'Audi_A4': m3_f80Config, // Temporär das gleiche Modell für A4
  'Audi_A6': m3_f80Config, // Temporär das gleiche Modell für A6
  'Audi_Q5': m3_f80Config, // Temporär das gleiche Modell für Q5
  'Mercedes_C-Class': m3_f80Config, // Temporär das gleiche Modell für C-Class
  'Mercedes_E-Class': m3_f80Config, // Temporär das gleiche Modell für E-Class
  'Mercedes_GLC': m3_f80Config, // Temporär das gleiche Modell für GLC
}

const drlColors = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#00FF00' },
]

const environmentPresets = [
  { name: 'Studio', value: 'studio' },
  { name: 'Sunset', value: 'sunset' },
  { name: 'Dawn', value: 'dawn' },
  { name: 'Night', value: 'night' },
  { name: 'Warehouse', value: 'warehouse' },
  { name: 'City', value: 'city' },
] as const;

export default function Configurator() {
  const [selectedBrand, setSelectedBrand] = useState(carBrands[0])
  const [selectedModel, setSelectedModel] = useState(carModels[carBrands[0]][0])
  const [carConfig, setCarConfig] = useState<CarConfig>(carConfigs[`${carBrands[0]}_${carModels[carBrands[0]][0]}`])
  const [originalColors, setOriginalColors] = useState({
    body: null,
    wheel: null,
    drl: '#FFFFFF',
    interiorMain: null,
    interiorSecondary: null
  })
  const [bodyColor, setBodyColor] = useState<string | null>(null)
  const [wheelColor, setWheelColor] = useState<string | null>(null)
  const [drlColor, setDrlColor] = useState('#FFFFFF')
  const [interiorMainColor, setInteriorMainColor] = useState<string | null>(null)
  const [interiorSecondaryColor, setInteriorSecondaryColor] = useState<string | null>(null)
  const [showConfigurator, setShowConfigurator] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState<typeof environmentPresets[number]['value']>('warehouse')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const configKey = `${selectedBrand}_${selectedModel}` as keyof typeof carConfigs
    setCarConfig(carConfigs[configKey] || carConfigs['BMW_M3'])
  }, [selectedBrand, selectedModel])

  useEffect(() => {
    setBodyColor(originalColors.body)
    setWheelColor(originalColors.wheel)
    setDrlColor('#FFFFFF')
    setInteriorMainColor(originalColors.interiorMain)
    setInteriorSecondaryColor(originalColors.interiorSecondary)
  }, [originalColors])

  const handleCustomColor = (setColor: (color: string) => void) => {
    const input = document.createElement('input')
    input.type = 'color'
    input.oninput = (e) => setColor((e.target as HTMLInputElement).value)
    input.click()
  }

  const resetColors = () => {
    setBodyColor(originalColors.body)
    setWheelColor(originalColors.wheel)
    setDrlColor('#FFFFFF')
    setInteriorMainColor(originalColors.interiorMain)
    setInteriorSecondaryColor(originalColors.interiorSecondary)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <nav className="bg-black bg-opacity-80 backdrop-blur-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-white text-2xl font-bold">DRLs Direct Configurator</h1>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Dropdown
            options={carBrands}
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value)
              setSelectedModel(carModels[e.target.value as keyof typeof carModels][0])
            }}
            label="Brand"
            className="w-full md:w-40"
          />
          <Dropdown
            options={carModels[selectedBrand as keyof typeof carModels]}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            label="Model"
            className="w-full md:w-40"
          />
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow relative flex">
        {/* 3D Viewer */}
        <div className="flex-grow relative">
          <Canvas 
            shadows 
            camera={{ position: [5, 2, 5], fov: 50 }}
            gl={{ 
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.6
            }}
          >
            <color attach="background" args={['#111']} />
            <fog attach="fog" args={['#111', 10, 20]} />
            <Suspense fallback={null}>
              <CarModel
                config={carConfig}
                bodyColor={bodyColor ?? originalColors.body ?? '#CCCCCC'}
                wheelColor={wheelColor ?? originalColors.wheel ?? '#333333'}
                drlColor={drlColor}
                interiorMainColor={interiorMainColor ?? originalColors.interiorMain ?? '#000000'}
                interiorSecondaryColor={interiorSecondaryColor ?? originalColors.interiorSecondary ?? '#333333'}
                setOriginalColors={setOriginalColors}
              />
              <Environment 
                preset={selectedEnvironment}
                background={false}
              />
              <ContactShadows 
                rotation-x={Math.PI / 2}
                position={[0, -0.0001, 0]}
                opacity={0.8}
                width={10}
                height={10}
                blur={1}
                far={10}
              />
              <OrbitControls 
                enablePan={false} 
                enableZoom={true} 
                minPolarAngle={Math.PI / 6} 
                maxPolarAngle={Math.PI / 2}
                minDistance={2}
                maxDistance={10}
              />
            </Suspense>
          </Canvas>

          {/* Floating Action Buttons */}
          <div className="absolute bottom-4 left-4 flex flex-col md:flex-row gap-2">
            <button
              onClick={() => setShowConfigurator(!showConfigurator)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm flex items-center gap-2"
            >
              <Palette size={18} />
              <span className="hidden md:inline">
                {showConfigurator ? 'Hide Configurator' : 'Show Configurator'}
              </span>
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              onClick={() => {
                const canvas = document.querySelector('canvas')
                if (canvas) {
                  // Erstelle einen temporären Link zum Herunterladen
                  const link = document.createElement('a')
                  link.download = `${selectedBrand}_${selectedModel}_config.png`
                  link.href = canvas.toDataURL('image/png')
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                }
              }}
            >
              <Camera size={18} />
              <span className="hidden md:inline">Screenshot</span>
            </button>
          </div>
        </div>

        {/* Configurator Panel */}
        <AnimatePresence>
          {showConfigurator && (
            <motion.div
              initial={isMobile ? { y: '100%' } : { x: '100%' }}
              animate={isMobile ? { y: 0 } : { x: 0 }}
              exit={isMobile ? { y: '100%' } : { x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className={`
                absolute ${isMobile ? 'bottom-0 left-0 right-0 h-[70vh]' : 'top-0 right-0 h-full w-80'} 
                bg-black/75 backdrop-blur-md p-6 overflow-y-auto
                border-t-2 md:border-l-2 md:border-t-0 border-white/10
              `}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-white text-xl font-bold">Configuration</h2>
                  <button
                    onClick={resetColors}
                    className="text-white hover:text-red-500 transition-colors"
                    title="Reset Colors"
                  >
                    <Palette size={20} />
                  </button>
                </div>

                {/* Environment Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-sm flex items-center gap-2">
                      <SunDim size={16} />
                      Umgebungslicht
                    </span>
                  </div>
                  <select
                    value={selectedEnvironment}
                    onChange={(e) => setSelectedEnvironment(e.target.value as typeof selectedEnvironment)}
                    className="w-full bg-gray-800 text-white text-sm py-1 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10"
                    style={{
                      background: '#1a1a1a',
                      colorScheme: 'dark'
                    }}
                  >
                    {environmentPresets.map((preset) => (
                      <option 
                        key={preset.value} 
                        value={preset.value}
                        style={{
                          background: '#1a1a1a',
                          color: '#ffffff'
                        }}
                      >
                        {preset.name}
                      </option>
                    ))}
                  </select>
                </div>

                <ConfigSection title="Body" icon={Car}>
                  <ColorPicker
                    colors={[
                      { hex: originalColors.body || '#CCCCCC' },
                      { hex: '#FFFFFF' },
                      { hex: '#FF0000' },
                      { hex: '#0000FF' },
                      { hex: '#00FF00' },
                    ]}
                    selectedColor={bodyColor || originalColors.body || '#CCCCCC'}
                    onChange={setBodyColor}
                    onCustomColor={() => handleCustomColor(setBodyColor)}
                  />
                </ConfigSection>

                <ConfigSection title="Wheels" icon={Car}>
                  <ColorPicker
                    colors={[
                      { hex: originalColors.wheel || '#333333' },
                      { hex: '#FFFFFF' },
                      { hex: '#FFD700' },
                      { hex: '#00FF00' },
                    ]}
                    selectedColor={wheelColor || originalColors.wheel || '#333333'}
                    onChange={setWheelColor}
                    onCustomColor={() => handleCustomColor(setWheelColor)}
                  />
                </ConfigSection>

                <ConfigSection title="DRL" icon={Palette}>
                  <ColorPicker
                    colors={drlColors}
                    selectedColor={drlColor}
                    onChange={setDrlColor}
                    onCustomColor={() => handleCustomColor(setDrlColor)}
                  />
                </ConfigSection>

                <ConfigSection title="Interior Main Color" icon={Car}>
                  <ColorPicker
                    colors={[
                      { hex: originalColors.interiorMain || '#000000' },
                      { hex: '#FF0000' },
                      { hex: '#FFFFFF' },
                      { hex: '#8B4513' },
                      { hex: '#808080' },
                      { hex: '#00FF00' },
                    ]}
                    selectedColor={interiorMainColor || originalColors.interiorMain || '#000000'}
                    onChange={setInteriorMainColor}
                    onCustomColor={() => handleCustomColor(setInteriorMainColor)}
                  />
                </ConfigSection>

                <ConfigSection title="Interior Secondary Color" icon={Car}>
                  <ColorPicker
                    colors={[
                      { hex: originalColors.interiorSecondary || '#333333' },
                      { hex: '#000000' },
                      { hex: '#FFFFFF' },
                      { hex: '#8B4513' },
                      { hex: '#00FF00' },
                    ]}
                    selectedColor={interiorSecondaryColor || originalColors.interiorSecondary || '#333333'}
                    onChange={setInteriorSecondaryColor}
                    onCustomColor={() => handleCustomColor(setInteriorSecondaryColor)}
                  />
                </ConfigSection>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}