'use client'

import React from 'react'
import { Plus } from 'lucide-react'

interface Color {
  name: string
  hex: string
  isMetallic?: boolean
}

interface ColorPickerProps {
  colors: Color[]
  selectedColor: string
  onChange: (color: string) => void
  onCustomColor: () => void
  effect?: 'metallic' | 'glow' | 'leather'
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onChange,
  onCustomColor,
  effect
}) => {
  const getEffectStyles = (color: Color) => {
    switch (effect) {
      case 'metallic':
        return {
          background: `linear-gradient(135deg, 
            ${color.hex}00 0%, 
            ${color.hex} 30%, 
            ${color.hex}FF 50%, 
            ${color.hex} 70%, 
            ${color.hex}00 100%)`,
          child: (
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                background: `linear-gradient(45deg, 
                  transparent 0%, 
                  rgba(255,255,255,0.1) 45%, 
                  rgba(255,255,255,0.4) 50%, 
                  rgba(255,255,255,0.1) 55%, 
                  transparent 100%)`
              }}
            />
          )
        }
      case 'glow':
        return {
          background: color.hex,
          boxShadow: selectedColor === color.hex 
            ? `0 0 8px 1px ${color.hex}80`
            : 'none',
          child: (
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at center, 
                  ${color.hex}00 0%, 
                  ${color.hex}20 70%, 
                  ${color.hex}40 100%)`,
                opacity: selectedColor === color.hex ? 0.8 : 0.4,
                transition: 'opacity 0.2s ease-in-out'
              }}
            />
          )
        }
      case 'leather':
        return {
          background: color.hex,
          child: (
            <div 
              className="absolute inset-0 rounded-full opacity-40"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.2) 60%, transparent 60%),
                  linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.2) 40%, rgba(255,255,255,0.2) 60%, transparent 60%)
                `,
                backgroundSize: '8px 8px'
              }}
            />
          )
        }
      default:
        return {
          background: color.hex,
          child: null
        }
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => {
        const effectStyle = getEffectStyles(color)
        return (
          <button
            key={color.hex}
            onClick={() => onChange(color.hex)}
            className={`
              w-8 h-8 rounded-full relative overflow-hidden transition-all duration-200
              ${selectedColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-110'}
            `}
            style={{ 
              ...effectStyle,
              border: color.hex === '#FFFFFF' ? '1px solid rgba(255,255,255,0.2)' : 'none'
            }}
            title={color.name}
          >
            {effectStyle.child}
          </button>
        )
      })}
      <button
        onClick={onCustomColor}
        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
        title="Custom Color"
      >
        <Plus size={16} className="text-white" />
      </button>
    </div>
  )
}

export default ColorPicker