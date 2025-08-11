'use client'

import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { DesignElement } from '@/types/index'

interface MobileOptimizedCanvasProps {
  elements: DesignElement[];
  onElementSelect: (element: DesignElement) => void;
  onElementMove: (elementId: string, position: { x: number; y: number }) => void;
  onElementUpdate?: (elementId: string, updates: Partial<DesignElement>) => void;
  onElementDelete?: (elementId: string) => void;
}

export function MobileOptimizedCanvas({ elements, onElementSelect, onElementMove, onElementUpdate, onElementDelete }: MobileOptimizedCanvasProps) {
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const [quickActionElement, setQuickActionElement] = useState<DesignElement | null>(null)
  const [pinchStartDist, setPinchStartDist] = useState<number | null>(null)
  const [pinchStartScale, setPinchStartScale] = useState<number>(1)
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
      setPinchStartDist(distance)
      setPinchStartScale(scale)
    } else if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 2 && pinchStartDist !== null) {
      // Pinch zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.hypot(
        touch1.clientX - touch2.clientX,
        touch1.clientY - touch2.clientY
      )
      const newScale = Math.max(0.5, Math.min(3, pinchStartScale * (distance / pinchStartDist)))
      setScale(newScale)
    } else if (e.touches.length === 1 && isDragging && dragStart) {
      // Pan canvas
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      })
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setPinchStartDist(null)
  }

  // Touch drag for element move
  const handleElementTouchStart = (element: DesignElement, e: React.TouchEvent) => {
    e.stopPropagation()
    setDraggedElementId(element.id)
    setDragStart({ x: e.touches[0].clientX - (element.position?.x ?? 0), y: e.touches[0].clientY - (element.position?.y ?? 0) })
    setSelectedElement(element.id)
    onElementSelect(element)
    // Long press for quick actions
    if (longPressTimer) clearTimeout(longPressTimer)
    setLongPressTimer(setTimeout(() => {
      setShowQuickActions(true)
      setQuickActionElement(element)
    }, 600))
  }

  const handleElementTouchMove = (element: DesignElement, e: React.TouchEvent) => {
    if (draggedElementId === element.id && dragStart && e.touches.length === 1) {
      const newX = e.touches[0].clientX - dragStart.x
      const newY = e.touches[0].clientY - dragStart.y
      if (onElementMove) onElementMove(element.id, { x: newX, y: newY })
    }
    if (longPressTimer) clearTimeout(longPressTimer)
  }

  const handleElementTouchEnd = (element: DesignElement, e: React.TouchEvent) => {
    setDraggedElementId(null)
    setDragStart(null)
    if (longPressTimer) clearTimeout(longPressTimer)
  }

  const zoomIn = () => setScale(Math.min(scale * 1.2, 3))
  const zoomOut = () => setScale(Math.max(scale / 1.2, 0.5))
  const resetView = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
  }

  const selected = elements.find(el => el.id === selectedElement)

  // Helper to update element property
  const updateProperty = (property: string, value: any) => {
    if (!selectedElement || !onElementUpdate) return
    onElementUpdate(selectedElement, { [property]: value })
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
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={`absolute cursor-pointer ${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: element.position?.x ?? 0,
                  top: element.position?.y ?? 0,
                  width: element.size?.width ?? 100,
                  height: element.size?.height ?? 50,
                  backgroundColor: element.style?.backgroundColor ?? 'transparent',
                  color: element.style?.color ?? '#000',
                  fontSize: element.style?.fontSize ?? 16,
                  fontFamily: element.style?.fontFamily ?? 'inherit',
                  borderRadius: element.style?.borderRadius ?? 0,
                  boxShadow: element.style?.boxShadow ?? '',
                  opacity: element.style?.opacity ?? 1,
                  border: element.style?.borderColor && element.style?.borderWidth ? `${element.style.borderWidth}px solid ${element.style.borderColor}` : undefined,
                  zIndex: element.style && (element.style as any).zIndex !== undefined ? (element.style as any).zIndex : 1,
                  transition: 'all 0.2s',
                }}
                onTouchStart={(e) => handleElementTouchStart(element, e)}
                onTouchMove={(e) => handleElementTouchMove(element, e)}
                onTouchEnd={(e) => handleElementTouchEnd(element, e)}
              >
                {(() => {
                  switch (element.type) {
                    case 'text':
                      return <div className="w-full h-full flex items-center justify-center p-2">{element.content || 'Text Element'}</div>;
                    case 'shape':
                      return <div className="w-full h-full" style={{ backgroundColor: element.style?.backgroundColor || '#3b82f6', borderRadius: element.style?.borderRadius || 0 }} />;
                    case 'image':
                      return <img src={element.src || '/placeholder-image.png'} alt={'Design element'} className="w-full h-full object-cover rounded" />;
                    case 'icon':
                      return <span className="w-full h-full flex items-center justify-center text-2xl">{element.content || '🔘'}</span>;
                    case 'button':
                      return <button className="w-full h-full bg-primary-500 text-white rounded-lg">{element.content || 'Button'}</button>;
                    case 'video':
                      return <video src={element.src} className="w-full h-full object-cover rounded" controls muted />;
                    case 'container':
                      return <div className="w-full h-full border-2 border-dashed border-secondary-300 rounded">{element.children && element.children.length > 0 && (<div className="p-2 text-xs text-secondary-500">Container ({element.children.length} children)</div>)}</div>;
                    default:
                      return null;
                  }
                })()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions (Long Press) */}
      <AnimatePresence>
        {showQuickActions && quickActionElement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => { setShowQuickActions(false); setQuickActionElement(null); }}
          >
            <div className="bg-white rounded-xl shadow-2xl p-6 w-80 flex flex-col gap-3">
              <h3 className="font-semibold text-lg mb-2">Quick Actions</h3>
              <button className="p-2 rounded bg-blue-100 hover:bg-blue-200" onClick={() => { if (onElementUpdate) onElementUpdate(quickActionElement.id, { style: { ...quickActionElement.style, fontSize: (quickActionElement.style?.fontSize || 16) + 8 } }); setShowQuickActions(false); }}>Enlarge Text</button>
              <button className="p-2 rounded bg-green-100 hover:bg-green-200" onClick={() => { if (onElementUpdate) onElementUpdate(quickActionElement.id, { style: { ...quickActionElement.style }, position: { ...quickActionElement.position, z: (quickActionElement.position?.z || 1) + 1 } }); setShowQuickActions(false); }}>Bring Forward</button>
              <button className="p-2 rounded bg-yellow-100 hover:bg-yellow-200" onClick={() => { if (onElementUpdate) onElementUpdate(quickActionElement.id, { style: { ...quickActionElement.style, fontWeight: 700 } }); setShowQuickActions(false); }}>Bold Style</button>
              <button className="p-2 rounded bg-purple-100 hover:bg-purple-200" onClick={() => { setSelectedElement(quickActionElement.id); setShowQuickActions(false); }}>Edit Properties</button>
              <button className="p-2 rounded bg-red-100 hover:bg-red-200" onClick={() => { if (onElementDelete) onElementDelete(quickActionElement.id); setShowQuickActions(false); }}>Delete</button>
              <button className="mt-2 p-2 rounded bg-gray-200 hover:bg-gray-300" onClick={() => { setShowQuickActions(false); }}>Cancel</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
              {element.type === 'text' && (
                <div className="w-full h-full flex items-center justify-center p-2">
                  {element.content || element.text || 'Text Element'}
                </div>
              )}
              {element.type === 'shape' && (
                <div 
                  className="w-full h-full"
                  style={{
                    backgroundColor: element.style?.backgroundColor || element.fill || '#3b82f6',
                    borderRadius: element.style?.borderRadius || element.borderRadius || 0
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
              {element.type === 'icon' && (
                <span className="w-full h-full flex items-center justify-center text-2xl">{element.content || '🔘'}</span>
              )}
              {element.type === 'button' && (
                <button className="w-full h-full bg-primary-500 text-white rounded-lg">
                  {element.content || 'Button'}
                </button>
              )}
              {element.type === 'video' && (
                <video src={element.src} className="w-full h-full object-cover rounded" controls muted />
              )}
              {element.type === 'container' && (
                <div className="w-full h-full border-2 border-dashed border-secondary-300 rounded">
                  {element.children && element.children.length > 0 && (
                    <div className="p-2 text-xs text-secondary-500">
                      Container ({element.children.length} children)
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Element Properties - Figma-level editing */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-20 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10"
          >
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
              {/* Font */}
              {(selected.type === 'text' || selected.type === 'button') && <>
                <label className="col-span-2 font-semibold">Font Family</label>
                <input className="p-2 bg-gray-100 rounded col-span-2" value={selected.style?.fontFamily || ''} onChange={e => updateProperty('style', { ...selected.style, fontFamily: e.target.value })} placeholder="Font Family" />
                <label>Font Size</label>
                <input type="number" className="p-2 bg-gray-100 rounded" value={selected.style?.fontSize || 16} onChange={e => updateProperty('style', { ...selected.style, fontSize: Number(e.target.value) })} />
                <label>Font Weight</label>
                <input type="number" className="p-2 bg-gray-100 rounded" value={selected.style?.fontWeight || 400} onChange={e => updateProperty('style', { ...selected.style, fontWeight: Number(e.target.value) })} />
                <label>Text Align</label>
                <select className="p-2 bg-gray-100 rounded" value={selected.style?.textAlign || 'left'} onChange={e => updateProperty('style', { ...selected.style, textAlign: e.target.value })}>
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </>}
              {/* Layout */}
              <label>X</label>
              <input type="number" className="p-2 bg-gray-100 rounded" value={selected.position?.x ?? selected.x ?? 0} onChange={e => updateProperty('position', { ...selected.position, x: Number(e.target.value) })} />
              <label>Y</label>
              <input type="number" className="p-2 bg-gray-100 rounded" value={selected.position?.y ?? selected.y ?? 0} onChange={e => updateProperty('position', { ...selected.position, y: Number(e.target.value) })} />
              <label>Width</label>
              <input type="number" className="p-2 bg-gray-100 rounded" value={selected.size?.width ?? selected.width ?? 100} onChange={e => updateProperty('size', { ...selected.size, width: Number(e.target.value) })} />
              <label>Height</label>
              <input type="number" className="p-2 bg-gray-100 rounded" value={selected.size?.height ?? selected.height ?? 50} onChange={e => updateProperty('size', { ...selected.size, height: Number(e.target.value) })} />
              {/* Color */}
              <label>Color</label>
              <input type="color" className="p-2 bg-gray-100 rounded" value={selected.style?.color || '#000000'} onChange={e => updateProperty('style', { ...selected.style, color: e.target.value })} />
              <label>Background</label>
              <input type="color" className="p-2 bg-gray-100 rounded" value={selected.style?.backgroundColor || '#ffffff'} onChange={e => updateProperty('style', { ...selected.style, backgroundColor: e.target.value })} />
              {/* Icon */}
              {selected.type === 'icon' && <>
                <label>Icon</label>
                <input className="p-2 bg-gray-100 rounded" value={selected.content || ''} onChange={e => updateProperty('content', e.target.value)} placeholder="Icon (emoji or name)" />
              </>}
              {/* Animation */}
              <label>Animation</label>
              <input className="p-2 bg-gray-100 rounded" value={selected.animation?.type || ''} onChange={e => updateProperty('animation', { ...selected.animation, type: e.target.value })} placeholder="Animation type (e.g. fade, slide)" />
              {/* Sound */}
              <label>Sound</label>
              <input className="p-2 bg-gray-100 rounded" value={selected.sound || ''} onChange={e => updateProperty('sound', e.target.value)} placeholder="Sound (URL or desc)" />
              {/* Delete */}
              <button className="col-span-2 p-2 bg-red-100 rounded text-red-600 mt-2" onClick={() => { if (onElementDelete) onElementDelete(selected.id); setSelectedElement(null); }}>Delete Element</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}