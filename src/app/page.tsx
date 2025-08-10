'use client'

import { useState } from 'react'
import { FigmaCanvas } from '@/components/figma-canvas'
import { Omnibar } from '@/components/omnibar'
import { ThemeToggle } from '@/components/theme-provider'
import { BoltIntegration } from '@/components/bolt-integration'
import { ErrorBoundary } from '@/components/error-boundary'
import { MockupTemplate } from '@/lib/templates/mockup-templates'

export default function Home() {
  const [showTemplates, setShowTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<MockupTemplate | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleCommand = async (command: string) => {
    if (command.startsWith('ai:')) {
      setIsGenerating(true)
      setTimeout(() => {
        setIsGenerating(false)
        console.log('AI command processed:', command)
      }, 2000)
    }
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col" style={{ background: 'var(--obsidian)', color: 'var(--cloud-white)' }}>
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b" style={{ background: 'var(--graphite-mist)', borderColor: 'var(--clay-gray)' }}>
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">🎨 AI Graphic Designer</h1>
            {isGenerating && (
              <div className="ai-chip">
                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
                AI Working...
              </div>
            )}
          </div>
          
          <Omnibar onCommand={handleCommand} />
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button className="btn-secondary text-sm">Share</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Templates Sidebar */}
          {showTemplates && (
            <div className="w-80 border-r" style={{ borderColor: 'var(--clay-gray)' }}>
              <BoltIntegration 
                onTemplateSelect={(template) => {
                  setSelectedTemplate(template)
                  setShowTemplates(false)
                }}
              />
            </div>
          )}
          
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            {selectedTemplate ? (
              <>
                {/* Template Header */}
                <div className="h-12 flex items-center justify-between px-4 border-b" style={{ background: 'var(--graphite-mist)', borderColor: 'var(--clay-gray)' }}>
                  <h3 className="font-medium">{selectedTemplate.name}</h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setShowTemplates(true)}
                      className="btn-secondary text-sm"
                    >
                      ← Templates
                    </button>
                    <button className="btn-primary text-sm">Export Code</button>
                    <button className="btn-secondary text-sm">Preview</button>
                  </div>
                </div>
                
                {/* Code Editor */}
                <div className="flex-1 p-4">
                  <div className="h-full rounded-lg p-4 overflow-auto" style={{ background: 'var(--graphite-mist)' }}>
                    <pre className="text-sm">
                      <code style={{ color: 'var(--cloud-white)' }}>{selectedTemplate.code}</code>
                    </pre>
                  </div>
                </div>
              </>
            ) : (
              <FigmaCanvas />
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}