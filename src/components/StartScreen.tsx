'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useMediaQuery } from 'react-responsive'
import { Car } from 'lucide-react'
import LoadButton from './LoadButton'

interface StartScreenProps {
  onStartConfiguration: () => void
}

const carBrands = ['BMW', 'Audi', 'Mercedes']
const carModels = {
  BMW: ['M3', 'M4', 'X5'],
  Audi: ['A4', 'A6', 'Q5'],
  Mercedes: ['C-Class', 'E-Class', 'GLC'],
}

export default function StartScreen({ onStartConfiguration }: StartScreenProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileReady, setIsMobileReady] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 768 })
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState(carBrands[0])
  const [selectedModel, setSelectedModel] = useState(carModels[carBrands[0] as keyof typeof carModels][0])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    setIsMobileReady(true)
  }, [])

  const handleStartConfig = async () => {
    setIsLoading(true)
    
    // Warte einen kurzen Moment für die Button-Animation
    await new Promise(resolve => setTimeout(resolve, 300))
    
    onStartConfiguration()
    setShowModelSelector(false)
  }

  if (!isMobileReady) {
    return <div className="w-full h-screen bg-black" />
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Background Image with Fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src={isMobile ? "/DrlsDirect-Home(mobile).jpg" : "/DrlsDirect-Home.jpg"}
          alt="DRLs Direct Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
          sizes="100vw"
          quality={100}
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        className="relative z-10 h-full flex flex-col items-center justify-center px-4"
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-white text-5xl md:text-7xl font-bold mb-4 text-center"
        >
          DRLs Direct
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-white/80 text-xl md:text-2xl mb-12 text-center"
        >
          3D Configurator
        </motion.h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={() => setShowModelSelector(true)}
            className="px-8 py-3 bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white rounded-full transition-all duration-200 flex items-center gap-2"
          >
            <Car size={24} />
            Start Configuration
          </button>
        </motion.div>
      </motion.div>

      {/* Model Selector Modal */}
      <AnimatePresence>
        {showModelSelector && (
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
                      value={selectedBrand}
                      onChange={(e) => {
                        setSelectedBrand(e.target.value)
                        setSelectedModel(carModels[e.target.value as keyof typeof carModels][0])
                      }}
                      className="w-full bg-white/5 text-white border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-white/20"
                      disabled={isLoading}
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
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full bg-white/5 text-white border border-white/10 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-white/20"
                      disabled={isLoading}
                    >
                      {carModels[selectedBrand as keyof typeof carModels].map(model => (
                        <option key={model} value={model} className="bg-black hover:bg-white/5">
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowModelSelector(false)}
                    className="flex-1 px-4 py-2 rounded-lg bg-black/40 hover:bg-black/60 text-white border border-white/10 transition-all duration-200"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <LoadButton
                    onClick={handleStartConfig}
                    isLoading={isLoading}
                    className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-br from-red-700 to-red-900 hover:from-red-600 hover:to-red-800 text-white transition-all duration-200 shadow-lg"
                  >
                    Start Configuration
                  </LoadButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
