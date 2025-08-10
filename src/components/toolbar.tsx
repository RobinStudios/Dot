'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDesignStore } from '@/store/design-store'

export function Toolbar() {
  const { currentMockup, selectedElements, deleteElement, clearSelection } = useDesignStore()
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const tools = [
    { id: 'select', name: 'Select', icon: '👆', shortcut: 'V' },
    { id: 'text', name: 'Text', icon: '📝', shortcut: 'T' },
    { id: 'shape', name: 'Shape', icon: '⬜', shortcut: 'S' },
    { id: 'image', name: 'Image', icon: '🖼️', shortcut: 'I' },
    { id: 'icon', name: 'Icon', icon: '🔘', shortcut: 'O' },
    { id: 'button', name: 'Button', icon: '🔘', shortcut: 'B' },
    { id: 'video', name: 'Video', icon: '🎥', shortcut: 'V' },
  ]

  const handleToolClick = (toolId: string) => {
    setActiveTool(activeTool === toolId ? null : toolId)
  }

  const handleDelete = () => {
    if (selectedElements.length > 0) {
      selectedElements.forEach((elementId) => {
        deleteElement(elementId)
      })
      clearSelection()
    }
  }

  const handleDuplicate = () => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate selected elements')
  }

  const handleGroup = () => {
    // TODO: Implement group functionality
    console.log('Group selected elements')
  }

  const handleUngroup = () => {
    // TODO: Implement ungroup functionality
    console.log('Ungroup selected elements')
  }

  return (
    <div className="h-12 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between px-4">
      {/* Left Tools */}
      <div className="flex items-center space-x-1">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              activeTool === tool.id
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`${tool.name} (${tool.shortcut})`}
          >
            <span className="text-lg">{tool.icon}</span>
          </motion.button>
        ))}
      </div>

      {/* Center Actions */}
      <div className="flex items-center space-x-2">
        {selectedElements.length > 0 && (
          <>
            <button
              onClick={handleDuplicate}
              className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={handleGroup}
              className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
            >
              Group
            </button>
            <button
              onClick={handleUngroup}
              className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
            >
              Ungroup
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors">
          Undo
        </button>
        <button className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors">
          Redo
        </button>
        <button className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Export
        </button>
      </div>
    </div>
  )
}
