'use client'

import { useState } from 'react'
import { motion, Reorder } from 'framer-motion'

interface DesignElement {
  id: string
  type: 'text' | 'rectangle' | 'ellipse' | 'image' | 'frame'
  x: number
  y: number
  width: number
  height: number
  text?: string
  fill?: string
  visible?: boolean
  locked?: boolean
  children?: DesignElement[]
}

interface FigmaLayersPanelProps {
  elements: DesignElement[]
  selectedElementId?: string
  onElementSelect: (id: string) => void
  onElementsReorder: (elements: DesignElement[]) => void
  onElementUpdate: (elementId: string, property: string, value: any) => void
  onElementDelete: (elementId: string) => void
}

export function FigmaLayersPanel({ 
  elements, 
  selectedElementId, 
  onElementSelect, 
  onElementsReorder,
  onElementUpdate,
  onElementDelete
}: FigmaLayersPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return '📝'
      case 'rectangle': return '⬜'
      case 'ellipse': return '⭕'
      case 'image': return '🖼️'
      case 'frame': return '📦'
      default: return '🔷'
    }
  }

  const getElementName = (element: DesignElement) => {
    if (element.type === 'text' && element.text) {
      return element.text.length > 20 ? element.text.substring(0, 20) + '...' : element.text
    }
    return `${element.type.charAt(0).toUpperCase() + element.type.slice(1)}`
  }

  const toggleGroupExpanded = (groupId: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId)
    } else {
      newExpanded.add(groupId)
    }
    setExpandedGroups(newExpanded)
  }

  const LayerItem = ({ element, depth = 0 }: { element: DesignElement; depth?: number }) => (
    <motion.div
      key={element.id}
      className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
        selectedElementId === element.id 
          ? 'bg-blue-600 text-white' 
          : 'hover:bg-var(--clay-gray)'
      }`}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
      onClick={() => onElementSelect(element.id)}
      whileHover={{ x: 2 }}
    >
      {/* Expand/Collapse for groups */}
      {element.children && element.children.length > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleGroupExpanded(element.id)
          }}
          className="w-4 h-4 flex items-center justify-center text-xs"
        >
          {expandedGroups.has(element.id) ? '▼' : '▶'}
        </button>
      )}

      {/* Element Icon */}
      <span className="text-sm">{getElementIcon(element.type)}</span>

      {/* Element Name */}
      <span className="flex-1 text-sm truncate">{getElementName(element)}</span>

      {/* Visibility Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onElementUpdate(element.id, 'visible', !(element.visible ?? true))
        }}
        className="w-4 h-4 flex items-center justify-center text-xs opacity-60 hover:opacity-100"
      >
        {element.visible !== false ? '👁️' : '🙈'}
      </button>

      {/* Lock Toggle */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onElementUpdate(element.id, 'locked', !(element.locked ?? false))
        }}
        className="w-4 h-4 flex items-center justify-center text-xs opacity-60 hover:opacity-100"
      >
        {element.locked ? '🔒' : '🔓'}
      </button>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onElementDelete(element.id)
        }}
        className="w-4 h-4 flex items-center justify-center text-xs opacity-60 hover:opacity-100 hover:text-red-500"
      >
        🗑️
      </button>
    </motion.div>
  )

  return (
    <div className="w-80 h-full flex flex-col" style={{ background: 'var(--graphite-mist)', color: 'var(--cloud-white)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--clay-gray)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Layers</h3>
          <div className="flex gap-1">
            <button className="btn-secondary text-xs">Group</button>
            <button className="btn-secondary text-xs">Frame</button>
          </div>
        </div>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search layers..."
          className="w-full p-2 rounded text-sm"
          style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
        />
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto p-2">
        {elements.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm opacity-60">No layers yet</p>
            <p className="text-xs opacity-40 mt-1">Add elements to see them here</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={elements}
            onReorder={onElementsReorder}
            className="space-y-1"
          >
            {elements.map((element) => (
              <Reorder.Item key={element.id} value={element}>
                <LayerItem element={element} />
                
                {/* Child elements */}
                {element.children && 
                 element.children.length > 0 && 
                 expandedGroups.has(element.id) && (
                  <div className="ml-4 space-y-1">
                    {element.children.map((child) => (
                      <LayerItem key={child.id} element={child} depth={1} />
                    ))}
                  </div>
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Layer Actions */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--clay-gray)' }}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button className="btn-secondary text-sm">Select All</button>
          <button className="btn-secondary text-sm">Deselect</button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button className="btn-secondary text-sm">Copy</button>
          <button className="btn-secondary text-sm">Paste</button>
          <button className="btn-secondary text-sm">Duplicate</button>
        </div>
      </div>

      {/* Layer Info */}
      {selectedElementId && (
        <div className="p-3 border-t text-xs" style={{ borderColor: 'var(--clay-gray)', background: 'var(--clay-gray)' }}>
          <div className="opacity-60">Selected Layer</div>
          <div className="font-medium">
            {elements.find(el => el.id === selectedElementId)?.type || 'Unknown'}
          </div>
        </div>
      )}
    </div>
  )
}