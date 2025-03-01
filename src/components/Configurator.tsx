'use client'

import React, { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, ACESFilmicToneMapping } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { motion as motion3d } from 'framer-motion-3d'
import { Camera, Palette, Car, SunDim, PaintBucket, CircleDot, Lightbulb, Layers, Component, GripHorizontal, Baseline, RotateCw } from 'lucide-react'
import * as THREE from 'three'
import CarModel from './CarModel'
import Dropdown from './Dropdown'
import ColorPicker from './ColorPicker'
import ConfigSection from './ConfigSection'
import LoadButton from './LoadButton'
import { CarConfig, ModelConfig } from '../types/carConfig'
import { m4_f82Config } from '../config/modelConfigs/bmwConfigs/m4_f82'
import { m8_f92Config } from '../config/modelConfigs/bmwConfigs/m8_f92';
import { a45_amgConfig } from '../config/modelConfigs/mercedesConfigs/a-class_a45_amg';
import Image from 'next/image'

interface ConfiguratorProps {
  initialBrand: string;
  initialModel: string;
}

const carBrands = ['BMW', 'Audi', 'Mercedes']

const carModels = {
  BMW: ['8 Series/M8 (F9X)', '4 Series/M4 (F3X/F8X)', 'X5'],
  Audi: ['A4', 'A6', 'Q5'],
  Mercedes: ['A-Class (A45 AMG)', 'C-Class', 'E-Class', 'GLC'],
}

const carConfigs: ModelConfig = {
  'BMW_8 Series/M8 (F9X)': m8_f92Config,
  'BMW_4 Series/M4 (F3X/F8X)': m4_f82Config,
  'BMW_X5': m4_f82Config, // Temporär das gleiche Modell für X5
  'Audi_A4': m4_f82Config, // Temporär das gleiche Modell für A4
  'Audi_A6': m4_f82Config, // Temporär das gleiche Modell für A6
  'Audi_Q5': m4_f82Config, // Temporär das gleiche Modell für Q5
  'Mercedes_A-Class (A45 AMG)': a45_amgConfig,
  'Mercedes_C-Class': m4_f82Config, // Temporär das gleiche Modell für C-Class
  'Mercedes_E-Class': m4_f82Config, // Temporär das gleiche Modell für E-Class
  'Mercedes_GLC': m4_f82Config, // Temporär das gleiche Modell für GLC
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

// Camera Animation Component
function CameraAnimation() {
  const { camera } = useThree()
  const initialPos = useRef(new THREE.Vector3(15, 5, 15))
  const targetPos = useRef(new THREE.Vector3(5, 2, 5))
  const animationProgress = useRef(0)
  const isAnimating = useRef(true)

  useFrame((state, delta) => {
    if (isAnimating.current && animationProgress.current < 1) {
      animationProgress.current += delta * 0.3 // Langsamere Animation
      
      // Smooth easing
      const progress = 1 - Math.pow(1 - animationProgress.current, 4)
      
      camera.position.lerpVectors(
        initialPos.current,
        targetPos.current,
        progress
      )

      if (animationProgress.current >= 1) {
        isAnimating.current = false
      }
    }
  })

  return null
}

// Auto-Rotate Component
function AutoRotate({ 
  isEnabled,
  config,
  bodyColor,
  wheelColor,
  drlColor,
  interiorMainColor,
  interiorSecondaryColor,
  setOriginalColors
}: { 
  isEnabled: boolean;
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
}) {
  const { scene } = useThree()
  const rotationGroup = useRef<THREE.Group>()
  
  useEffect(() => {
    if (rotationGroup.current) {
      rotationGroup.current.position.set(0, 0, 0)
    }
  }, [])

  useFrame((state, delta) => {
    if (isEnabled && rotationGroup.current) {
      rotationGroup.current.rotation.y += delta * 0.25
    }
  })

  return (
    <group ref={rotationGroup}>
      <CarModel
        config={config}
        bodyColor={bodyColor}
        wheelColor={wheelColor}
        drlColor={drlColor}
        interiorMainColor={interiorMainColor}
        interiorSecondaryColor={interiorSecondaryColor}
        setOriginalColors={setOriginalColors}
      />
    </group>
  )
}

export default function Configurator({ initialBrand, initialModel }: ConfiguratorProps) {
  const [selectedBrand, setSelectedBrand] = useState(initialBrand)
  const [selectedModel, setSelectedModel] = useState(initialModel)
  const [carConfig, setCarConfig] = useState<CarConfig>(carConfigs[`${initialBrand}_${initialModel}`])
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
  const [environmentBrightness, setEnvironmentBrightness] = useState(1.0) // Default brightness at 100%
  const [maxEnvironmentBrightness] = useState(1.0) // Maximum brightness value (current brightness)
  const [showCustomColorPicker, setShowCustomColorPicker] = useState(false)
  const [showVehicleSelector, setShowVehicleSelector] = useState(false)
  const [tempBrand, setTempBrand] = useState(selectedBrand)
  const [tempModel, setTempModel] = useState(selectedModel)
  const [isModelLoading, setIsModelLoading] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [modelTransitioning, setModelTransitioning] = useState(false) // Track when model is transitioning
  const [slideDirection, setSlideDirection] = useState<'none' | 'out' | 'in'>('none') // Track slide animation phase
  const [initialPosition, setInitialPosition] = useState<number | null>(null) // Track initial position for slide-in

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
    setCarConfig(carConfigs[configKey] || carConfigs['BMW_8 Series/M8 (F9X)'])
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

  const handleLoadModel = async () => {
    // Start slide-out animation
    setSlideDirection('out')
    setModelTransitioning(true)
    setIsModelLoading(true)
    setShowVehicleSelector(false)
    
    // Wait for slide-out to complete
    await new Promise(resolve => setTimeout(resolve, 700))
    
    // Update model configuration while out of view
    const configKey = `${tempBrand}_${tempModel}` as keyof typeof carConfigs
    setSelectedBrand(tempBrand)
    setSelectedModel(tempModel)
    setCarConfig(carConfigs[configKey] || carConfigs['BMW_8 Series/M8 (F9X)'])
    
    // Set initial position for slide-in (off to the left)
    setInitialPosition(-10)
    
    // Small delay to process model and for user to notice the change
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Start slide-in animation
    setSlideDirection('in')
    
    // Complete the transition after slide-in completes
    setTimeout(() => {
      setSlideDirection('none')
      setInitialPosition(null)
      setModelTransitioning(false)
      setIsModelLoading(false)
    }, 800)
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Header */}
      <nav className="bg-black bg-opacity-80 backdrop-blur-sm p-4 flex justify-between items-center z-10">
        <Image 
          src="/logo.png" 
          alt="DRLs Direct Logo" 
          width={180}
          height={60}
          className="object-contain w-[150px] h-[50px] md:w-[180px] md:h-[60px]"
        />
        <div className="flex justify-end">
          <button
            onClick={() => setShowVehicleSelector(true)}
            className="px-4 py-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all duration-200 flex items-center gap-2 border border-white/10 backdrop-blur-sm shadow-lg"
          >
            <Car size={20} />
            <span className="hidden md:inline">Change Vehicle</span>
            <span className="text-white/60">
              {selectedBrand} {selectedModel}
            </span>
          </button>
        </div>
      </nav>

      {/* Vehicle Selector Modal */}
      <AnimatePresence>
        {showVehicleSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              className="bg-black/90 rounded-2xl border border-white/10 p-6 w-full max-w-md"
            >
              <div className="space-y-6">
                <h2 className="text-white text-xl font-bold">Select Vehicle</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-white/60 text-sm">Brand</label>
                    <select
                      value={tempBrand}
                      onChange={(e) => {
                        setTempBrand(e.target.value)
                        setTempModel(carModels[e.target.value as keyof typeof carModels][0])
                      }}
                      className="w-full bg-white/5 text-white border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-white/20"
                      disabled={isModelLoading}
                    >
                      {carBrands.map(brand => (
                        <option key={brand} value={brand} className="bg-black hover:bg-white/5">
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-white/60 text-sm">Model</label>
                    <select
                      value={tempModel}
                      onChange={(e) => setTempModel(e.target.value)}
                      className="w-full bg-white/5 text-white border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-white/20"
                      disabled={isModelLoading}
                    >
                      {carModels[tempBrand as keyof typeof carModels].map(model => (
                        <option key={model} value={model} className="bg-black hover:bg-white/5">
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowVehicleSelector(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-black/40 hover:bg-black/60 text-white border border-white/10 transition-all duration-200"
                    disabled={isModelLoading}
                  >
                    Cancel
                  </button>
                  <LoadButton
                    onClick={handleLoadModel}
                    isLoading={isModelLoading}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white transition-all duration-200 shadow-lg"
                  >
                    Load Vehicle
                  </LoadButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative flex-1 flex">
        {/* 3D Viewer */}
        <div className="absolute inset-0">
          <Canvas 
            shadows 
            camera={{ position: [15, 5, 15], fov: isMobile ? 65 : 50 }}
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
              <motion3d.group
                initial={{ x: initialPosition !== null ? initialPosition : 0, scale: 1 }}
                animate={{
                  x: slideDirection === 'out' ? 10 : // Slide far to the right
                     slideDirection === 'in' ? 0 : // Slide to center position
                     0, // Default position
                  scale: slideDirection === 'out' ? 0.7 : 1, // Scale down when sliding out
                  opacity: slideDirection === 'out' ? 0.2 : 1, // More fade when sliding out
                  rotateY: slideDirection === 'out' ? 0.4 : 0 // Slight rotation when sliding out
                }}
                transition={{
                  type: "spring",
                  stiffness: 70,
                  damping: 15,
                  mass: 1.2
                }}
              >
                <CameraAnimation />
                <AutoRotate 
                  isEnabled={autoRotate}
                  config={carConfig}
                  bodyColor={bodyColor ?? originalColors.body ?? '#CCCCCC'}
                  wheelColor={wheelColor ?? originalColors.wheel ?? '#333333'}
                  drlColor={drlColor}
                  interiorMainColor={interiorMainColor ?? originalColors.interiorMain ?? '#000000'}
                  interiorSecondaryColor={interiorSecondaryColor ?? originalColors.interiorSecondary ?? '#333333'}
                  setOriginalColors={setOriginalColors}
                />
              </motion3d.group>
              <Environment preset={selectedEnvironment} background={false} environmentIntensity={environmentBrightness} />
              <ContactShadows 
                rotation-x={Math.PI / 2}
                position={[0, -0.0001, 0]}
                opacity={0.8}
                width={isMobile ? 5 : 10}
                height={isMobile ? 5 : 10}
                blur={isMobile ? 0.5 : 1}
                far={isMobile ? 5 : 10}
              />
            </Suspense>
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
              className="bg-black/40 hover:bg-black/60 text-white px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-sm flex items-center gap-2 shadow-lg border border-white/10"
            >
              <Palette size={20} />
              <span className={isMobile ? 'hidden' : 'hidden md:inline'}>
                {showConfigurator ? 'Hide Configurator' : 'Show Configurator'}
              </span>
            </button>
            <button 
              className="bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-2 shadow-lg"
              onClick={captureScreenshot}
            >
              <Camera size={20} />
              <span className={isMobile ? 'hidden' : 'hidden md:inline'}>Screenshot</span>
            </button>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`
                ${autoRotate ? 'bg-red-600 hover:bg-red-700' : 'bg-black/40 hover:bg-black/60'} 
                text-white px-4 py-2 rounded-full transition-all duration-200 backdrop-blur-sm 
                flex items-center gap-2 shadow-lg border border-white/10
              `}
            >
              <RotateCw size={20} className={autoRotate ? 'animate-spin' : ''} />
              <span className={isMobile ? 'hidden' : 'hidden md:inline'}>
                {autoRotate ? 'Stop Rotation' : 'Auto Rotate'}
              </span>
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
                        className="w-full bg-black/60 text-white text-sm py-1.5 px-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10 mb-2"
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
                      
                      {/* Brightness Slider */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-white/70 text-xs">
                          <span>Brightness</span>
                          <span>{Math.round((environmentBrightness / maxEnvironmentBrightness) * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.2"
                          max={maxEnvironmentBrightness}
                          step="0.01"
                          value={environmentBrightness}
                          onChange={(e) => setEnvironmentBrightness(parseFloat(e.target.value))}
                          className="w-full accent-red-600"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>
                    </div>

                    {/* Color Configuration Sections */}
                    <div className={`
                      ${isMobile 
                        ? 'min-w-[180px] bg-white/5 rounded-xl p-3' 
                        : ''
                      }
                    `}>
                      <ConfigSection title="Body" icon={PaintBucket}>
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
                      <ConfigSection title="Wheels" icon={CircleDot}>
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
                      <ConfigSection title="DRL" icon={Lightbulb}>
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
                      <ConfigSection title="Interior Primary" icon={Component}>
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
                      <ConfigSection title="Interior Secondary" icon={Layers}>
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