'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useMediaQuery } from 'react-responsive'

interface StartScreenProps {
  onStartConfiguration: () => void
  onLoadConfiguration: () => void
}

export default function StartScreen({ onStartConfiguration, onLoadConfiguration }: StartScreenProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isMobileReady, setIsMobileReady] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 768 })

  useEffect(() => {
    setIsLoaded(true)
    // Set initial mobile state based on window width
    setIsMobileReady(true)
  }, [])

  // Don't render image until we know the device type
  if (!isMobileReady) {
    return (
      <div className="w-full h-screen bg-black" />
    )
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
            onClick={onLoadConfiguration}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm transition-all duration-200"
          >
            Load Saved Configuration
          </button>
          <button
            onClick={onStartConfiguration}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200"
          >
            Start New Configuration
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
