'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'

interface CanvasElement {
  id: string
  type: 'text' | 'shape' | 'image'
  x: number
  y: number
  width: number
  height: number
  properties: Record<string, any>
}

export function FigmaCanvas() {
  const { isMobile } = useDeviceDetection()
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Create new text element on double click
    if (e.detail === 2) {
      const newElement: CanvasElement = {
        id: `text-${Date.now()}`,
        type: 'text',
        x,
        y,
        width: 200,
        height: 40,
        properties: {
          text: 'Double-click to edit',
          fontSize: 16,
          fontFamily: 'Inter',
          color: 'var(--text-primary)'
        }
      }
      setElements(prev => [...prev, newElement])
      setSelectedElement(newElement.id)
    }
  }, [])

  const handleElementSelect = useCallback((elementId: string) => {
    setSelectedElement(elementId)
  }, [])

  return (
    <div className="canvas-container">
      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className="canvas"
        onClick={handleCanvasClick}
        style={{
          background: `
            radial-gradient(circle at 1px 1px, var(--clay-gray) 1px, transparent 0)
          `,
          backgroundSize: '20px 20px',
          opacity: 0.1
        }}
      >
        {elements.map(element => (
          <motion.div
            key={element.id}
            className={`absolute cursor-pointer ${
              selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height
            }}
            onClick={(e) => {
              e.stopPropagation()
              handleElementSelect(element.id)
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {element.type === 'text' && (
              <div
                contentEditable
                suppressContentEditableWarning
                style={{
                  fontSize: element.properties.fontSize,
                  fontFamily: element.properties.fontFamily,
                  color: element.properties.color,
                  width: '100%',
                  height: '100%',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {element.properties.text}
              </div>
            )}
            
            {element.type === 'shape' && (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: element.properties.fill || 'var(--accent-primary)',
                  borderRadius: element.properties.borderRadius || 0
                }}
              />
            )}
          </motion.div>
        ))}

        {/* Selection Handles */}
        {selectedElement && (
          <div className="selection-handles">
            {[
              { position: 'top-left', cursor: 'nw-resize' },
              { position: 'top-right', cursor: 'ne-resize' },
              { position: 'bottom-left', cursor: 'sw-resize' },
              { position: 'bottom-right', cursor: 'se-resize' }
            ].map(handle => (
              <div
                key={handle.position}
                className={`absolute w-2 h-2 bg-blue-500 border border-white rounded-sm ${handle.position}`}
                style={{ cursor: handle.cursor }}
              />
            ))}
          </div>
        )}
      </div>

      {/* AI Suggestions */}
      {selectedElement && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-4 flex gap-2"
        >
          <div className="ai-chip">
            ✨ Apply rounded corners?
          </div>
          <div className="ai-chip">
            🎨 Switch to brand colors?
          </div>
          <div className="ai-chip">
            📱 Make responsive?
          </div>
        </motion.div>
      )}
    </div>
  )
}