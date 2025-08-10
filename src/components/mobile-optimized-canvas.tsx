'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MobileOptimizedCanvasProps {
  elements: any[]
  onElementSelect: (element: any) => void
  onElementMove: (elementId: string, position: { x: number; y: number }) => void
}

export function MobileOptimizedCanvas({ elements, onElementSelect, onElementMove }: MobileOptimizedCanvasProps) {
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      )
      // Store initial distance for zoom calculation
    } else if (e.touches.length === 1) {
      setIsDragging(true)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    
    if (e.touches.length === 2) {
      // Handle pinch zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      )
      // Calculate zoom based on distance change
    } else if (e.touches.length === 1 && isDragging) {
      // Handle pan
      const touch = e.touches[0]
      const rect = canvasRef.current?.getBoundingClientRect()
      if (rect) {
        setPan({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        })
      }
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleElementTap = (element: any, e: React.TouchEvent) => {
    e.stopPropagation()
    setSelectedElement(element.id)
    onElementSelect(element)
  }

  const zoomIn = () => setScale(Math.min(scale * 1.2, 3))
  const zoomOut = () => setScale(Math.max(scale / 1.2, 0.5))
  const resetView = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <div className="relative h-full bg-gray-100 overflow-hidden">
      {/* Mobile Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={zoomIn}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${scale}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: 'center center'
        }}
      >
        {/* Design Canvas Background */}
        <div className="absolute inset-0 bg-white shadow-lg mx-4 my-8 rounded-lg">
          {/* Grid Pattern */}
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
          {elements.map((element) => (
            <motion.div
              key={element.id}
              className={`absolute cursor-pointer ${
                selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: element.x || 0,
                top: element.y || 0,
                width: element.width || 100,
                height: element.height || 50,
                backgroundColor: element.backgroundColor || 'transparent',
                color: element.color || '#000',
                fontSize: element.fontSize || 16,
                fontFamily: element.fontFamily || 'inherit'
              }}
              onTouchStart={(e) => handleElementTap(element, e)}
              whileTap={{ scale: 0.95 }}
            >
              {element.type === 'text' && (
                <div className="w-full h-full flex items-center justify-center p-2">
                  {element.content || 'Text Element'}
                </div>
              )}
              {element.type === 'shape' && (
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundColor: element.fill || '#3b82f6',
                    borderRadius: element.borderRadius || 0
                  }}
                />
              )}
              {element.type === 'image' && (
                <img 
                  src={element.src || '/placeholder-image.png'} 
                  alt={element.alt || 'Design element'}
                  className="w-full h-full object-cover rounded"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Element Properties */}
      {selectedElement && (
        <div className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Element Properties</h3>
            <button
              onClick={() => setSelectedElement(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button className="p-2 bg-gray-100 rounded text-left">Color</button>
            <button className="p-2 bg-gray-100 rounded text-left">Size</button>
            <button className="p-2 bg-gray-100 rounded text-left">Position</button>
            <button className="p-2 bg-gray-100 rounded text-left">Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}