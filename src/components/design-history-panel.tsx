import { useDesignHistory } from '@/hooks/useDesignHistory'
import { useState } from 'react'
import { DesignMockup } from '@/types'

interface DesignHistoryPanelProps {
  designId: string
  onRestore: (mockup: DesignMockup) => void
}

export function DesignHistoryPanel({ designId, onRestore }: DesignHistoryPanelProps) {
  const { history, loading, error, restoreVersion } = useDesignHistory(designId)
  const [restoring, setRestoring] = useState<string | null>(null)

  if (loading) return <div className="p-4">Loading history...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>

  return (
    <div className="p-4 space-y-3">
      <h3 className="font-semibold mb-2">Design History</h3>
      {history.length === 0 && <div>No history found.</div>}
      <ul className="space-y-2">
        {history.map(version => (
          <li key={version.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded p-2">
            <div>
              <div className="font-medium">{version.title || 'Untitled'}</div>
              <div className="text-xs text-gray-500">{new Date(version.updatedAt).toLocaleString()}</div>
            </div>
            <button
              className="btn-primary text-xs"
              disabled={restoring === version.id}
              onClick={async () => {
                setRestoring(version.id)
                const result = await restoreVersion(version.id)
                if (result && result.mockup) onRestore(result.mockup)
                setRestoring(null)
              }}
            >
              {restoring === version.id ? 'Restoring...' : 'Restore'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
