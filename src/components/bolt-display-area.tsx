'use client'

import { useState } from 'react'
import { MockupTemplate } from '@/lib/templates/mockup-templates'
import { VisualPreview } from './visual-preview'

interface BoltDisplayAreaProps {
  selectedTemplate: MockupTemplate | null
  onTemplateChange: (template: MockupTemplate) => void
}

export function BoltDisplayArea({ selectedTemplate, onTemplateChange }: BoltDisplayAreaProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview')
  const [designVariations, setDesignVariations] = useState<MockupTemplate[]>([])

  // Generate 10 consistent design variations
  const generateVariations = async (baseTemplate: MockupTemplate) => {
    const variations: MockupTemplate[] = []
    const styles = ['modern', 'minimalist', 'bold', 'elegant', 'playful', 'professional', 'creative', 'clean', 'vibrant', 'subtle']
    
    for (let i = 0; i < 10; i++) {
      const variation: MockupTemplate = {
        id: `${baseTemplate.id}-var-${i + 1}`,
        name: `${baseTemplate.name} - ${styles[i]} Style`,
        category: baseTemplate.category,
        preview: baseTemplate.preview,
        code: baseTemplate.code.replace(
          'bg-gradient-to-br from-blue-50 to-indigo-100',
          getVariationBackground(i)
        ),
        aiPrompts: [`Make it more ${styles[i]}`, 'Adjust colors', 'Improve layout']
      }
      variations.push(variation)
    }
    
    setDesignVariations(variations)
  }

  const getVariationBackground = (index: number): string => {
    const backgrounds = [
      'bg-gradient-to-br from-purple-50 to-pink-100',
      'bg-gradient-to-br from-gray-50 to-gray-100',
      'bg-gradient-to-br from-red-50 to-orange-100',
      'bg-gradient-to-br from-green-50 to-emerald-100',
      'bg-gradient-to-br from-yellow-50 to-amber-100',
      'bg-gradient-to-br from-indigo-50 to-blue-100',
      'bg-gradient-to-br from-pink-50 to-rose-100',
      'bg-gradient-to-br from-slate-50 to-zinc-100',
      'bg-gradient-to-br from-cyan-50 to-teal-100',
      'bg-gradient-to-br from-violet-50 to-purple-100'
    ]
    return backgrounds[index] || backgrounds[0]
  }

  useState(() => {
    if (selectedTemplate) {
      generateVariations(selectedTemplate)
    }
  }, [selectedTemplate])

  if (!selectedTemplate) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: 'var(--obsidian)' }}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h2 className="text-2xl font-semibold mb-2">AI Graphic Designer</h2>
          <p className="text-gray-400">Select a template or generate a new design to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex">
      {/* Main Display Area */}
      <div className="flex-1 flex flex-col">
        {/* View Mode Toggle */}
        <div className="h-12 flex items-center justify-between px-4 border-b" style={{ background: 'var(--graphite-mist)', borderColor: 'var(--clay-gray)' }}>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'preview' ? 'bg-blue-600 text-white' : 'bg-var(--clay-gray)'
              }`}
            >
              👁️ Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`px-3 py-1 rounded text-sm ${
                viewMode === 'code' ? 'bg-blue-600 text-white' : 'bg-var(--clay-gray)'
              }`}
            >
              💻 Source Code
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={async () => {
                const response = await fetch('/api/designs/save', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ template: selectedTemplate })
                })
                const result = await response.json()
                console.log(result.success ? 'Saved!' : 'Failed to save')
              }}
              className="btn-secondary text-sm"
            >
              💾 Save to Supabase
            </button>
            <button className="btn-secondary text-sm">Push to GitHub</button>
            <button 
              onClick={async () => {
                if (!selectedTemplate) return
                
                // Show deployment progress
                const deployBtn = document.querySelector('[data-deploy-btn]') as HTMLButtonElement
                if (deployBtn) {
                  deployBtn.textContent = '🛠️ Deploying...'
                  deployBtn.disabled = true
                }
                
                try {
                  const response = await fetch('/api/deploy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ template: selectedTemplate })
                  })
                  const result = await response.json()
                  
                  if (result.success) {
                    alert(`🎉 ${result.message}\n\n📊 Backend: ${result.backend.tables} tables, ${result.backend.policies} policies, ${result.backend.functions} functions`)
                    window.open(result.url, '_blank')
                  }
                } finally {
                  if (deployBtn) {
                    deployBtn.textContent = '🚀 Deploy'
                    deployBtn.disabled = false
                  }
                }
              }}
              className="btn-primary text-sm"
              data-deploy-btn
            >
              🚀 Deploy
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {viewMode === 'preview' ? (
            <VisualPreview 
              template={selectedTemplate}
              onCodeChange={(code) => {
                onTemplateChange({...selectedTemplate, code})
              }}
            />
          ) : (
            <div className="h-full p-4">
              <div className="h-full rounded-lg p-4 overflow-auto font-mono text-sm" style={{ background: 'var(--graphite-mist)' }}>
                <pre style={{ color: 'var(--cloud-white)' }}>
                  <code>{selectedTemplate.code}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Design Variations Sidebar */}
      <div className="w-80 border-l" style={{ borderColor: 'var(--clay-gray)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--clay-gray)' }}>
          <h3 className="font-semibold mb-2">Design Variations</h3>
          <p className="text-sm opacity-60">10 consistent style alternatives</p>
        </div>
        
        <div className="p-4 space-y-3 h-full overflow-y-auto">
          {designVariations.map((variation, index) => (
            <button
              key={variation.id}
              onClick={() => onTemplateChange(variation)}
              className="w-full p-3 rounded-lg border text-left hover:bg-var(--clay-gray) transition-colors"
              style={{ borderColor: 'var(--clay-gray)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {index + 1}
                </div>
                <span className="text-sm font-medium">{variation.name}</span>
              </div>
              
              {/* Mini Preview */}
              <div className="w-full h-16 rounded border overflow-hidden" style={{ borderColor: 'var(--clay-gray)' }}>
                <div 
                  className={`w-full h-full ${getVariationBackground(index)} flex items-center justify-center text-xs`}
                >
                  Preview
                </div>
              </div>
              
              <div className="mt-2 flex gap-1">
                {variation.aiPrompts.slice(0, 2).map(prompt => (
                  <span key={prompt} className="text-xs px-2 py-1 rounded bg-var(--clay-gray)">
                    {prompt}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}