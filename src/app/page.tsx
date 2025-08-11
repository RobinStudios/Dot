'use client'

import { useState } from 'react'
import { FigmaCanvas } from '@/components/figma-canvas'
import { Omnibar } from '@/components/omnibar'
import { ThemeToggle } from '@/components/theme-provider'
import { BoltIntegration } from '@/components/bolt-integration'
import { VisualPreview } from '@/components/visual-preview'
import { AuthProvider, LoginModal, useAuth } from '@/components/auth-provider'
import { CollaborationPanel } from '@/components/collaboration-panel'
import { AIProviderSelector } from '@/components/ai-provider-selector'
import { HybridDesignGenerator } from '@/components/hybrid-design-generator'
import { CreativeEffectsPanel } from '@/components/creative-effects-panel'
import { MCPPluginPanel } from '@/components/mcp-plugin-panel'
import { WebsiteCopier } from '@/components/website-copier'
import { BoltDisplayArea } from '@/components/bolt-display-area'
import { MobileLayout } from '@/components/mobile-layout'
import { FigmaDesignEditor } from '@/components/figma-design-editor'
import { FigmaPropertiesPanel } from '@/components/figma-properties-panel'
import { FigmaLayersPanel } from '@/components/figma-layers-panel'
import { BrandAssistantPanel } from '@/components/brand-assistant-panel'
import ApiManagementPanel from '@/components/api-management-panel'
import SupabaseIntegrationPanel from '@/components/supabase-integration-panel'
import { ErrorBoundary } from '@/components/error-boundary'
import { MockupTemplate, MOCKUP_TEMPLATES } from '@/lib/templates/mockup-templates'
import { toast, ToastContainer } from '@/components/ui/toast'
import { LoadingSpinner } from '@/components/ui/loading'
import { TemplateSelector } from '@/components/template-selector'
import { MultiAIFrontendGenerator } from '@/components/multi-ai-frontend-generator'

function HomeContent() {
  const [showTemplates, setShowTemplates] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<MockupTemplate | null>(MOCKUP_TEMPLATES[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showCollaboration, setShowCollaboration] = useState(false)
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showHybridGenerator, setShowHybridGenerator] = useState(false)
  const [showEffects, setShowEffects] = useState(false)
  const [showMCPPlugins, setShowMCPPlugins] = useState(false)
  const [showWebsiteCopier, setShowWebsiteCopier] = useState(false)
  const [showFigmaEditor, setShowFigmaEditor] = useState(false)
  const [designElements, setDesignElements] = useState<any[]>([])
  const [selectedElementId, setSelectedElementId] = useState<string>('')
  const [showBrandAssistant, setShowBrandAssistant] = useState(false)
  const [showApiManagement, setShowApiManagement] = useState(false)
  const [showSupabase, setShowSupabase] = useState(false)
  const [showMultiAI, setShowMultiAI] = useState(false)
  const [brandContext, setBrandContext] = useState({
    brandName: 'My Brand',
    industry: 'Technology',
    targetAudience: 'Professionals'
  })
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const { user } = useAuth()

  const handleCommand = async (command: string) => {
    if (command.startsWith('ai:')) {
      setIsGenerating(true)
      setTimeout(() => {
        setIsGenerating(false)
        console.log('AI command processed:', command)
      }, 2000)
    }
  }

  const handleAIGenerate = async (provider: string, prompt: string, options: any) => {
    setIsGenerating(true)
    try {
      const response = await fetch(options.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: options.style })
      })
      
      const result = await response.json()
      if (result.success) {
        setGeneratedImage(result.imageUrl)
        toast.success('Design generated successfully!')
      } else {
        toast.error(result.error || 'Generation failed. Please try again.')
      }
    } catch (error) {
      toast.error('Network error. Please check your connection and try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col" style={{ background: 'var(--obsidian)', color: 'var(--cloud-white)' }}>
        {/* Top Bar */}
        <div className="h-14 flex items-center justify-between px-6 border-b" style={{ background: 'var(--graphite-mist)', borderColor: 'var(--clay-gray)' }}>
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">🎨 AI Graphic Designer</h1>
            <button 
              onClick={() => setShowFigmaEditor(!showFigmaEditor)}
              className={`btn-${showFigmaEditor ? 'primary' : 'secondary'} text-sm`}
            >
              🎨 Design Editor
            </button>
            <button 
              onClick={() => setShowTemplates(!showTemplates)}
              className={`btn-${showTemplates ? 'primary' : 'secondary'} text-sm`}
            >
              📋 Templates
            </button>
            <button 
              onClick={() => setShowBrandAssistant(!showBrandAssistant)}
              className={`btn-${showBrandAssistant ? 'primary' : 'secondary'} text-sm`}
            >
              🤖 Brand AI
            </button>
            <button 
              onClick={() => setShowApiManagement(!showApiManagement)}
              className={`btn-${showApiManagement ? 'primary' : 'secondary'} text-sm`}
            >
              🔑 API Keys
            </button>
            <button 
              onClick={() => setShowSupabase(!showSupabase)}
              className={`btn-${showSupabase ? 'primary' : 'secondary'} text-sm`}
            >
              🗄️ Supabase
            </button>
            <button 
              onClick={() => setShowMultiAI(!showMultiAI)}
              className={`btn-${showMultiAI ? 'primary' : 'secondary'} text-sm`}
            >
              🤖 Multi-AI
            </button>
            {isGenerating && (
              <div className="ai-chip flex items-center gap-2">
                <LoadingSpinner size="sm" />
                AI Working...
              </div>
            )}
          </div>
          
          <Omnibar onCommand={handleCommand} />
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <button 
                  onClick={() => setShowCollaboration(!showCollaboration)}
                  className="btn-secondary text-sm"
                >
                  👥 Collaborate
                </button>
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              </>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="btn-primary text-sm"
              >
                Login
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Mobile Layout */}
          <div className="block md:hidden w-full">
            <MobileLayout
              showTemplates={showTemplates}
              onToggleTemplates={() => setShowTemplates(!showTemplates)}
              showSidebar={showCollaboration || showAIGenerator || showHybridGenerator || showEffects || showMCPPlugins || showWebsiteCopier}
              onToggleSidebar={() => {
                // Toggle the most recently opened sidebar
                if (showCollaboration) setShowCollaboration(false)
                else if (showAIGenerator) setShowAIGenerator(false)
                else if (showHybridGenerator) setShowHybridGenerator(false)
                else if (showEffects) setShowEffects(false)
                else if (showMCPPlugins) setShowMCPPlugins(false)
                else if (showWebsiteCopier) setShowWebsiteCopier(false)
                else setShowAIGenerator(true) // Default to AI generator
              }}
              templateContent={
                <BoltIntegration 
                  onTemplateSelect={(template) => {
                    setSelectedTemplate(template)
                    setShowTemplates(false)
                  }}
                />
              }
              sidebarContent={
                <>
                  {showCollaboration && user && <CollaborationPanel />}
                  {showAIGenerator && (
                    <AIProviderSelector 
                      onGenerate={handleAIGenerate}
                      isGenerating={isGenerating}
                    />
                  )}
                  {showHybridGenerator && (
                    <HybridDesignGenerator 
                      onDesignGenerated={(design) => {
                        const newTemplate = {
                          id: `hybrid-${Date.now()}`,
                          name: `Hybrid AI Design`,
                          category: 'landing' as const,
                          preview: '',
                          code: design.code,
                          aiPrompts: design.imagePrompts || []
                        }
                        setSelectedTemplate(newTemplate)
                        setShowTemplates(false)
                        setShowHybridGenerator(false)
                      }}
                    />
                  )}
                  {showEffects && (
                    <CreativeEffectsPanel 
                      onApplyEffect={(effect, intensity) => {
                        console.log('Applying effect:', effect.name, intensity)
                      }}
                    />
                  )}
                  {showMCPPlugins && <MCPPluginPanel />}
                  {showWebsiteCopier && (
                    <WebsiteCopier 
                      onWebsiteCopied={(template) => {
                        setSelectedTemplate(template)
                        setShowTemplates(false)
                        setShowWebsiteCopier(false)
                      }}
                    />
                  )}
                </>
              }
            >
              <BoltDisplayArea 
                selectedTemplate={selectedTemplate}
                onTemplateChange={setSelectedTemplate}
              />
            </MobileLayout>
          </div>
          
          {/* Desktop Layout */}
          <div className="hidden md:flex w-full">
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
          
          {/* Main Content Area */}
          {showFigmaEditor ? (
            <div className="flex-1 flex">
              <FigmaLayersPanel 
                elements={designElements}
                selectedElementId={selectedElementId}
                onElementSelect={setSelectedElementId}
                onElementsReorder={setDesignElements}
                onElementUpdate={(id, prop, value) => {
                  setDesignElements(elements => 
                    elements.map(el => el.id === id ? {...el, [prop]: value} : el)
                  )
                }}
                onElementDelete={(id) => {
                  setDesignElements(elements => elements.filter(el => el.id !== id))
                  setSelectedElementId('')
                }}
              />
              
              <div className="flex-1">
                <FigmaDesignEditor 
                  elements={designElements}
                  onElementsChange={setDesignElements}
                  selectedElementId={selectedElementId}
                  onElementSelect={setSelectedElementId}
                />
              </div>
              
              {showBrandAssistant ? (
                <BrandAssistantPanel 
                  designElements={designElements}
                  selectedElement={designElements.find(el => el.id === selectedElementId)}
                  brandContext={brandContext}
                />
              ) : showApiManagement ? (
                <ApiManagementPanel />
              ) : showSupabase ? (
                <SupabaseIntegrationPanel />
              ) : showMultiAI ? (
                <MultiAIFrontendGenerator />
              ) : (
                <FigmaPropertiesPanel 
                  selectedElement={designElements.find(el => el.id === selectedElementId) || null}
                  onElementUpdate={(id, prop, value) => {
                    setDesignElements(elements => 
                      elements.map(el => el.id === id ? {...el, [prop]: value} : el)
                    )
                  }}
                />
              )}
            </div>
          ) : (
            <BoltDisplayArea 
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
            />
          )}
            
          {/* Right Sidebar */}
          {(showCollaboration || showAIGenerator || showHybridGenerator || showEffects || showMCPPlugins || showWebsiteCopier) && (
            <div className="w-80 border-l" style={{ borderColor: 'var(--clay-gray)' }}>
              {showCollaboration && user && <CollaborationPanel />}
              {showAIGenerator && (
                <AIProviderSelector 
                  onGenerate={handleAIGenerate}
                  isGenerating={isGenerating}
                />
              )}
              {showHybridGenerator && (
                <HybridDesignGenerator 
                  onDesignGenerated={(design) => {
                    const newTemplate = {
                      id: `hybrid-${Date.now()}`,
                      name: `Hybrid AI Design`,
                      category: 'landing' as const,
                      preview: '',
                      code: design.code,
                      aiPrompts: design.imagePrompts || []
                    }
                    setSelectedTemplate(newTemplate)
                    setShowTemplates(false)
                    setShowHybridGenerator(false)
                  }}
                />
              )}
              {showEffects && (
                <CreativeEffectsPanel 
                  onApplyEffect={(effect, intensity) => {
                    console.log('Applying effect:', effect.name, intensity)
                  }}
                />
              )}
              {showMCPPlugins && <MCPPluginPanel />}
              {showWebsiteCopier && (
                <WebsiteCopier 
                  onWebsiteCopied={(template) => {
                    setSelectedTemplate(template)
                    setShowTemplates(false)
                    setShowWebsiteCopier(false)
                  }}
                />
              )}
            </div>
          )}
          </div>
        </div>
      </div>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      <ToastContainer />
    </ErrorBoundary>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <HomeContent />
    </AuthProvider>
  )
}