'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface ConfigSectionProps {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}

export default function ConfigSection({ title, icon: Icon, children }: ConfigSectionProps) {
  return (
    <div className="mb-6">
      <h3 className="text-white text-lg mb-2 flex items-center">
        <Icon className="mr-2" size={20} />
        {title}
      </h3>
      {children}
    </div>
  )
}