
import * as React from 'react'
'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useDesignStore } from '@/store/design-store'
import { DesignElement } from '@/types'
import { ElementRenderer } from './element-renderer'
import { CanvasGrid } from './canvas-grid'
import { DesignHistoryPanel } from './design-history-panel'

  const [showHistory, setShowHistory] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const { currentMockup, selectedElements, selectElement, deselectElement, clearSelection, updateElement } = useDesignStore()
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [snapToGrid, setSnapToGrid] = useState(true)
  const gridSize = 20

  // Drag handlers
  const handleElementMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, elementId: string) => {
    e.stopPropagation();
    if (!currentMockup) return;
    const element = currentMockup.elements.find((el) => el.id === elementId);
    if (!element) return;
    setDraggedId(elementId);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y,
    });
    // Select the element if not already selected
    if (!selectedElements.includes(elementId)) {
      clearSelection();
      selectElement(elementId);
    }
  };

  useEffect(() => {
    if (!isDragging || !draggedId) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!currentMockup) return;
      let x = (e.clientX - dragOffset.x);
      let y = (e.clientY - dragOffset.y);
      if (snapToGrid) {
        x = Math.round(x / gridSize) * gridSize;
        y = Math.round(y / gridSize) * gridSize;
      }
      updateElement(draggedId, { position: { ...currentMockup.elements.find((el: DesignElement) => el.id === draggedId)?.position, x, y } });
    };
    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedId(null);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, draggedId, dragOffset, snapToGrid, currentMockup, updateElement]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [clearSelection])

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === canvasRef.current) {
      clearSelection()
    }
  }

  const handleElementClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, elementId: string) => {
    e.stopPropagation()
    
    if (e.metaKey || e.ctrlKey) {
      // Multi-select
      if (selectedElements.includes(elementId)) {
        deselectElement(elementId)
      } else {
        selectElement(elementId)
      }
    } else {
      // Single select
      clearSelection()
      selectElement(elementId)
    }
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom((prev) => Math.max(0.1, Math.min(3, prev * delta)))
    }
  }

  if (!currentMockup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-secondary-100 dark:bg-secondary-800">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
            No Design Selected
          </h3>
          <p className="text-secondary-500 dark:text-secondary-400">
            Create a new design or select one from the gallery
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-secondary-50 dark:bg-secondary-900">
      {/* Canvas Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-white dark:bg-secondary-800 rounded-lg shadow-soft p-2">
        <button
          onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary-100 dark:hover:bg-secondary-700"
        >
          -
        </button>
        <span className="text-sm font-medium min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.1))}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-secondary-100 dark:hover:bg-secondary-700"
        >
          +
        </button>
        <button
          onClick={() => setZoom(1)}
          className="text-xs px-2 py-1 bg-secondary-100 dark:bg-secondary-700 rounded hover:bg-secondary-200 dark:hover:bg-secondary-600"
        >
          Reset
        </button>
        <button
          onClick={() => setShowHistory(true)}
          className="text-xs px-2 py-1 bg-secondary-200 dark:bg-secondary-700 rounded hover:bg-secondary-300 dark:hover:bg-secondary-600 ml-2"
        >
          History
        </button>
      </div>
      {/* Design History Modal */}
      {showHistory && currentMockup && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-secondary-900 rounded-lg shadow-xl w-[400px] max-h-[80vh] overflow-y-auto relative">
            <button
              className="absolute top-2 right-2 text-xs px-2 py-1 bg-secondary-200 dark:bg-secondary-700 rounded hover:bg-secondary-300 dark:hover:bg-secondary-600"
              onClick={() => setShowHistory(false)}
            >
              Close
            </button>
            <DesignHistoryPanel
              designId={currentMockup.id}
              onRestore={(mockup) => {
                // Optionally update the current mockup in the store
                setShowHistory(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full relative overflow-auto"
        onClick={handleCanvasClick}
        onWheel={handleWheel}
      >
        <div
          className="relative bg-white dark:bg-secondary-800 shadow-large mx-auto my-8"
          style={{
            width: `${currentMockup.layout.columns * 100}px`,
            height: `${currentMockup.layout.rows * 100}px`,
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center',
          }}
        >
          {/* Grid Background */}
          <CanvasGrid layout={currentMockup.layout} />

          {/* Design Elements */}
          {currentMockup.elements.map((element) => (
            <div
              key={element.id}
              style={{
                zIndex: selectedElements.includes(element.id) ? 10 : 1,
                position: 'absolute',
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                height: element.size.height,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, element.id)}
            >
              <ElementRenderer
                element={element}
                isSelected={selectedElements.includes(element.id)}
                onClick={(e) => handleElementClick(e, element.id)}
              />
            </div>
          ))}

          {/* Selection Overlay */}
          {selectedElements.length > 0 && (
            <div className="absolute inset-0 pointer-events-none">
              {selectedElements.map((elementId: string) => {
                const element = currentMockup.elements.find((e: DesignElement) => e.id === elementId)
                if (!element) return null

                return (
                  <motion.div
                    key={elementId}
                    className="absolute border-2 border-primary-500 bg-primary-500 bg-opacity-10"
                    style={{
                      left: element.position.x,
                      top: element.position.y,
                      width: element.size.width,
                      height: element.size.height,
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Canvas Info */}
      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-secondary-800 rounded-lg shadow-soft p-3">
        <div className="text-sm text-secondary-600 dark:text-secondary-400">
          <div>Canvas: {currentMockup.layout.columns}×{currentMockup.layout.rows}</div>
          <div>Elements: {currentMockup.elements.length}</div>
          <div>Selected: {selectedElements.length}</div>
          <div>Grid Snap: {snapToGrid ? 'On' : 'Off'}</div>
        </div>
      </div>
    </div>
  )
}
