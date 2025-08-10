'use client'

import { useState } from 'react'
import { useDesignStore } from '@/store/design-store'
import { DesignElement } from '@/types'

export function PropertiesPanel() {
  const { currentMockup, selectedElements, updateElement } = useDesignStore()
  const [activeTab, setActiveTab] = useState<'style' | 'layout' | 'content'>('style')

  if (!currentMockup || selectedElements.length === 0) {
    return (
      <div className="p-4 text-center text-secondary-500 dark:text-secondary-400">
        {selectedElements.length === 0 ? 'No element selected' : 'No design selected'}
      </div>
    )
  }

  const selectedElement = currentMockup.elements.find((e) => e.id === selectedElements[0])
  if (!selectedElement) return null

  const handlePropertyChange = (property: string, value: any) => {
    updateElement(selectedElement.id, { [property]: value })
  }

  const tabs = [
    { id: 'style', name: 'Style', icon: '🎨' },
    { id: 'layout', name: 'Layout', icon: '📐' },
    { id: 'content', name: 'Content', icon: '📝' },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <h3 className="font-semibold text-secondary-900 dark:text-white">Properties</h3>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          {selectedElement.type} element
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-secondary-200 dark:border-secondary-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 text-sm font-medium transition-colors ${
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
        {activeTab === 'style' && (
          <div className="space-y-4">
            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Background Color
              </label>
              <input
                type="color"
                value={selectedElement.style.backgroundColor || '#ffffff'}
                onChange={(e) => handlePropertyChange('style', { ...selectedElement.style, backgroundColor: e.target.value })}
                className="w-full h-10 rounded-lg border border-secondary-300 dark:border-secondary-600"
              />
            </div>

            {/* Border */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Border Width
                </label>
                <input
                  type="number"
                  value={selectedElement.style.borderWidth || 0}
                  onChange={(e) => handlePropertyChange('style', { ...selectedElement.style, borderWidth: parseInt(e.target.value) })}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Border Radius
                </label>
                <input
                  type="number"
                  value={selectedElement.style.borderRadius || 0}
                  onChange={(e) => handlePropertyChange('style', { ...selectedElement.style, borderRadius: parseInt(e.target.value) })}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
            </div>

            {/* Opacity */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Opacity
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedElement.style.opacity || 1}
                onChange={(e) => handlePropertyChange('style', { ...selectedElement.style, opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-4">
            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  X Position
                </label>
                <input
                  type="number"
                  value={selectedElement.position.x}
                  onChange={(e) => handlePropertyChange('position', { ...selectedElement.position, x: parseInt(e.target.value) })}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Y Position
                </label>
                <input
                  type="number"
                  value={selectedElement.position.y}
                  onChange={(e) => handlePropertyChange('position', { ...selectedElement.position, y: parseInt(e.target.value) })}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
            </div>

            {/* Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={selectedElement.size.width}
                  onChange={(e) => handlePropertyChange('size', { ...selectedElement.size, width: parseInt(e.target.value) })}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={selectedElement.size.height}
                  onChange={(e) => handlePropertyChange('size', { ...selectedElement.size, height: parseInt(e.target.value) })}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* Content */}
            {selectedElement.type === 'text' && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                  Text Content
                </label>
                <textarea
                  value={selectedElement.content || ''}
                  onChange={(e) => handlePropertyChange('content', e.target.value)}
                  className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white resize-none"
                  rows={3}
                />
              </div>
            )}

            {/* Font Properties */}
            {selectedElement.type === 'text' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Font Size
                  </label>
                  <input
                    type="number"
                    value={selectedElement.style.fontSize || 16}
                    onChange={(e) => handlePropertyChange('style', { ...selectedElement.style, fontSize: parseInt(e.target.value) })}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                    Font Weight
                  </label>
                  <select
                    value={selectedElement.style.fontWeight || 400}
                    onChange={(e) => handlePropertyChange('style', { ...selectedElement.style, fontWeight: parseInt(e.target.value) })}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  >
                    <option value={300}>Light (300)</option>
                    <option value={400}>Regular (400)</option>
                    <option value={500}>Medium (500)</option>
                    <option value={600}>Semi Bold (600)</option>
                    <option value={700}>Bold (700)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
