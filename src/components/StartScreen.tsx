'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface StartScreenProps {
  onStartConfiguration: () => void
  onLoadConfiguration: () => void
}

export default function StartScreen({ onStartConfiguration, onLoadConfiguration }: StartScreenProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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
          src="/DrlsDirect-Home.jpg"
          alt="DRLs Direct Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        {/* Dark Overlay */}
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
          className="text-white text-5xl md:text-7xl font-bold mb-4"
        >
          DRLs Direct
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-white text-xl md:text-2xl mb-12"
        >
          3D Configurator
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 1.2 }}
            onClick={onLoadConfiguration}
            className="w-full px-6 py-3 bg-gray-800 bg-opacity-80 hover:bg-opacity-90 text-white rounded-lg transition-all duration-300 backdrop-blur-sm"
          >
            Load Saved Configuration
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 20 }}
            transition={{ duration: 1, delay: 1.4 }}
            onClick={onStartConfiguration}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
          >
            Start New Configuration
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
