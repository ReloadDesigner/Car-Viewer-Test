'use client'

import React from 'react'
import { Plus } from 'lucide-react'

interface Color {
  name: string
  hex: string
}

interface ColorPickerProps {
  colors: Color[]
  selectedColor: string
  onChange: (color: string) => void
  onCustomColor: () => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onChange,
  onCustomColor,
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.hex}
          onClick={() => onChange(color.hex)}
          className={`
            w-8 h-8 rounded-full transition-all duration-200
            ${selectedColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-110'}
          `}
          style={{ 
            backgroundColor: color.hex,
            border: color.hex === '#FFFFFF' ? '1px solid rgba(255,255,255,0.2)' : 'none'
          }}
          title={color.name}
        />
      ))}
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