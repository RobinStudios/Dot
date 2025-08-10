'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { MOCKUP_TEMPLATES, MockupTemplate } from '@/lib/templates/mockup-templates'

interface BoltIntegrationProps {
  onTemplateSelect: (template: MockupTemplate) => void
}

export function BoltIntegration({ onTemplateSelect }: BoltIntegrationProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const filteredTemplates = MOCKUP_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handleAIEdit = async (template: MockupTemplate, prompt: string) => {
    setIsGenerating(true)
    
    // Simulate AI editing using Bolt.new architecture
    try {
      const response = await fetch('/api/ai/edit-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateCode: template.code,
          editPrompt: prompt,
          templateId: template.id
        })
      })
      
      const result = await response.json()
      
      // Create modified template
      const modifiedTemplate: MockupTemplate = {
        ...template,
        id: `${template.id}-modified-${Date.now()}`,
        name: `${template.name} (AI Modified)`,
        code: result.modifiedCode
      }
      
      onTemplateSelect(modifiedTemplate)
    } catch (error) {
      console.error('AI editing failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-var(--bg-primary)">
      {/* Header */}
      <div className="p-4 border-b border-var(--bg-tertiary)">
        <h2 className="text-lg font-semibold text-var(--text-primary) mb-4">
          Quick Start Templates
        </h2>
        
        {/* Search */}
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 bg-var(--bg-tertiary) border border-var(--clay-gray) rounded-lg text-var(--text-primary) mb-4"
        />
        
        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'landing', 'dashboard', 'ecommerce', 'portfolio', 'blog'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                selectedCategory === category
                  ? 'bg-var(--accent-primary) text-white'
                  : 'bg-var(--bg-tertiary) text-var(--text-secondary) hover:bg-var(--clay-gray)'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map(template => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-var(--bg-secondary) border border-var(--bg-tertiary) rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Preview */}
              <div className="aspect-video bg-var(--bg-tertiary) flex items-center justify-center">
                <span className="text-var(--text-secondary)">Preview</span>
              </div>
              
              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-var(--text-primary) mb-2">
                  {template.name}
                </h3>
                
                {/* Action Buttons */}
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => onTemplateSelect(template)}
                    className="flex-1 bg-var(--accent-primary) text-white py-2 px-3 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Use Template
                  </button>
                  <button className="px-3 py-2 bg-var(--bg-tertiary) text-var(--text-secondary) rounded text-sm hover:bg-var(--clay-gray) transition-colors">
                    Preview
                  </button>
                </div>
                
                {/* AI Edit Prompts */}
                <div className="space-y-2">
                  <p className="text-xs text-var(--text-secondary) mb-2">Quick AI Edits:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.aiPrompts.slice(0, 2).map(prompt => (
                      <button
                        key={prompt}
                        onClick={() => handleAIEdit(template, prompt)}
                        disabled={isGenerating}
                        className="ai-chip text-xs disabled:opacity-50"
                      >
                        {isGenerating ? '...' : prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-var(--text-secondary)">No templates found</p>
          </div>
        )}
      </div>
    </div>
  )
}