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
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
      if (window.innerWidth <= 768) {
        setShowConfigurator(false)
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (!showConfigurator) {
      setShowCustomColorPicker(false)
    }
  }, [showConfigurator])

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
    setShowCustomColorPicker(true)
  }

  const resetColors = () => {
    setBodyColor(originalColors.body)
    setWheelColor(originalColors.wheel)
    setDrlColor('#FFFFFF')
    setInteriorMainColor(originalColors.interiorMain)
    setInteriorSecondaryColor(originalColors.interiorSecondary)
  }

  const captureScreenshot = async () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      // Warte einen Frame, um sicherzustellen, dass der aktuelle Render abgeschlossen ist
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      // Erstelle ein temporäres Canvas in der gleichen Größe
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      // Setze die gleiche Größe wie das Original-Canvas
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      // Zeichne das Original-Canvas auf das temporäre Canvas
      if (ctx) {
        ctx.drawImage(canvas, 0, 0);
        
        // Erstelle den Download mit dem temporären Canvas
        const link = document.createElement('a');
        link.download = `${selectedBrand}_${selectedModel}_config.png`;
        link.href = tempCanvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <nav className="bg-black bg-opacity-80 backdrop-blur-sm p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-10">
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
      <div className="relative flex-1 flex">
        {/* 3D Viewer */}
        <div className="absolute inset-0">
          <Canvas 
            shadows 
            camera={{ position: [5, 2, 5], fov: isMobile ? 65 : 50 }}
            gl={{ 
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 0.6,
              antialias: true,
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              touchAction: 'none'
            }}
          >
            <color attach="background" args={['#111']} />
            <fog attach="fog" args={['#111', isMobile ? 5 : 10, isMobile ? 15 : 20]} />
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
                width={isMobile ? 5 : 10}
                height={isMobile ? 5 : 10}
                blur={isMobile ? 0.5 : 1}
                far={isMobile ? 5 : 10}
              />
              <OrbitControls 
                enablePan={false} 
                enableZoom={true} 
                minPolarAngle={Math.PI / 6} 
                maxPolarAngle={Math.PI / 2}
                minDistance={isMobile ? 4 : 2}
                maxDistance={isMobile ? 8 : 10}
                enableDamping={true}
                dampingFactor={0.05}
                rotateSpeed={isMobile ? 0.7 : 1}
                zoomSpeed={isMobile ? 0.7 : 1}
                target={new THREE.Vector3(0, 1, 0)}
              />
            </Suspense>
          </Canvas>

          {/* Floating Action Buttons */}
          <div className={`
            fixed z-20 flex gap-2
            ${isMobile 
              ? 'bottom-4 left-1/2 -translate-x-1/2 flex-row' 
              : 'bottom-4 left-4 flex-col md:flex-row'
            }
            ${showCustomColorPicker && isMobile && !showConfigurator ? 'hidden' : ''}
          `}>
            <button
              onClick={() => setShowConfigurator(!showConfigurator)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-sm flex items-center gap-2 shadow-lg"
            >
              <Palette size={20} />
              <span className={isMobile ? 'hidden' : 'hidden md:inline'}>
                {showConfigurator ? 'Hide Configurator' : 'Show Configurator'}
              </span>
            </button>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg"
              onClick={captureScreenshot}
            >
              <Camera size={20} />
              <span className={isMobile ? 'hidden' : 'hidden md:inline'}>Screenshot</span>
            </button>
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
                  absolute 
                  ${isMobile 
                    ? 'bottom-0 left-0 right-0 h-[30vh] rounded-t-3xl' 
                    : 'top-0 right-0 h-full w-80'
                  } 
                  bg-black/75 backdrop-blur-md
                  border-t-2 md:border-l-2 md:border-t-0 border-white/10
                  flex flex-col
                `}
              >
                {/* Header Section */}
                <div className={`
                  flex-none border-b border-white/10
                  ${isMobile ? 'py-1.5 px-4' : 'p-4'}
                `}>
                  <div className="flex items-center justify-between">
                    <h2 className={`text-white ${isMobile ? 'text-base' : 'text-xl'} font-bold`}>Configuration</h2>
                    <button
                      onClick={resetColors}
                      className="text-white hover:text-red-500 transition-colors"
                      title="Reset Colors"
                    >
                      <Palette size={isMobile ? 16 : 20} />
                    </button>
                  </div>
                </div>

                {/* Scrollable Configuration Sections */}
                <div className={`
                  ${isMobile 
                    ? 'flex-1 overflow-x-auto overflow-y-hidden whitespace-nowrap scroll-smooth hide-scrollbar py-1' 
                    : 'flex-1 overflow-y-auto p-6'
                  }
                `}>
                  <div className={`
                    ${isMobile 
                      ? 'inline-flex gap-3 px-4' 
                      : 'space-y-6'
                    }
                  `}>
                    {/* Environment Section */}
                    <div className={`
                      ${isMobile 
                        ? 'min-w-[180px] bg-black/40 rounded-xl p-3' 
                        : 'space-y-2'
                      }
                    `}>
                      <div className="flex items-center gap-2 text-white mb-1.5">
                        <SunDim size={16} />
                        <span className="text-sm whitespace-nowrap">Environment Light</span>
                      </div>
                      <select
                        value={selectedEnvironment}
                        onChange={(e) => setSelectedEnvironment(e.target.value as typeof selectedEnvironment)}
                        className="w-full bg-black/60 text-white text-sm py-1.5 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10"
                        style={{ colorScheme: 'dark' }}
                      >
                        {environmentPresets.map((preset) => (
                          <option 
                            key={preset.value} 
                            value={preset.value}
                            className="bg-black text-white"
                          >
                            {preset.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Color Configuration Sections */}
                    <div className={`
                      ${isMobile 
                        ? 'min-w-[180px] bg-white/5 rounded-xl p-3' 
                        : ''
                      }
                    `}>
                      <ConfigSection title="Body" icon={Car}>
                        <ColorPicker
                          colors={[
                            { hex: originalColors.body || '#CCCCCC', name: 'Original' },
                            { hex: '#1C1C1C', name: 'Black Metallic' },
                            { hex: '#C0C0C0', name: 'Silver Metallic' },
                            { hex: '#8B0000', name: 'Red Metallic' },
                            { hex: '#000080', name: 'Blue Metallic' },
                            { hex: '#004225', name: 'Green Metallic' },
                          ]}
                          selectedColor={bodyColor || originalColors.body || '#CCCCCC'}
                          onChange={setBodyColor}
                          onCustomColor={() => handleCustomColor(setBodyColor)}
                          effect="metallic"
                        />
                      </ConfigSection>
                    </div>

                    <div className={`
                      ${isMobile 
                        ? 'min-w-[180px] bg-white/5 rounded-xl p-3' 
                        : ''
                      }
                    `}>
                      <ConfigSection title="Wheels" icon={Car}>
                        <ColorPicker
                          colors={[
                            { hex: originalColors.wheel || '#333333', name: 'Original' },
                            { hex: '#1C1C1C', name: 'Black Metallic' },
                            { hex: '#C0C0C0', name: 'Silver Metallic' },
                            { hex: '#FFD700', name: 'Gold Metallic' },
                          ]}
                          selectedColor={wheelColor || originalColors.wheel || '#333333'}
                          onChange={setWheelColor}
                          onCustomColor={() => handleCustomColor(setWheelColor)}
                          effect="metallic"
                        />
                      </ConfigSection>
                    </div>

                    <div className={`
                      ${isMobile 
                        ? 'min-w-[180px] bg-white/5 rounded-xl p-3' 
                        : ''
                      }
                    `}>
                      <ConfigSection title="DRL" icon={Palette}>
                        <ColorPicker
                          colors={[
                            { hex: '#FFFFFF', name: 'Crystal White' },
                            { hex: '#FFD700', name: 'Gold Yellow' },
                            { hex: '#FF7300', name: 'Amber' },
                            { hex: '#FF2D00', name: 'Signal Red' },
                            { hex: '#4169E1', name: 'Royal Blue' },
                            { hex: '#39FF14', name: 'Neon Green' },
                          ]}
                          selectedColor={drlColor}
                          onChange={setDrlColor}
                          onCustomColor={() => handleCustomColor(setDrlColor)}
                          effect="glow"
                        />
                      </ConfigSection>
                    </div>

                    <div className={`
                      ${isMobile 
                        ? 'min-w-[180px] bg-white/5 rounded-xl p-3' 
                        : ''
                      }
                    `}>
                      <ConfigSection title="Interior Primary" icon={Car}>
                        <ColorPicker
                          colors={[
                            { hex: '#2A0F0F', name: 'Dark Red' },
                            { hex: '#8B0000', name: 'Wine Red' },
                            { hex: '#F5F5F5', name: 'Light Grey' },
                            { hex: '#8B4513', name: 'Brown' },
                            { hex: '#1C1C1C', name: 'Black' },
                          ]}
                          selectedColor={interiorMainColor || originalColors.interiorMain || '#000000'}
                          onChange={setInteriorMainColor}
                          onCustomColor={() => handleCustomColor(setInteriorMainColor)}
                          effect="leather"
                        />
                      </ConfigSection>
                    </div>

                    <div className={`
                      ${isMobile 
                        ? 'min-w-[180px] bg-white/5 rounded-xl p-3' 
                        : ''
                      }
                    `}>
                      <ConfigSection title="Interior Secondary" icon={Car}>
                        <ColorPicker
                          colors={[
                            { hex: '#2A0F0F', name: 'Dark Red' },
                            { hex: '#F5F5F5', name: 'Light Grey' },
                            { hex: '#8B4513', name: 'Brown' },
                            { hex: '#1C1C1C', name: 'Black' },
                          ]}
                          selectedColor={interiorSecondaryColor || originalColors.interiorSecondary || '#333333'}
                          onChange={setInteriorSecondaryColor}
                          onCustomColor={() => handleCustomColor(setInteriorSecondaryColor)}
                          effect="leather"
                        />
                      </ConfigSection>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}