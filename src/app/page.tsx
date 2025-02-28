'use client'

import { useState } from 'react'
import Configurator from '../components/Configurator'
import StartScreen from '../components/StartScreen'

export default function Home() {
  const [showConfigurator, setShowConfigurator] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState('BMW')
  const [selectedModel, setSelectedModel] = useState('M3')

  const handleStartConfiguration = (brand: string, model: string) => {
    setSelectedBrand(brand)
    setSelectedModel(model)
    setShowConfigurator(true)
  }

  return (
    <main>
      {!showConfigurator ? (
        <StartScreen
          onStartConfiguration={handleStartConfiguration}
        />
      ) : (
        <Configurator 
          initialBrand={selectedBrand}
          initialModel={selectedModel}
        />
      )}
    </main>
  )
}