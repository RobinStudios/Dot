import { useState, useEffect } from 'react'
import { DesignMockup } from '@/types'

export function useDesignHistory(designId: string) {
  const [history, setHistory] = useState<DesignMockup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!designId) return
    setLoading(true)
    fetch(`/api/designs/history?designId=${designId}`)
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || [])
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to load history')
        setLoading(false)
      })
  }, [designId])

  const restoreVersion = async (versionId: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/designs/history/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designId, versionId })
      })
      const data = await res.json()
      setLoading(false)
      return data
    } catch (err) {
      setError('Failed to restore version')
      setLoading(false)
      return null
    }
  }

  return { history, loading, error, restoreVersion }
}
