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
      {/* Background mit subtiler Zoom-Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: isLoaded ? 1 : 0, scale: 1 }}
        transition={{ duration: 1.8, ease: [0.45, 0, 0.55, 1] }}
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
        {/* Dynamischer Overlay */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/50 to-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        />
      </motion.div>

      {/* Content Container */}
      <motion.div
        className="relative h-full flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        {/* Logo & Title Group */}
        <motion.div
          className="text-center space-y-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <Image
              src="/logo.png"
              alt="DRLs Direct Logo"
              width={140}
              height={140}
              className="mx-auto drop-shadow-2xl"
            />
          </motion.div>

          {/* Title mit metallischem Effekt */}
          <div className="space-y-4 text-center">
            <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold whitespace-nowrap
                       bg-gradient-to-r from-[#9f9f9f] via-[#f5f5f5] to-[#9f9f9f]
                       text-transparent bg-clip-text
                       animate-subtle-shimmer
                       drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)]">
              DRLs Direct
            </h1>
            <p className="text-xl sm:text-2xl text-gray-300 font-light tracking-wide">
              3D Configurator
            </p>
          </div>
        </motion.div>

        {/* Start Button mit Shine-Effekt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <button
            onClick={() => setShowModelSelector(true)}
            className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-700 to-red-900
                     rounded-xl text-white text-base sm:text-lg font-medium
                     transition-all duration-300
                     hover:from-red-600 hover:to-red-800
                     hover:shadow-[0_0_20px_rgba(255,0,0,0.3)]
                     overflow-hidden"
          >
            {/* Shine Overlay */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent
                          translate-x-[-150%] group-hover:translate-x-[150%] 
                          transition-transform duration-700 ease-out" />
            
            {/* Button Content */}
            <div className="relative flex items-center space-x-2 sm:space-x-3">
              <Car className="w-5 h-5 sm:w-6 sm:h-6" />
              <span>Start Configuration</span>
            </div>
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
