'use client'

import React from 'react'

interface ColorPickerProps {
  colors: { name: string; hex: string }[]
  selectedColor: string
  onChange: (color: string) => void
  onCustomColor: () => void
}

export default function ColorPicker({ colors, selectedColor, onChange, onCustomColor }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color.hex}
          className={`w-8 h-8 rounded-full transition-all duration-200 ${selectedColor === color.hex ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`}
          style={{ backgroundColor: color.hex }}
          onClick={() => onChange(color.hex)}
        />
      ))}
      <button
        className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-green-500 to-blue-500 hover:scale-105 transition-all duration-200"
        onClick={onCustomColor}
      />
    </div>
  )
}