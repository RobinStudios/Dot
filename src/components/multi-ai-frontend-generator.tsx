'use client'

import { useState } from 'react'
import { MultiAIGenerator, GeneratedFrontend, AI_PROVIDERS } from '@/lib/ai/multi-ai-generator'
import { LoadingSpinner } from '@/components/ui/loading'
import { toast } from '@/components/ui/toast'

export function MultiAIFrontendGenerator() {
  const [appIdea, setAppIdea] = useState('')
  const [requirements, setRequirements] = useState<string[]>([''])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFrontends, setGeneratedFrontends] = useState<GeneratedFrontend[]>([])
  const [selectedFrontend, setSelectedFrontend] = useState<GeneratedFrontend | null>(null)

  const generator = new MultiAIGenerator()

  const addRequirement = () => {
    setRequirements([...requirements, ''])
  }

  const updateRequirement = (index: number, value: string) => {
    const updated = [...requirements]
    updated[index] = value
    setRequirements(updated)
  }

  const removeRequirement = (index: number) => {
    setRequirements(requirements.filter((_, i) => i !== index))
  }

  const handleGenerate = async () => {
    if (!appIdea.trim()) {
      toast.error('Please enter your app idea')
      return
    }

    setIsGenerating(true)
    try {
      const results = await generator.generateMultipleFrontends({
        appIdea,
        requirements: requirements.filter(r => r.trim())
      })
      
      setGeneratedFrontends(results)
      toast.success(`Generated ${results.length} frontend variations!`)
    } catch (error) {
      toast.error('Generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--graphite-mist)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--clay-gray)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--cloud-white)' }}>
          🤖 Multi-AI Frontend Generator
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--fog-gray)' }}>
          Generate 5 different frontend implementations using multiple AI providers
        </p>
      </div>

      {/* Input Form */}
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cloud-white)' }}>
            App Idea
          </label>
          <textarea
            value={appIdea}
            onChange={(e) => setAppIdea(e.target.value)}
            placeholder="Describe your app idea in detail..."
            className="w-full p-3 border rounded-lg h-24 resize-none"
            style={{ 
              background: 'var(--clay-gray)', 
              borderColor: 'var(--fog-gray)', 
              color: 'var(--cloud-white)' 
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cloud-white)' }}>
            Requirements
          </label>
          {requirements.map((req, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                value={req}
                onChange={(e) => updateRequirement(index, e.target.value)}
                placeholder="Enter a requirement..."
                className="flex-1 p-2 border rounded"
                style={{ 
                  background: 'var(--clay-gray)', 
                  borderColor: 'var(--fog-gray)', 
                  color: 'var(--cloud-white)' 
                }}
              />
              <button
                onClick={() => removeRequirement(index)}
                className="px-3 py-2 text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addRequirement}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            + Add Requirement
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !appIdea.trim()}
          className="w-full btn-primary py-3 disabled:opacity-50"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" />
              Generating with {AI_PROVIDERS.length} AI providers...
            </div>
          ) : (
            'Generate 5 Frontend Variations'
          )}
        </button>
      </div>

      {/* Generated Frontends */}
      {generatedFrontends.length > 0 && (
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--cloud-white)' }}>
            Generated Frontends
          </h3>
          
          <div className="grid grid-cols-1 gap-4">
            {generatedFrontends.map((frontend, index) => (
              <div
                key={frontend.providerId}
                className="border rounded-lg p-4 cursor-pointer transition-colors"
                style={{ 
                  background: selectedFrontend?.providerId === frontend.providerId 
                    ? 'var(--obsidian)' 
                    : 'var(--clay-gray)',
                  borderColor: selectedFrontend?.providerId === frontend.providerId 
                    ? 'var(--ink-blue)' 
                    : 'var(--fog-gray)'
                }}
                onClick={() => setSelectedFrontend(frontend)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold" style={{ color: 'var(--cloud-white)' }}>
                    {frontend.providerName}
                  </h4>
                  <span className="text-xs px-2 py-1 rounded" style={{ 
                    background: 'var(--ink-blue)', 
                    color: 'var(--cloud-white)' 
                  }}>
                    {frontend.framework}
                  </span>
                </div>
                
                <p className="text-sm mb-2" style={{ color: 'var(--fog-gray)' }}>
                  {AI_PROVIDERS.find(p => p.id === frontend.providerId)?.specialty}
                </p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {frontend.features.map(feature => (
                    <span
                      key={feature}
                      className="text-xs px-2 py-1 rounded"
                      style={{ background: 'var(--fog-gray)', color: 'var(--obsidian)' }}
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <button className="btn-secondary text-xs">
                    Preview
                  </button>
                  <button className="btn-primary text-xs">
                    Use This Frontend
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Preview */}
      {selectedFrontend && (
        <div className="border-t p-4" style={{ borderColor: 'var(--clay-gray)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--cloud-white)' }}>
            {selectedFrontend.providerName} - {selectedFrontend.framework}
          </h4>
          <pre className="text-xs p-3 rounded overflow-x-auto max-h-40" style={{ 
            background: 'var(--obsidian)', 
            color: 'var(--fog-gray)' 
          }}>
            {selectedFrontend.code.substring(0, 500)}...
          </pre>
        </div>
      )}
    </div>
  )
}