'use client'

import { useState } from 'react'
import { useDesignStore } from '@/store/design-store'

export function DesignSystemPanel() {
  const { currentMockup, updateMockup } = useDesignStore()
  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'spacing' | 'shadows'>('colors')

  if (!currentMockup) {
    return (
      <div className="p-4 text-center text-secondary-500 dark:text-secondary-400">
        No design selected
      </div>
    )
  }

  const handleColorChange = (colorKey: string, value: string) => {
    updateMockup(currentMockup.id, {
      colorScheme: {
        ...currentMockup.colorScheme,
        [colorKey]: value,
      },
    })
  }

  const handleTypographyChange = (property: string, value: any) => {
    updateMockup(currentMockup.id, {
      typography: {
        ...currentMockup.typography,
        [property]: value,
      },
    })
  }

  const tabs = [
    { id: 'colors', name: 'Colors', icon: '🎨' },
    { id: 'typography', name: 'Typography', icon: '📝' },
    { id: 'spacing', name: 'Spacing', icon: '📏' },
    { id: 'shadows', name: 'Shadows', icon: '🌑' },
  ]

  const colorKeys = [
    { key: 'primary', name: 'Primary', description: 'Main brand color' },
    { key: 'secondary', name: 'Secondary', description: 'Supporting color' },
    { key: 'accent', name: 'Accent', description: 'Highlight color' },
    { key: 'background', name: 'Background', description: 'Page background' },
    { key: 'text', name: 'Text', description: 'Main text color' },
    { key: 'surface', name: 'Surface', description: 'Card/surface color' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <h3 className="font-semibold text-secondary-900 dark:text-white">Design System</h3>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Manage colors, typography, and design tokens
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-secondary-200 dark:border-secondary-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-50 dark:hover:bg-secondary-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'colors' && (
          <div className="space-y-4">
            {colorKeys.map((color) => (
              <div key={color.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      {color.name}
                    </label>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">
                      {color.description}
                    </p>
                  </div>
                  <input
                    type="color"
                    value={currentMockup.colorScheme[color.key as keyof typeof currentMockup.colorScheme] || '#000000'}
                    onChange={(e) => handleColorChange(color.key, e.target.value)}
                    className="w-12 h-8 rounded-lg border border-secondary-300 dark:border-secondary-600"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'typography' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Font Family
              </label>
              <select
                value={currentMockup.typography.fontFamily}
                onChange={(e) => handleTypographyChange('fontFamily', e.target.value)}
                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Lato">Lato</option>
                <option value="Poppins">Poppins</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Font Size
                </label>
                <input
                  type="number"
                  value={currentMockup.typography.fontSize}
                  onChange={(e) => handleTypographyChange('fontSize', parseInt(e.target.value))}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Font Weight
                </label>
                <select
                  value={currentMockup.typography.fontWeight}
                  onChange={(e) => handleTypographyChange('fontWeight', parseInt(e.target.value))}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                >
                  <option value={300}>Light (300)</option>
                  <option value={400}>Regular (400)</option>
                  <option value={500}>Medium (500)</option>
                  <option value={600}>Semi Bold (600)</option>
                  <option value={700}>Bold (700)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Line Height
              </label>
              <input
                type="number"
                step="0.1"
                value={currentMockup.typography.lineHeight}
                onChange={(e) => handleTypographyChange('lineHeight', parseFloat(e.target.value))}
                className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {activeTab === 'spacing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Gap
                </label>
                <input
                  type="number"
                  value={currentMockup.layout.gap}
                  onChange={(e) => updateMockup(currentMockup.id, { layout: { ...currentMockup.layout, gap: parseInt(e.target.value) } })}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Padding
                </label>
                <input
                  type="number"
                  value={currentMockup.layout.padding}
                  onChange={(e) => updateMockup(currentMockup.id, { layout: { ...currentMockup.layout, padding: parseInt(e.target.value) } })}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shadows' && (
          <div className="space-y-4">
            <div className="text-center text-secondary-500 dark:text-secondary-400">
              <div className="w-12 h-12 mx-auto mb-2 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center">
                <span className="text-xl">🌑</span>
              </div>
              <p className="text-sm">Shadow settings coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
