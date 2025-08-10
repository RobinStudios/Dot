'use client'

import { useState } from 'react'
import { useDesignStore } from '@/store/design-store'

export function ToolsPanel() {
  const { currentMockup, addElement } = useDesignStore()
  const [activeCategory, setActiveCategory] = useState('shapes')

  const categories = [
    { id: 'shapes', name: 'Shapes', icon: '⬜' },
    { id: 'text', name: 'Text', icon: '📝' },
    { id: 'media', name: 'Media', icon: '🖼️' },
    { id: 'icons', name: 'Icons', icon: '🔘' },
  ]

  const shapes = [
    { name: 'Rectangle', icon: '⬜', type: 'shape' },
    { name: 'Circle', icon: '⭕', type: 'shape' },
    { name: 'Triangle', icon: '🔺', type: 'shape' },
    { name: 'Star', icon: '⭐', type: 'shape' },
  ]

  const textElements = [
    { name: 'Heading', icon: 'H', type: 'text' },
    { name: 'Paragraph', icon: 'P', type: 'text' },
    { name: 'Button', icon: '🔘', type: 'button' },
  ]

  const mediaElements = [
    { name: 'Image', icon: '🖼️', type: 'image' },
    { name: 'Video', icon: '🎥', type: 'video' },
  ]

  const icons = [
    { name: 'Heart', icon: '❤️', type: 'icon' },
    { name: 'Star', icon: '⭐', type: 'icon' },
    { name: 'Arrow', icon: '➡️', type: 'icon' },
    { name: 'Check', icon: '✅', type: 'icon' },
  ]

  const handleAddElement = (elementType: string, elementName: string) => {
    if (!currentMockup) return

    const newElement = {
      id: `${elementType}-${Date.now()}`,
      type: elementType as any,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 100 },
      style: {},
      content: elementName,
    }

    addElement(newElement)
  }

  const renderElements = () => {
    switch (activeCategory) {
      case 'shapes':
        return shapes
      case 'text':
        return textElements
      case 'media':
        return mediaElements
      case 'icons':
        return icons
      default:
        return []
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <h3 className="font-semibold text-secondary-900 dark:text-white">Tools</h3>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Add elements to your design
        </p>
      </div>

      {/* Categories */}
      <div className="flex border-b border-secondary-200 dark:border-secondary-700">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-50 dark:hover:bg-secondary-700'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>

      {/* Elements */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {renderElements().map((element) => (
            <button
              key={element.name}
              onClick={() => handleAddElement(element.type, element.name)}
              className="p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors text-center"
            >
              <div className="text-2xl mb-2">{element.icon}</div>
              <div className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                {element.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-secondary-200 dark:border-secondary-700">
        <h4 className="text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
          Quick Actions
        </h4>
        <div className="space-y-2">
          <button className="w-full p-2 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors">
            Import Image
          </button>
          <button className="w-full p-2 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors">
            Add from Library
          </button>
        </div>
      </div>
    </div>
  )
}
