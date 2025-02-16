'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ConfigSectionProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}

const ConfigSection: React.FC<ConfigSectionProps> = ({ title, icon: Icon, children }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-white/90">
        <Icon size={18} className="text-white/60" />
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default ConfigSection