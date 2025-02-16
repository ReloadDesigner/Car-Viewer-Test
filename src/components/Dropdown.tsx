'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'

interface DropdownProps {
  options: string[]
  value: string
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void
  label?: string
  className?: string
}

export default function Dropdown({ options, value, onChange, label, className }: DropdownProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`appearance-none bg-gray-800 text-white py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/10 ${className || ''}`}
        style={{
          background: '#1a1a1a',
          colorScheme: 'dark'
        }}
      >
        {options.map((option) => (
          <option 
            key={option} 
            value={option}
            style={{
              background: '#1a1a1a',
              color: '#ffffff'
            }}
          >
            {option}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
        <ChevronDown size={18} />
      </div>
      {label && <label className="absolute text-xs text-gray-400 -top-5 left-0">{label}</label>}
    </div>
  )
}