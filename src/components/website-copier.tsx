'use client'

import { useState } from 'react'



interface WebsiteCopierProps {
  onWebsiteCopied: (template: any) => void
}

export function WebsiteCopier({ onWebsiteCopied }: WebsiteCopierProps) {
  const [url, setUrl] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [method, setMethod] = useState<'url' | 'screenshot'>('url')

  const handleCopyWebsite = async () => {
    if (!url && !screenshot) return

    setIsProcessing(true)
    try {
      const formData = new FormData()
      
      if (method === 'url') {
        formData.append('url', url)
        formData.append('method', 'wget')
      } else {
        formData.append('screenshot', screenshot!)
        formData.append('method', 'screenshot')
      }

      const response = await fetch('/api/website/copy', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.success) {
        onWebsiteCopied(result.template)
      }
    } catch (error) {
      console.error('Website copying failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="p-4 space-y-4" style={{ background: 'var(--graphite-mist)' }}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">🌐 Copy Website</h3>
        <div className="ai-chip text-xs">URL • Screenshot</div>
      </div>

      {/* Method Selection */}
      <div className="flex gap-2">
        <button
          onClick={() => setMethod('url')}
          className={`flex-1 p-2 rounded-lg text-sm ${
            method === 'url' ? 'bg-blue-600 text-white' : 'bg-var(--clay-gray)'
          }`}
        >
          🔗 URL
        </button>
        <button
          onClick={() => setMethod('screenshot')}
          className={`flex-1 p-2 rounded-lg text-sm ${
            method === 'screenshot' ? 'bg-blue-600 text-white' : 'bg-var(--clay-gray)'
          }`}
        >
          📸 Screenshot
        </button>
      </div>

      {/* URL Input */}
      {method === 'url' && (
        <div>
          <label className="block text-sm font-medium mb-2">Website URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="w-full p-3 rounded-lg border"
            style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
          />
          <p className="text-xs opacity-60 mt-1">
            Uses: wget --mirror --convert-links --adjust-extension --page-requisites --no-parent
          </p>
        </div>
      )}

      {/* Screenshot Upload */}
      {method === 'screenshot' && (
        <div>
          <label className="block text-sm font-medium mb-2">Upload Screenshot</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            className="w-full p-3 rounded-lg border"
            style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
          />
        </div>
      )}

      {/* Copy Button */}
      <button
        onClick={handleCopyWebsite}
        disabled={isProcessing || (!url && !screenshot)}
        className="w-full btn-primary py-3 disabled:opacity-50"
      >
        {isProcessing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin w-4 h-4 border border-current border-t-transparent rounded-full"></div>
            {method === 'url' ? 'Mirroring Website...' : 'Analyzing Screenshot...'}
          </div>
        ) : (
          `Copy Website ${method === 'url' ? 'from URL' : 'from Screenshot'}`
        )}
      </button>

      {/* Info */}
      <div className="text-xs opacity-60">
        <p><strong>URL Method:</strong> Downloads complete website structure</p>
        <p><strong>Screenshot Method:</strong> AI recreates design from image</p>
      </div>
    </div>
  )
}

export default WebsiteCopier