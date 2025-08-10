'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesignStore } from '@/store/design-store'
import { DesignElement } from '@/types'

export function LayersPanel() {
  const { currentMockup, selectedElements, selectElement, deselectElement, deleteElement } = useDesignStore()
  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set())

  if (!currentMockup) {
    return (
      <div className="p-4 text-center text-secondary-500 dark:text-secondary-400">
        No design selected
      </div>
    )
  }

  const toggleLayerExpansion = (layerId: string) => {
    const newExpanded = new Set(expandedLayers)
    if (newExpanded.has(layerId)) {
      newExpanded.delete(layerId)
    } else {
      newExpanded.add(layerId)
    }
    setExpandedLayers(newExpanded)
  }

  const handleLayerClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.metaKey || e.ctrlKey) {
      if (selectedElements.includes(elementId)) {
        deselectElement(elementId)
      } else {
        selectElement(elementId)
      }
    } else {
      selectElement(elementId)
    }
  }

  const handleLayerDelete = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteElement(elementId)
  }

  const getLayerIcon = (type: DesignElement['type']) => {
    switch (type) {
      case 'text':
        return '📝'
      case 'image':
        return '🖼️'
      case 'shape':
        return '⬜'
      case 'icon':
        return '🔘'
      case 'button':
        return '🔘'
      case 'video':
        return '🎥'
      case 'container':
        return '📦'
      default:
        return '❓'
    }
  }

  const renderLayer = (element: DesignElement, depth = 0) => {
    const isSelected = selectedElements.includes(element.id)
    const isExpanded = expandedLayers.has(element.id)
    const hasChildren = element.children && element.children.length > 0

    return (
      <motion.div
        key={element.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className={`group ${depth > 0 ? 'ml-4' : ''}`}
      >
        <div
          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
            isSelected
              ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
              : 'hover:bg-secondary-100 dark:hover:bg-secondary-700'
          }`}
          onClick={(e) => handleLayerClick(element.id, e)}
        >
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleLayerExpansion(element.id)
                }}
                className="w-4 h-4 flex items-center justify-center text-xs"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            <span className="text-sm">{getLayerIcon(element.type)}</span>
            <span className="text-sm font-medium truncate">
              {element.content || `${element.type} ${element.id.slice(-4)}`}
            </span>
          </div>
          
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleLayerDelete(element.id, e)}
              className="w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {element.children?.map((child) => renderLayer(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-secondary-900 dark:text-white">Layers</h3>
          <div className="flex items-center space-x-2">
            <button className="w-6 h-6 flex items-center justify-center text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300">
              👁️
            </button>
            <button className="w-6 h-6 flex items-center justify-center text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300">
              🔒
            </button>
          </div>
        </div>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2">
        <AnimatePresence>
          {currentMockup.elements.length === 0 ? (
            <div className="text-center text-secondary-500 dark:text-secondary-400 py-8">
              <div className="w-12 h-12 mx-auto mb-2 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center">
                <span className="text-xl">📁</span>
              </div>
              <p className="text-sm">No layers yet</p>
              <p className="text-xs">Add elements to see them here</p>
            </div>
          ) : (
            currentMockup.elements.map((element) => renderLayer(element))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center justify-between text-xs text-secondary-500 dark:text-secondary-400">
          <span>{currentMockup.elements.length} layers</span>
          <span>{selectedElements.length} selected</span>
        </div>
      </div>
    </div>
  )
}
