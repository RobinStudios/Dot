'use client'

export function CanvasGrid({ layout, gridSize = 20 }: { layout: any, gridSize?: number }) {
  const cols = layout.columns
  const rows = layout.rows
  const width = cols * 100
  const height = rows * 100
  const vLines = []
  for (let x = 0; x <= width; x += gridSize) {
    vLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={0}
        x2={x}
        y2={height}
        stroke="#e5e7eb"
        strokeWidth={x % 100 === 0 ? 2 : 1}
      />
    )
  }
  const hLines = []
  for (let y = 0; y <= height; y += gridSize) {
    hLines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke="#e5e7eb"
        strokeWidth={y % 100 === 0 ? 2 : 1}
      />
    )
  }
  return (
    <svg className="absolute inset-0 w-full h-full z-0" style={{ pointerEvents: 'none' }}>
      {vLines}
      {hLines}
    </svg>
  )
}
