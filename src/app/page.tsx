'use client'

import { useState } from 'react'
import { FigmaCanvas } from '@/components/figma-canvas'
import { Omnibar } from '@/components/omnibar'
import { ThemeToggle } from '@/components/theme-provider'
import { BoltIntegration } from '@/components/bolt-integration'
import { ErrorBoundary } from '@/components/error-boundary'
import { useDesignStore } from '@/store/design-store'
import { DesignMockup } from '@/types'

export default function Home() {
  const [showTemplates, setShowTemplates] = useState(true)
  const { isGenerating, setGenerating, currentMockup, setCurrentMockup, generateMockups } = useDesignStore()

  const handleCommand = async (command: string) => {
    if (command.startsWith('ai:')) {
      await generateMockups(command.replace('ai:', '').trim())
    }
  }

  const handleTemplateSelect = (mockup: DesignMockup) => {
    setCurrentMockup(mockup);
    setShowTemplates(false);
  };

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-obsidian text-cloud-white">
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b bg-graphite-mist border-clay-gray">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">🎨 AI Graphic Designer</h1>
            {isGenerating && (
              <div className="flex items-center space-x-2 text-sm bg-primary-900/50 text-primary-300 px-3 py-1 rounded-full">
                <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
                <span>AI Working...</span>
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
            <div className="w-80 border-r border-clay-gray">
              <BoltIntegration 
                onTemplateSelect={handleTemplateSelect}
              />
            </div>
          )}
          
          {/* Canvas Area */}
          <div className="flex-1 flex flex-col">
            {currentMockup ? (
              <>
                {/* Template Header */}
                <div className="h-12 flex items-center justify-between px-4 border-b bg-graphite-mist border-clay-gray">
                  <h3 className="font-medium">{currentMockup.title}</h3>
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
                  <div className="h-full rounded-lg p-4 overflow-auto bg-graphite-mist">
                    <pre className="text-sm">
                      <code className="text-cloud-white">{currentMockup.elements.find(e => e.id === 'code')?.content}</code>
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