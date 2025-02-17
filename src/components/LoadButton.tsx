'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface LoadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function LoadButton({ 
  onClick, 
  children, 
  className = "", 
  isLoading = false,
  disabled,
  ...props 
}: LoadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <motion.div
        initial={false}
        animate={{
          opacity: isLoading ? 1 : 0,
          width: isLoading ? "100%" : "0%"
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-r from-red-600/50 to-red-800/50"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
      </motion.div>
      {children}
    </button>
  )
}
