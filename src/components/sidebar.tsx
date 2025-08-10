'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesignStore } from '@/store/design-store'
import { LayersPanel } from './layers-panel'
import { PropertiesPanel } from './properties-panel'
import { ToolsPanel } from './tools-panel'
import { DesignSystemPanel } from './design-system-panel'

type PanelType = 'layers' | 'properties' | 'tools' | 'design-system'

export function Sidebar() {
  const [activePanel, setActivePanel] = useState<PanelType>('layers')
  const { currentMockup, selectedElements } = useDesignStore()

  const panels = [
    { id: 'layers' as PanelType, name: 'Layers', icon: '📁' },
    { id: 'properties' as PanelType, name: 'Properties', icon: '⚙️' },
    { id: 'tools' as PanelType, name: 'Tools', icon: '🛠️' },
    { id: 'design-system' as PanelType, name: 'Design System', icon: '🎨' },
  ]

  const renderPanel = () => {
    switch (activePanel) {
      case 'layers':
        return <LayersPanel />
      case 'properties':
        return <PropertiesPanel />
      case 'tools':
        return <ToolsPanel />
      case 'design-system':
        return <DesignSystemPanel />
      default:
        return <LayersPanel />
    }
  }

  return (
    <div className="w-80 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 flex flex-col">
      {/* Panel Tabs */}
      <div className="flex border-b border-secondary-200 dark:border-secondary-700">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
              activePanel === panel.id
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white hover:bg-secondary-50 dark:hover:bg-secondary-700'
            }`}
          >
            <span>{panel.icon}</span>
            <span>{panel.name}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderPanel()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="h-8 bg-secondary-50 dark:bg-secondary-700 border-t border-secondary-200 dark:border-secondary-600 flex items-center justify-between px-3 text-xs text-secondary-500 dark:text-secondary-400">
        <span>
          {currentMockup ? `${currentMockup.elements.length} elements` : 'No design'}
        </span>
        <span>
          {selectedElements.length > 0 ? `${selectedElements.length} selected` : ''}
        </span>
      </div>
    </div>
  )
}
