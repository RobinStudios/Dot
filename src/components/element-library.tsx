import { useDesignStore } from '@/store/design-store'
import { DesignElement } from '@/types'

const ELEMENTS: Omit<DesignElement, 'id'>[] = [
  {
    type: 'text',
    position: { x: 100, y: 100 },
    size: { width: 200, height: 50 },
    style: { color: '#1f2937', fontSize: 18 },
    content: 'Text',
  },
  {
    type: 'shape',
    position: { x: 100, y: 200 },
    size: { width: 100, height: 100 },
    style: { backgroundColor: '#3b82f6', borderRadius: 8 },
  },
  {
    type: 'image',
    position: { x: 100, y: 320 },
    size: { width: 120, height: 120 },
    style: {},
    src: '',
  },
  {
    type: 'icon',
    position: { x: 100, y: 460 },
    size: { width: 48, height: 48 },
    style: {},
    content: '🔘',
  },
  {
    type: 'button',
    position: { x: 100, y: 540 },
    size: { width: 120, height: 40 },
    style: { backgroundColor: '#3b82f6', borderRadius: 8 },
    content: 'Button',
  },
  {
    type: 'video',
    position: { x: 100, y: 600 },
    size: { width: 160, height: 90 },
    style: {},
    src: '',
  },
  {
    type: 'container',
    position: { x: 100, y: 700 },
    size: { width: 300, height: 200 },
    style: { backgroundColor: '#f3f4f6', borderRadius: 12 },
    children: [],
  },
]

export function ElementLibrary() {
  const { addElement } = useDesignStore()

  const handleAdd = (element: Omit<DesignElement, 'id'>) => {
    addElement({ ...element, id: `el-${Date.now()}` })
  }

  return (
    <div className="p-4 bg-white dark:bg-secondary-800 rounded-lg shadow-soft">
      <h3 className="font-semibold text-secondary-900 dark:text-white mb-2">Element Library</h3>
      <div className="grid grid-cols-2 gap-3">
        {ELEMENTS.map((el, idx) => (
          <button
            key={idx}
            onClick={() => handleAdd(el)}
            className="flex flex-col items-center justify-center p-3 bg-secondary-100 dark:bg-secondary-700 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
          >
            <span className="text-2xl mb-1">
              {el.type === 'text' && '📝'}
              {el.type === 'shape' && '⬜'}
              {el.type === 'image' && '🖼️'}
              {el.type === 'icon' && '🔘'}
              {el.type === 'button' && '🔘'}
              {el.type === 'video' && '🎥'}
              {el.type === 'container' && '📦'}
            </span>
            <span className="text-xs font-medium capitalize">{el.type}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
