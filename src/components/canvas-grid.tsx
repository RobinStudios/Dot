'use client'

import { Layout } from '@/types'

interface CanvasGridProps {
  layout: Layout
}

export function CanvasGrid({ layout }: CanvasGridProps) {
  const { columns, rows, gap, padding } = layout

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gap: `${gap}px`,
    padding: `${padding}px`,
    width: '100%',
    height: '100%',
  }

  const gridCells = []
  for (let i = 0; i < columns * rows; i++) {
    gridCells.push(
      <div
        key={i}
        className="border border-secondary-200 dark:border-secondary-700 bg-transparent"
      />
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none">
      <div style={gridStyle}>
        {gridCells}
      </div>
    </div>
  )
}
