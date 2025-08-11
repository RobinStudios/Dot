'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesignStore } from '@/store/design-store'
import { AIGenerationRequest } from '@/types'
import { AgentSelector } from './agent-selector'
import { AIAgentManager } from './ai-agent-manager'

interface AIPromptPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AIPromptPanel({ isOpen, onClose }: AIPromptPanelProps) {
  const { generateMockups, isGenerating } = useDesignStore()
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('modern')
  const [layout, setLayout] = useState('grid')
  const [colorScheme, setColorScheme] = useState('blue')
  const [typography, setTypography] = useState('clean')
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [showAgentManager, setShowAgentManager] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    try {
      await generateMockups({
        prompt: prompt.trim(),
        style,
        layout,
        colorScheme,
        typography,
      })
      onClose()
    } catch (error) {
      console.error('Generation failed:', error)
    }
  }

  const presetPrompts = [
    'Modern landing page for a tech startup',
    'Elegant business card design',
    'Social media post for a restaurant',
    'Product catalog layout',
    'Event invitation design',
    'Blog post header',
    'Mobile app interface',
    'Email newsletter template',
    'Presentation slide design',
    'Logo and branding elements',
  ]

  const styles = [
    { value: 'modern', label: 'Modern', description: 'Clean and contemporary' },
    { value: 'minimalist', label: 'Minimalist', description: 'Simple and clean' },
    { value: 'vintage', label: 'Vintage', description: 'Retro and classic' },
    { value: 'playful', label: 'Playful', description: 'Fun and colorful' },
    { value: 'professional', label: 'Professional', description: 'Corporate and formal' },
    { value: 'artistic', label: 'Artistic', description: 'Creative and expressive' },
  ]

  const layouts = [
    { value: 'grid', label: 'Grid', description: 'Structured grid layout' },
    { value: 'flexbox', label: 'Flexbox', description: 'Flexible layout' },
    { value: 'absolute', label: 'Absolute', description: 'Free positioning' },
    { value: 'responsive', label: 'Responsive', description: 'Mobile-first design' },
  ]

  const colorSchemes = [
    { value: 'blue', label: 'Blue', description: 'Professional blue tones' },
    { value: 'green', label: 'Green', description: 'Natural green palette' },
    { value: 'purple', label: 'Purple', description: 'Creative purple hues' },
    { value: 'orange', label: 'Orange', description: 'Energetic orange' },
    { value: 'monochrome', label: 'Monochrome', description: 'Black and white' },
    { value: 'pastel', label: 'Pastel', description: 'Soft pastel colors' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', width: '100%', maxWidth: '32rem', maxHeight: '90vh', overflow: 'hidden' }}
          >
            {/* Header */}
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                    AI Design Generator
                  </h2>
                  <p className="text-secondary-500 dark:text-secondary-400">
                    Generate 10 unique design mockups based on your prompt
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Prompt Input */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Design Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the design you want to create..."
                  className="w-full h-24 p-3 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Preset Prompts */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  Quick Prompts
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetPrompts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setPrompt(preset)}
                      className="p-2 text-left text-sm bg-secondary-50 dark:bg-secondary-700 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-600 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Options */}
              {/* Agent Selection */}
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                  AI Agent
                </label>
                <div className="flex space-x-2">
                  <AgentSelector 
                    taskType="design_generation"
                    onAgentSelect={setSelectedAgent}
                    selectedAgent={selectedAgent}
                  />
                  <button
                    onClick={() => setShowAgentManager(true)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Manage
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Style
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  >
                    {styles.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label} - {s.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Layout
                  </label>
                  <select
                    value={layout}
                    onChange={(e) => setLayout(e.target.value)}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  >
                    {layouts.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label} - {l.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Color Scheme
                  </label>
                  <select
                    value={colorScheme}
                    onChange={(e) => setColorScheme(e.target.value)}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  >
                    {colorSchemes.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label} - {c.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Typography
                  </label>
                  <select
                    value={typography}
                    onChange={(e) => setTypography(e.target.value)}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-700 text-secondary-900 dark:text-white"
                  >
                    <option value="clean">Clean - Modern sans-serif</option>
                    <option value="elegant">Elegant - Serif fonts</option>
                    <option value="bold">Bold - Strong typography</option>
                    <option value="playful">Playful - Fun fonts</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-secondary-200 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-700/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-secondary-500 dark:text-secondary-400">
                  This will generate 10 unique design variations
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-600 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span>🎨</span>
                        <span>Generate Designs</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Agent Manager */}
            <AIAgentManager 
              isOpen={showAgentManager}
              onClose={() => setShowAgentManager(false)}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
