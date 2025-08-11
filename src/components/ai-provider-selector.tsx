'use client'

import { useState } from 'react'

interface AIProviderSelectorProps {
  onGenerate: (provider: string, prompt: string, options?: any) => void
  isGenerating: boolean
}

export function AIProviderSelector({ onGenerate, isGenerating }: AIProviderSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState('bedrock')
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('modern')

  const providers = [
    { id: 'bedrock', name: 'AWS Bedrock', icon: '🔶', endpoint: '/api/images/generate' },
    { id: 'replicate', name: 'Replicate', icon: '🔄', endpoint: '/api/replicate/generate' },
    { id: 'lambda', name: 'Lambda AI', icon: '⚡', endpoint: '/api/lambda/generate' }
  ]

  const styles = [
    'modern', 'minimalist', 'vintage', 'playful', 'professional', 'artistic', 'corporate', 'creative'
  ]

  const handleGenerate = () => {
    if (!prompt.trim()) return
    
    const provider = providers.find(p => p.id === selectedProvider)
    onGenerate(selectedProvider, prompt, { style, endpoint: provider?.endpoint })
  }

  return (
    <div className="p-4 space-y-4" style={{ background: 'var(--graphite-mist)' }}>
      <h3 className="font-semibold">AI Image Generation</h3>
      
      {/* Provider Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">AI Provider</label>
        <div className="grid grid-cols-3 gap-2">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={`p-2 rounded-lg text-sm flex flex-col items-center gap-1 transition-colors ${
                selectedProvider === provider.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-var(--clay-gray) hover:bg-var(--fog-gray)'
              }`}
            >
              <span className="text-lg">{provider.icon}</span>
              <span>{provider.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Prompt</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="w-full p-3 rounded-lg border resize-none"
          style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
          rows={3}
        />
      </div>

      {/* Style Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Style</label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full p-2 rounded-lg border"
          style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
        >
          {styles.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || !prompt.trim()}
        className="w-full btn-primary py-3 disabled:opacity-50"
      >
        {isGenerating ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin w-4 h-4 border border-current border-t-transparent rounded-full"></div>
            Generating...
          </div>
        ) : (
          `Generate with ${providers.find(p => p.id === selectedProvider)?.name}`
        )}
      </button>

      {/* Provider Info */}
      <div className="text-xs opacity-60">
        <p><strong>Bedrock:</strong> AWS Stable Diffusion XL</p>
        <p><strong>Replicate:</strong> Community models</p>
        <p><strong>Lambda:</strong> Fast GPU inference</p>
      </div>
    </div>
  )
}