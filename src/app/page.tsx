'use client'

import { useState } from 'react'
import Configurator from '../components/Configurator'
import StartScreen from '../components/StartScreen'

export default function Home() {
  const [showConfigurator, setShowConfigurator] = useState(false)

  const handleStartConfiguration = () => {
    setShowConfigurator(true)
  }

  const handleLoadConfiguration = () => {
    // TODO: Implement loading saved configuration
    setShowConfigurator(true)
  }

  return (
    <main>
      {!showConfigurator ? (
        <StartScreen
          onStartConfiguration={handleStartConfiguration}
          onLoadConfiguration={handleLoadConfiguration}
        />
      ) : (
        <Configurator />
      )}
    </main>
  )
}