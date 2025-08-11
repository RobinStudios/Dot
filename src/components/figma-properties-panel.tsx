'use client'

import { useState } from 'react'

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
}

interface FigmaPropertiesPanelProps {
  selectedElement: DesignElement | null
  onElementUpdate: (elementId: string, property: string, value: any) => void
}

export function FigmaPropertiesPanel({ selectedElement, onElementUpdate }: FigmaPropertiesPanelProps) {
  const [colorPickerOpen, setColorPickerOpen] = useState(false)

  if (!selectedElement) {
    return (
      <div className="w-80 p-4" style={{ background: 'var(--graphite-mist)', color: 'var(--cloud-white)' }}>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎨</div>
          <p className="text-sm opacity-60">Select an element to edit properties</p>
        </div>
      </div>
    )
  }

  const fontFamilies = [
    'Inter, sans-serif',
    'Roboto, sans-serif',
    'Helvetica, Arial, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Courier New, monospace',
    'JetBrains Mono, monospace'
  ]

  const fontWeights = ['100', '200', '300', '400', '500', '600', '700', '800', '900']

  const presetColors = [
    '#000000', '#ffffff', '#f3f4f6', '#9ca3af', '#6b7280',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ]

  return (
    <div className="w-80 h-full overflow-y-auto" style={{ background: 'var(--graphite-mist)', color: 'var(--cloud-white)' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--clay-gray)' }}>
        <h3 className="font-semibold mb-2">Design Properties</h3>
        <div className="text-sm opacity-60 capitalize">{selectedElement.type} Element</div>
      </div>

      <div className="p-4 space-y-6">
        {/* Position & Size */}
        <div>
          <h4 className="font-medium mb-3">Position & Size</h4>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs opacity-60 mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onElementUpdate(selectedElement.id, 'x', Number(e.target.value))}
                className="w-full p-2 rounded text-sm"
                style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
              />
            </div>
            <div>
              <label className="block text-xs opacity-60 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onElementUpdate(selectedElement.id, 'y', Number(e.target.value))}
                className="w-full p-2 rounded text-sm"
                style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs opacity-60 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onElementUpdate(selectedElement.id, 'width', Number(e.target.value))}
                className="w-full p-2 rounded text-sm"
                style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
              />
            </div>
            <div>
              <label className="block text-xs opacity-60 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onElementUpdate(selectedElement.id, 'height', Number(e.target.value))}
                className="w-full p-2 rounded text-sm"
                style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div>
          <h4 className="font-medium mb-3">Appearance</h4>
          
          {/* Fill Color */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2">Fill</label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border cursor-pointer"
                style={{ 
                  backgroundColor: selectedElement.fill || '#transparent',
                  borderColor: 'var(--fog-gray)'
                }}
                onClick={() => setColorPickerOpen(!colorPickerOpen)}
              />
              <input
                type="text"
                value={selectedElement.fill || ''}
                onChange={(e) => onElementUpdate(selectedElement.id, 'fill', e.target.value)}
                placeholder="#000000"
                className="flex-1 p-2 rounded text-sm"
                style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
              />
            </div>
            
            {/* Color Presets */}
            {colorPickerOpen && (
              <div className="mt-2 grid grid-cols-6 gap-1">
                {presetColors.map(color => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded border"
                    style={{ backgroundColor: color, borderColor: 'var(--fog-gray)' }}
                    onClick={() => {
                      onElementUpdate(selectedElement.id, 'fill', color)
                      setColorPickerOpen(false)
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Stroke */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2">Stroke</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={selectedElement.stroke || ''}
                onChange={(e) => onElementUpdate(selectedElement.id, 'stroke', e.target.value)}
                placeholder="#000000"
                className="flex-1 p-2 rounded text-sm"
                style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
              />
              <input
                type="number"
                value={selectedElement.strokeWidth || 1}
                onChange={(e) => onElementUpdate(selectedElement.id, 'strokeWidth', Number(e.target.value))}
                min="0"
                max="20"
                className="w-16 p-2 rounded text-sm"
                style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
              />
            </div>
          </div>

          {/* Corner Radius */}
          {(selectedElement.type === 'rectangle' || selectedElement.type === 'frame') && (
            <div className="mb-3">
              <label className="block text-xs opacity-60 mb-2">Corner Radius</label>
              <input
                type="range"
                min="0"
                max="50"
                value={selectedElement.cornerRadius || 0}
                onChange={(e) => onElementUpdate(selectedElement.id, 'cornerRadius', Number(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-center mt-1">{selectedElement.cornerRadius || 0}px</div>
            </div>
          )}

          {/* Opacity */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedElement.opacity || 1}
              onChange={(e) => onElementUpdate(selectedElement.id, 'opacity', Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-center mt-1">{Math.round((selectedElement.opacity || 1) * 100)}%</div>
          </div>

          {/* Rotation */}
          <div className="mb-3">
            <label className="block text-xs opacity-60 mb-2">Rotation</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={selectedElement.rotation || 0}
              onChange={(e) => onElementUpdate(selectedElement.id, 'rotation', Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-center mt-1">{selectedElement.rotation || 0}°</div>
          </div>
        </div>

        {/* Typography (Text elements only) */}
        {selectedElement.type === 'text' && (
          <div>
            <h4 className="font-medium mb-3">Typography</h4>
            
            {/* Text Content */}
            <div className="mb-3">
              <label className="block text-xs opacity-60 mb-2">Text</label>
              <textarea
                value={selectedElement.text || ''}
                onChange={(e) => onElementUpdate(selectedElement.id, 'text', e.target.value)}
                className="w-full p-2 rounded text-sm resize-none"
                style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
                rows={2}
              />
            </div>

            {/* Font Family */}
            <div className="mb-3">
              <label className="block text-xs opacity-60 mb-2">Font Family</label>
              <select
                value={selectedElement.fontFamily || 'Inter, sans-serif'}
                onChange={(e) => onElementUpdate(selectedElement.id, 'fontFamily', e.target.value)}
                className="w-full p-2 rounded text-sm"
                style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>{font.split(',')[0]}</option>
                ))}
              </select>
            </div>

            {/* Font Size & Weight */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div>
                <label className="block text-xs opacity-60 mb-2">Size</label>
                <input
                  type="number"
                  value={selectedElement.fontSize || 16}
                  onChange={(e) => onElementUpdate(selectedElement.id, 'fontSize', Number(e.target.value))}
                  min="8"
                  max="200"
                  className="w-full p-2 rounded text-sm"
                  style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
                />
              </div>
              <div>
                <label className="block text-xs opacity-60 mb-2">Weight</label>
                <select
                  value={selectedElement.fontWeight || '400'}
                  onChange={(e) => onElementUpdate(selectedElement.id, 'fontWeight', e.target.value)}
                  className="w-full p-2 rounded text-sm"
                  style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
                >
                  {fontWeights.map(weight => (
                    <option key={weight} value={weight}>{weight}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Text Alignment */}
            <div className="mb-3">
              <label className="block text-xs opacity-60 mb-2">Alignment</label>
              <div className="flex gap-1">
                {['left', 'center', 'right'].map(align => (
                  <button
                    key={align}
                    onClick={() => onElementUpdate(selectedElement.id, 'textAlign', align)}
                    className={`flex-1 p-2 rounded text-sm ${
                      selectedElement.textAlign === align ? 'bg-blue-600' : 'bg-var(--clay-gray)'
                    }`}
                  >
                    {align === 'left' ? '⬅️' : align === 'center' ? '↔️' : '➡️'}
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height & Letter Spacing */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs opacity-60 mb-2">Line Height</label>
                <input
                  type="number"
                  value={selectedElement.lineHeight || 1.2}
                  onChange={(e) => onElementUpdate(selectedElement.id, 'lineHeight', Number(e.target.value))}
                  min="0.5"
                  max="3"
                  step="0.1"
                  className="w-full p-2 rounded text-sm"
                  style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
                />
              </div>
              <div>
                <label className="block text-xs opacity-60 mb-2">Letter Spacing</label>
                <input
                  type="number"
                  value={selectedElement.letterSpacing || 0}
                  onChange={(e) => onElementUpdate(selectedElement.id, 'letterSpacing', Number(e.target.value))}
                  min="-5"
                  max="10"
                  step="0.1"
                  className="w-full p-2 rounded text-sm"
                  style={{ background: 'var(--clay-gray)', border: '1px solid var(--fog-gray)' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t" style={{ borderColor: 'var(--clay-gray)' }}>
          <div className="flex gap-2">
            <button className="btn-secondary text-sm flex-1">Duplicate</button>
            <button className="btn-secondary text-sm flex-1">Delete</button>
          </div>
        </div>
      </div>
    </div>
  )
}