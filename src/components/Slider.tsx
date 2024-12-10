'use client'

import React from 'react'

interface SliderProps {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}

export default function Slider({ min, max, step, value, onChange }: SliderProps) {
  return (
    <div className="flex items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
      <span className="ml-2 text-white">{value.toFixed(1)}</span>
    </div>
  )
}