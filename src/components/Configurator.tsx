'use client'

import React, { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Download, RotateCcw, Car, Disc, Lightbulb, Sofa, Palette } from 'lucide-react'
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
  // Add other model configs here as you create them
}

const drlColors = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#00FF00' },
]

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
  const [showConfigurator, setShowConfigurator] = useState(false)

  useEffect(() => {
    const configKey = `${selectedBrand}_${selectedModel}` as keyof typeof carConfigs
    setCarConfig(carConfigs[configKey] || carConfigs['BMW_M3']) // Fallback to BMW M3 if config not found
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
    input.onchange = (e) => setColor((e.target as HTMLInputElement).value)
    input.click()
  }

  const resetColors = () => {
    setBodyColor(originalColors.body)
    setWheelColor(originalColors.wheel)
    setDrlColor('#FFFFFF')
    setInteriorMainColor(originalColors.interiorMain)
    setInteriorSecondaryColor(originalColors.interiorSecondary)
  }

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBrand(e.target.value)
    setSelectedModel(carModels[e.target.value as keyof typeof carModels][0])
    setOriginalColors({
      body: null,
      wheel: null,
      drl: '#FFFFFF',
      interiorMain: null,
      interiorSecondary: null
    })
  }

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value)
    setOriginalColors({
      body: null,
      wheel: null,
      drl: '#FFFFFF',
      interiorMain: null,
      interiorSecondary: null
    })
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-900">
      <nav className="bg-black bg-opacity-50 p-4 flex justify-between items-center">
        <h1 className="text-white text-2xl font-bold">DRLs Direct Configurator</h1>
        <div className="flex space-x-4">
          <Dropdown
            options={carBrands}
            value={selectedBrand}
            onChange={handleBrandChange}
            label="Brand"
          />
          <Dropdown
            options={carModels[selectedBrand as keyof typeof carModels]}
            value={selectedModel}
            onChange={handleModelChange}
            label="Model"
          />
        </div>
      </nav>
      <div className="flex-grow relative">
        <Canvas shadows camera={{ position: [5, 2, 5], fov: 50 }}>
          <color attach="background" args={['#111']} />
          <fog attach="fog" args={['#111', 10, 20]} />
          <Suspense fallback={null}>
            <CarModel
              config={carConfig}
              bodyColor={bodyColor || '#CCCCCC'}
              wheelColor={wheelColor || '#333333'}
              drlColor={drlColor}
              interiorMainColor={interiorMainColor || '#000000'}
              interiorSecondaryColor={interiorSecondaryColor || '#333333'}
              setOriginalColors={setOriginalColors}
            />
            <Environment preset="studio" />
            <ContactShadows 
              rotation-x={Math.PI / 2}
              position={[0, -0.0001, 0]}
              opacity={0.8}
              width={10}
              height={10}
              blur={1}
              far={10}
            />
          </Suspense>
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minPolarAngle={Math.PI / 6} 
            maxPolarAngle={Math.PI / 2}
            minDistance={2}
            maxDistance={10}
          />
        </Canvas>
        <div className="absolute bottom-4 left-4 flex space-x-2">
          <button
            onClick={() => setShowConfigurator(!showConfigurator)}
            className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white px-4 py-2 rounded-lg transition-all duration-200"
          >
            {showConfigurator ? 'Hide Configurator' : 'Show Configurator'}
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200">
            <Camera className="inline-block mr-2" size={18} />
            Screenshot
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200">
            <Download className="inline-block mr-2" size={18} />
            Save Configuration
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showConfigurator && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className="absolute top-0 right-0 h-full w-80 bg-black bg-opacity-75 p-6 overflow-y-auto"
          >
            <h2 className="text-white text-xl font-bold mb-6">Configuration</h2>
            <ConfigSection title="Body" icon={Car}>
              <ColorPicker
                colors={[
                  { name: 'Original', hex: originalColors.body || '#CCCCCC' },
                  { name: 'Black', hex: '#000000' },
                  { name: 'White', hex: '#FFFFFF' },
                  { name: 'Red', hex: '#FF0000' },
                  { name: 'Blue', hex: '#0000FF' },
                ]}
                selectedColor={bodyColor || '#CCCCCC'}
                onChange={setBodyColor}
                onCustomColor={() => handleCustomColor(setBodyColor)}
              />
            </ConfigSection>
            <ConfigSection title="Wheels" icon={Disc}>
              <ColorPicker
                colors={[
                  { name: 'Original', hex: originalColors.wheel || '#333333' },
                  { name: 'Silver', hex: '#C0C0C0' },
                  { name: 'Black', hex: '#000000' },
                  { name: 'Gold', hex: '#FFD700' },
                ]}
                selectedColor={wheelColor || '#333333'}
                onChange={setWheelColor}
                onCustomColor={() => handleCustomColor(setWheelColor)}
              />
            </ConfigSection>
            <ConfigSection title="DRL" icon={Lightbulb}>
              <ColorPicker
                colors={drlColors}
                selectedColor={drlColor}
                onChange={setDrlColor}
                onCustomColor={() => handleCustomColor(setDrlColor)}
              />
            </ConfigSection>
            <ConfigSection title="Interior Main Color" icon={Sofa}>
              <ColorPicker
                colors={[
                  { name: 'Original', hex: originalColors.interiorMain || '#000000' },
                  { name: 'Beige', hex: '#F5F5DC' },
                  { name: 'Brown', hex: '#8B4513' },
                  { name: 'Gray', hex: '#808080' },
                ]}
                selectedColor={interiorMainColor || '#000000'}
                onChange={setInteriorMainColor}
                onCustomColor={() => handleCustomColor(setInteriorMainColor)}
              />
            </ConfigSection>
            <ConfigSection title="Interior Secondary Color" icon={Palette}>
              <ColorPicker
                colors={[
                  { name: 'Original', hex: originalColors.interiorSecondary || '#333333' },
                  { name: 'Light Gray', hex: '#D3D3D3' },
                  { name: 'Black', hex: '#000000' },
                  { name: 'Brown', hex: '#8B4513' },
                ]}
                selectedColor={interiorSecondaryColor || '#333333'}
                onChange={setInteriorSecondaryColor}
                onCustomColor={() => handleCustomColor(setInteriorSecondaryColor)}
              />
            </ConfigSection>
            <button
              onClick={resetColors}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center"
            >
              <RotateCcw className="mr-2" size={18} />
              Reset
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}