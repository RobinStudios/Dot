'use client'

import { motion } from 'framer-motion'
import { DesignElement } from '@/types'

interface ElementRendererProps {
  element: DesignElement
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
}

export function ElementRenderer({ element, isSelected, onClick }: ElementRendererProps) {
  const { type, position, size, style, content, src, children } = element

  const baseStyles = {
    position: 'absolute' as const,
    left: position.x,
    top: position.y,
    width: size.width,
    height: size.height,
    ...style,
  }

  const renderElement = () => {
    switch (type) {
      case 'text':
        return (
          <div
            className="flex items-center justify-center p-2 cursor-pointer select-none"
            style={{
              fontFamily: style.fontFamily || 'Inter',
              fontSize: style.fontSize || 16,
              fontWeight: style.fontWeight || 400,
              lineHeight: style.lineHeight || 1.5,
              color: style.color || '#1f2937',
              textAlign: style.textAlign || 'left',
            }}
          >
            {content || 'Text Element'}
          </div>
        )

      case 'image':
        return (
          <div className="w-full h-full cursor-pointer overflow-hidden rounded">
            {src ? (
              <img
                src={src}
                alt={content || 'Image'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center">
                <span className="text-secondary-500">📷</span>
              </div>
            )}
          </div>
        )

      case 'shape':
        return (
          <div
            className="cursor-pointer"
            style={{
              backgroundColor: style.backgroundColor || '#3b82f6',
              borderRadius: style.borderRadius ? `${style.borderRadius}px` : '0',
              border: style.borderColor && style.borderWidth 
                ? `${style.borderWidth}px solid ${style.borderColor}` 
                : 'none',
            }}
          />
        )

      case 'icon':
        return (
          <div className="w-full h-full flex items-center justify-center cursor-pointer">
            <span className="text-2xl">{content || '🔘'}</span>
          </div>
        )

      case 'button':
        return (
          <button
            className="w-full h-full bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg cursor-pointer transition-colors"
            style={{
              backgroundColor: style.backgroundColor || '#3b82f6',
              borderRadius: style.borderRadius ? `${style.borderRadius}px` : '8px',
            }}
          >
            {content || 'Button'}
          </button>
        )

      case 'video':
        return (
          <div className="w-full h-full cursor-pointer overflow-hidden rounded">
            {src ? (
              <video
                src={src}
                className="w-full h-full object-cover"
                controls
                muted
              />
            ) : (
              <div className="w-full h-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center">
                <span className="text-secondary-500">🎥</span>
              </div>
            )}
          </div>
        )

      case 'container':
        return (
          <div
            className="w-full h-full cursor-pointer border-2 border-dashed border-secondary-300 dark:border-secondary-600"
            style={{
              backgroundColor: style.backgroundColor || 'transparent',
              borderRadius: style.borderRadius ? `${style.borderRadius}px` : '0',
            }}
          >
            {children && children.length > 0 && (
              <div className="p-2 text-xs text-secondary-500">
                Container ({children.length} children)
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="w-full h-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center cursor-pointer">
            <span className="text-secondary-500">?</span>
          </div>
        )
    }
  }

  return (
    <motion.div
      style={baseStyles}
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
    >
      {renderElement()}
    </motion.div>
  )
}
