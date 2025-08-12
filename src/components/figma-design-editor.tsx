'use client'

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface DesignElement {
  id: string
  type: 'text' | 'rectangle' | 'ellipse' | 'image' | 'frame'
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  opacity?: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  cornerRadius?: number
  text?: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number
  letterSpacing?: number
  children?: DesignElement[]
}

interface FigmaDesignEditorProps {
  elements: DesignElement[]
  onElementsChange: (elements: DesignElement[]) => void
  selectedElementId?: string
  onElementSelect: (id: string) => void
}

export function FigmaDesignEditor({ 
  elements, 
  onElementsChange, 
  selectedElementId, 
  onElementSelect 
}: FigmaDesignEditorProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleElementClick = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation()
    onElementSelect(elementId)
  }

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    const element = elements.find(el => el.id === elementId)
    if (!element) return

    setIsDragging(true)
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y
    })
    onElementSelect(elementId)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !selectedElementId) return

    const newElements = elements.map(element => {
      if (element.id === selectedElementId) {
        return {
          ...element,
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        }
      }
      return element
    })

    onElementsChange(newElements)
  }, [isDragging, selectedElementId, elements, dragStart, onElementsChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle('')
  }, [])

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeHandle(handle)
  }

  const updateElementProperty = (elementId: string, property: string, value: any) => {
    const newElements = elements.map(element => {
      if (element.id === elementId) {
        return { ...element, [property]: value }
      }
      return element
    })
    onElementsChange(newElements)
  }

  const selectedElement = elements.find(el => el.id === selectedElementId)

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: 'var(--clay-gray)' }}>
      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full"
        style={{ background: 'var(--cloud-white)' }}
        onClick={() => onElementSelect('')}
        onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
        onMouseUp={handleMouseUp}
      >
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Design Elements */}
        {elements.map(element => (
          <motion.div
            key={element.id}
            className={`absolute cursor-pointer ${
              selectedElementId === element.id ? 'ring-2 ring-blue-500' : ''
            }`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation || 0}deg)`,
              opacity: element.opacity || 1,
              backgroundColor: element.fill || 'transparent',
              border: element.stroke ? `${element.strokeWidth || 1}px solid ${element.stroke}` : 'none',
              borderRadius: element.cornerRadius || 0,
              fontSize: element.fontSize || 16,
              fontFamily: element.fontFamily || 'Inter, sans-serif',
              fontWeight: element.fontWeight || 'normal',
              textAlign: element.textAlign || 'left',
              lineHeight: element.lineHeight || 1.2,
              letterSpacing: element.letterSpacing || 0,
              display: 'flex',
              alignItems: element.type === 'text' ? 'flex-start' : 'center',
              justifyContent: element.textAlign === 'center' ? 'center' : 
                            element.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: element.type === 'text' ? '4px' : '0'
            }}
            onClick={(e) => handleElementClick(e, element.id)}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            whileHover={{ scale: selectedElementId === element.id ? 1 : 1.02 }}
          >
            {element.type === 'text' && (
              <span style={{ color: element.stroke || '#000' }}>
                {element.text || 'Text'}
              </span>
            )}
            
            {element.type === 'ellipse' && (
              <div 
                className="w-full h-full rounded-full"
                style={{ backgroundColor: element.fill || '#3b82f6' }}
              />
            )}

            {/* Resize Handles */}
            {selectedElementId === element.id && (
              <>
                {/* Corner handles */}
                <div
                  className="absolute -top-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-nw-resize"
                  onMouseDown={(e) => handleResizeStart(e, 'nw')}
                />
                <div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-ne-resize"
                  onMouseDown={(e) => handleResizeStart(e, 'ne')}
                />
                <div
                  className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-500 rounded-full cursor-sw-resize"
                  onMouseDown={(e) => handleResizeStart(e, 'sw')}
                />
                <div
                  className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-500 rounded-full cursor-se-resize"
                  onMouseDown={(e) => handleResizeStart(e, 'se')}
                />
                
                {/* Edge handles */}
                <div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-n-resize"
                  onMouseDown={(e) => handleResizeStart(e, 'n')}
                />
                <div
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-s-resize"
                  onMouseDown={(e) => handleResizeStart(e, 's')}
                />
                <div
                  className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-w-resize"
                  onMouseDown={(e) => handleResizeStart(e, 'w')}
                />
                <div
                  className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full cursor-e-resize"
                  onMouseDown={(e) => handleResizeStart(e, 'e')}
                />
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick Actions Toolbar */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => {
            const newElement: DesignElement = {
              id: `text-${Date.now()}`,
              type: 'text',
              x: 100,
              y: 100,
              width: 200,
              height: 40,
              text: 'New Text',
              fontSize: 16,
              fontFamily: 'Inter, sans-serif',
              stroke: '#000'
            }
            onElementsChange([...elements, newElement])
          }}
          className="btn-secondary text-sm"
        >
          T Text
        </button>
        
        <button
          onClick={() => {
            const newElement: DesignElement = {
              id: `rect-${Date.now()}`,
              type: 'rectangle',
              x: 150,
              y: 150,
              width: 100,
              height: 100,
              fill: '#3b82f6',
              cornerRadius: 8
            }
            onElementsChange([...elements, newElement])
          }}
          className="btn-secondary text-sm"
        >
          ⬜ Rectangle
        </button>
        
        <button
          onClick={() => {
            const newElement: DesignElement = {
              id: `ellipse-${Date.now()}`,
              type: 'ellipse',
              x: 200,
              y: 200,
              width: 80,
              height: 80,
              fill: '#10b981'
            }
            onElementsChange([...elements, newElement])
          }}
          className="btn-secondary text-sm"
        >
          ⭕ Ellipse
        </button>
      </div>

      {/* Element Info */}
      {selectedElement && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow-lg text-xs">
          <div>Type: {selectedElement.type}</div>
          <div>X: {Math.round(selectedElement.x)}, Y: {Math.round(selectedElement.y)}</div>
          <div>W: {Math.round(selectedElement.width)}, H: {Math.round(selectedElement.height)}</div>
        </div>
      )}
    </div>
  )
}