'use client'

import { useState } from 'react'

interface HybridDesignGeneratorProps {
  onDesignGenerated: (design: any) => void
}

export default HybridDesignGenerator;

export function HybridDesignGenerator({ onDesignGenerated }: HybridDesignGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState('landing')
  const [style, setStyle] = useState('modern')
  const [framework, setFramework] = useState('react')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState('')

  const designTypes = [
    { id: 'landing', name: 'Landing Page', icon: '🏠' },
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛒' },
    { id: 'portfolio', name: 'Portfolio', icon: '🎨' },
    { id: 'blog', name: 'Blog', icon: '📝' },
    { id: 'component', name: 'Component', icon: '🧩' }
  ]

  const styles = [
    'modern', 'minimalist', 'vintage', 'playful', 'professional', 'artistic', 'corporate', 'creative'
  ]

  const frameworks = [
    { id: 'react', name: 'React/TSX' },
    { id: 'vue', name: 'Vue.js' },
    { id: 'html', name: 'HTML/CSS' }
  ]

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setProgress('🎨 Planning design architecture...')

    try {
      const response = await fetch('/api/ai/hybrid-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type, style, framework })
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const result = await response.json()
      
      if (result.success) {
        onDesignGenerated(result.design)
        setPrompt('')
      }

    } catch (error) {
      console.error('Hybrid generation failed:', error)
    } finally {
      setIsGenerating(false)
      setProgress('')
    }
  }

  return (
    <div className="p-4 space-y-4" style={{ background: 'var(--graphite-mist)' }}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">🤖 Hybrid AI Design Generator</h3>
        <div className="ai-chip text-xs">Claude 3.5 + Haiku</div>
      </div>

      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Design Brief</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your design idea... e.g., 'Modern SaaS landing page for a project management tool with clean UI and professional feel'"
          className="w-full p-3 rounded-lg border resize-none"
          style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
          rows={3}
        />
      </div>

      {/* Design Type */}
      <div>
        <label className="block text-sm font-medium mb-2">Design Type</label>
        <div className="grid grid-cols-3 gap-2">
          {designTypes.map(designType => (
            <button
              key={designType.id}
              onClick={() => setType(designType.id)}
              className={`p-2 rounded-lg text-sm flex flex-col items-center gap-1 transition-colors ${
                type === designType.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-var(--clay-gray) hover:bg-var(--fog-gray)'
              }`}
            >
              <span>{designType.icon}</span>
              <span className="text-xs">{designType.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Style & Framework */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full p-2 rounded-lg border text-sm"
            style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
          >
            {styles.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Framework</label>
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="w-full p-2 rounded-lg border text-sm"
            style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
          >
            {frameworks.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
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
            <div className="text-left">
              <div>Generating Design...</div>
              {progress && <div className="text-xs opacity-75">{progress}</div>}
            </div>
          </div>
        ) : (
          '🚀 Generate Hybrid Design'
        )}
      </button>

      {/* Workflow Info */}
      <div className="text-xs opacity-60 space-y-1">
        <p><strong>Hybrid Workflow:</strong></p>
        <p>1. 🧠 Claude 3.5 Sonnet - Strategic planning</p>
        <p>2. ⚡ Claude 3 Haiku - Fast code generation</p>
        <p>3. ✨ Claude 3.5 Sonnet - Code enhancement</p>
        <p>4. 🖼️ Auto-generate image prompts</p>
      </div>
    </div>
  )
}