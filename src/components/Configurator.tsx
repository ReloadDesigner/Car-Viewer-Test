'use client'

import React, { Suspense, useState, useEffect, useRef } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three';
import { motion } from 'framer-motion'
import { AnimatePresence } from 'framer-motion'
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
import { c63_amgConfig } from '../config/modelConfigs/mercedesConfigs/c-class_c63_amg';
import { gtrR35NismoConfig } from '../config/modelConfigs/nissanConfigs/gt-r_r35_nismo';
import { grSupraConfig } from '../config/modelConfigs/toyotaConfigs/gr_supra';
import Image from 'next/image'

interface ConfiguratorProps {
  initialBrand: string;
  initialModel: string;
}

const carBrands = ['BMW', 'Mercedes', 'Nissan', 'Toyota']

const carModels = {
  BMW: ['4 Series/M4 (F3X/F8X)', '8 Series/M8 (F9X)'],
  Mercedes: ['C-Class (W205) AMG/Coupé'],
  Nissan: ['GT-R (R35/Nismo)'],
  Toyota: ['GR Supra']
}

const carConfigs: ModelConfig = {
  'BMW_8 Series/M8 (F9X)': m8_f92Config,
  'BMW_4 Series/M4 (F3X/F8X)': m4_f82Config,
  'Mercedes_C-Class (W205) AMG/Coupé': c63_amgConfig,
  'Nissan_GT-R (R35/Nismo)': gtrR35NismoConfig,
  'Toyota_GR Supra': grSupraConfig
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
    glass: string | null;
  }) => void;
}) {
  const { scene } = useThree()
  const rotationGroup = useRef<THREE.Group>(null)
  
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

// Komponente für den Lade-Indikator
const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-white text-xl">Loading Model...</p>
      </div>
    </div>
  );
};

export default function Configurator({ initialBrand, initialModel }: ConfiguratorProps) {
  const [selectedBrand, setSelectedBrand] = useState(initialBrand)
  const [selectedModel, setSelectedModel] = useState(initialModel)
  const [carConfig, setCarConfig] = useState<CarConfig>(carConfigs[`${initialBrand}_${initialModel}`])
  const [originalColors, setOriginalColors] = useState({
    body: null,
    wheel: null,
    drl: '#FFFFFF',
    interiorMain: null,
    interiorSecondary: null,
    glass: null
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
  const [showResetColorsDialog, setShowResetColorsDialog] = useState(false)
  const [showDisclaimerDialog, setShowDisclaimerDialog] = useState(false)
  const [showLicenseInfo, setShowLicenseInfo] = useState(false)

  // Entfernen der nicht mehr benötigten Ref für OrbitControls
  // const [orbitControlsRef, setOrbitControlsRef] = useState(null);

  // Canvas-Schlüssel für komplette Neuinitialisierung
  const [canvasKey, setCanvasKey] = useState(0);

  const hasColorChanges = () => {
    return (
      bodyColor !== originalColors.body ||
      wheelColor !== originalColors.wheel ||
      drlColor !== '#FFFFFF' ||
      interiorMainColor !== originalColors.interiorMain ||
      interiorSecondaryColor !== originalColors.interiorSecondary
    );
  };

  const initiateModelChange = () => {
    // Zuerst das Fahrzeugauswahlmenü schließen
    setShowVehicleSelector(false);
    
    // Danach prüfen ob Farbänderungen vorhanden sind
    if (hasColorChanges()) {
      setShowResetColorsDialog(true);
    } else {
      handleLoadModel();
    }
  };

  const handleLoadModel = async () => {
    setShowResetColorsDialog(false);
    
    // Lade-Indikator anzeigen
    setIsModelLoading(true)
    setModelTransitioning(true)
    setSlideDirection('out')
    
    await new Promise(resolve => setTimeout(resolve, 700))
    
    const configKey = `${tempBrand}_${tempModel}` as keyof typeof carConfigs
    setSelectedBrand(tempBrand)
    setSelectedModel(tempModel)
    setCarConfig(carConfigs[configKey] || carConfigs['BMW_8 Series/M8 (F9X)'])
    
    // Reset des Canvas durch Schlüsseländerung
    setCanvasKey(prevKey => prevKey + 1);
    
    setInitialPosition(-10)
    
    await new Promise(resolve => setTimeout(resolve, 500)) // Längere Wartezeit, um sicherzustellen, dass das Canvas zurückgesetzt wird
    
    setSlideDirection('in')
    
    // Längere Verzögerung für die volle Animation
    setTimeout(() => {
      setSlideDirection('none')
      setInitialPosition(null)
      setModelTransitioning(false)
      setIsModelLoading(false)
    }, 1200)
  }

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

  // Entfernen der nicht mehr benötigten useEffects und States für das OrbitControl-Target
  // Diese werden durch den Canvas-Reset-Ansatz ersetzt

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
      await new Promise(resolve => requestAnimationFrame(resolve));
      
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      if (ctx) {
        ctx.drawImage(canvas, 0, 0);
        
        const link = document.createElement('a');
        link.download = `${selectedBrand}_${selectedModel}_config.png`;
        link.href = tempCanvas.toDataURL('image/png', 1.0);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  // Disclaimer-Dialog bei jedem Laden der Seite anzeigen
  useEffect(() => {
    // Kurze Verzögerung, damit der Disclaimer nach vollständigem Laden erscheint
    const timer = setTimeout(() => {
      setShowDisclaimerDialog(true)
    }, 1500)
    return () => clearTimeout(timer)
  }, []) // Leeres Dependency-Array bedeutet: nur beim ersten Laden der Komponente ausführen

  // Disclaimer schließen
  const acknowledgeDisclaimer = () => {
    // Keine Speicherung mehr, damit der Dialog bei jedem Refresh erscheint
    setShowDisclaimerDialog(false)
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

      {/* Color Reset Dialog */}
      <AnimatePresence>
        {showResetColorsDialog && (
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
                <h2 className="text-white text-xl font-bold">Reset Color Changes</h2>
                
                <p className="text-white/80">
                  You have made color changes to the current vehicle. 
                  Would you like to reset these changes before loading the new vehicle?
                </p>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      resetColors();
                      handleLoadModel();
                    }}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white transition-all duration-200 shadow-lg"
                    disabled={isModelLoading}
                  >
                    Reset & Change
                  </button>
                  <button
                    onClick={() => setShowResetColorsDialog(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-black/40 hover:bg-black/60 text-white border border-white/10 transition-all duration-200"
                    disabled={isModelLoading}
                  >
                    Resume
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    onClick={initiateModelChange}
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

      {/* Disclaimer Dialog */}
      <AnimatePresence>
        {showDisclaimerDialog && (
          <motion.div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={acknowledgeDisclaimer}
          >
            <motion.div 
              className="bg-gradient-to-b from-slate-800 to-slate-900 p-8 rounded-lg max-w-md w-full border border-blue-400/20 shadow-2xl"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-5 border-b border-blue-400/30 pb-2">Important Notice</h2>
              <p className="text-gray-200 mb-6 leading-relaxed">
                This 3D visualization is for approximate representation only. 
                Actual colors, materials, and lighting effects may differ from what is displayed 
                in this model. This simulation is intended as a guide only and does not 
                represent a binding product representation.
              </p>
              <button
                onClick={acknowledgeDisclaimer}
                className="w-full px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
              >
                I Understand
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lizenz-Information Icon */}
      <div className="absolute bottom-2 right-2 z-40">
        <button 
          onClick={() => setShowLicenseInfo(!showLicenseInfo)}
          className="bg-black/40 hover:bg-black/60 p-2 rounded-full transition-all"
          title="License Information"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/70" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Lizenz-Information Dialog */}
      <AnimatePresence>
        {showLicenseInfo && (
          <motion.div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLicenseInfo(false)}
          >
            <motion.div 
              className="bg-slate-900 p-6 rounded-lg max-w-xl w-full border border-white/10 shadow-xl max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">License Information</h2>
                <button 
                  onClick={() => setShowLicenseInfo(false)}
                  className="text-white/60 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="text-gray-300 text-sm space-y-4 overflow-y-auto">
                <p className="border-b border-white/10 pb-2">
                  The 3D models in this configurator are subject to the following license terms:
                </p>
                
                <div>
                  <h3 className="font-semibold mb-1">BMW M4 F82</h3>
                  <p className="text-xs text-gray-400">
                    This work is based on "BMW M4 f82" (https://sketchfab.com/3d-models/bmw-m4-f82-8e87379f40fd40dcac0a751e22c1a188) by Black Snow (https://sketchfab.com/BlackSnow02) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">BMW M8 F92</h3>
                  <p className="text-xs text-gray-400">
                    This work is based on "BMW M8 F92 Coupé Competition" (https://sketchfab.com/3d-models/bmw-m8-f92-coupe-competition-25d5b4f6d13e4217afa09bbf89f8d993) by kevin (ケビン) (https://sketchfab.com/sohyalebret) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Mercedes-AMG C 63 Coupe S (W205)</h3>
                  <p className="text-xs text-gray-400">
                    This work is based on "Mercedes-AMG C 63 Coupe S (W205)" (https://sketchfab.com/3d-models/mercedes-amg-c-63-coupe-s-w205-c8f54d07a4ca451ebc4a15f27a4230c3) by GT Cars: Hyperspeed (https://sketchfab.com/Car2022) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Nissan GT-R R35 Nismo</h3>
                  <p className="text-xs text-gray-400">
                    This work is based on "Nissan GT-R R35 Nismo | www.vecarz.com" (https://sketchfab.com/3d-models/nissan-gt-r-r35-nismo-wwwvecarzcom-9cfbe4727b7f4af0a11772687c4a1f59) by vecarz (https://sketchfab.com/heynic) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-1">Toyota GR Supra</h3>
                  <p className="text-xs text-gray-400">
                    This work is based on "Toyota GR Supra" (https://sketchfab.com/3d-models/toyota-gr-supra-4e5b4f6d13e4217afa09bbf89f8d993) by Toyota (https://sketchfab.com/Toyota) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
                  </p>
                </div>
                
                <p className="pt-2 text-xs italic">
                  All vehicle brands, logos, and model designations are the property of their respective manufacturers and are used here
                  for informational purposes only. This application is not affiliated with or endorsed by the vehicle manufacturers.
                </p>
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
            key={`canvas-${canvasKey}-${selectedModel}`}
            shadows 
            camera={{ position: [15, 5, 15], fov: isMobile ? 65 : 50 }}
            gl={{ 
              antialias: true, 
              toneMapping: ACESFilmicToneMapping,
              toneMappingExposure: 1.0,
              outputColorSpace: 'srgb'
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
              target={selectedModel === 'A-Class (A45 AMG)' ? new THREE.Vector3(0, 0.5, 0) : new THREE.Vector3(0, 1, 0)}
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

          {/* Lade-Indikator */}
          {isModelLoading && <LoadingOverlay />}
        </div>
      </div>
    </div>
  )
}