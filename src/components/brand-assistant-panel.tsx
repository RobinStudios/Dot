'use client'

import { useState, useEffect } from 'react'
import { brandDesignAssistant } from '@/lib/ai/brand-design-assistant'

interface BrandAssistantPanelProps {
  designElements: any[]
  selectedElement?: any
  brandContext?: {
    brandName?: string
    industry?: string
    targetAudience?: string
  }
}

export function BrandAssistantPanel({ designElements, selectedElement, brandContext }: BrandAssistantPanelProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [activeTab, setActiveTab] = useState<'analysis' | 'assistant' | 'suggestions'>('analysis')

  const analyzeDesign = async () => {
    setIsAnalyzing(true)
    try {
      const colors = designElements.map(el => el.fill || el.stroke).filter(Boolean)
      const fonts = designElements.map(el => el.fontFamily).filter(Boolean)
      
      const context = {
        elements: designElements,
        colors: [...new Set(colors)],
        fonts: [...new Set(fonts)],
        ...brandContext
      }

      const result = await brandDesignAssistant.analyzeDesign(context)
      setAnalysis(result)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const askAssistant = async () => {
    if (!query.trim()) return
    
    setIsAsking(true)
    try {
      const colors = designElements.map(el => el.fill || el.stroke).filter(Boolean)
      const fonts = designElements.map(el => el.fontFamily).filter(Boolean)
      
      const context = {
        elements: designElements,
        colors: [...new Set(colors)],
        fonts: [...new Set(fonts)],
        ...brandContext
      }

      const result = await brandDesignAssistant.getSuggestion(query, context)
      setResponse(result)
      setQuery('')
    } catch (error) {
      console.error('Assistant query failed:', error)
    } finally {
      setIsAsking(false)
    }
  }

  const generateColorPalette = async () => {
    try {
      const colors = await brandDesignAssistant.generateColorPalette(
        brandContext?.brandName || 'Brand',
        brandContext?.industry || 'General',
        'professional'
      )
      console.log('Generated colors:', colors)
    } catch (error) {
      console.error('Color generation failed:', error)
    }
  }

  useEffect(() => {
    if (designElements.length > 0) {
      analyzeDesign()
    }
  }, [designElements.length])

  const ScoreBar = ({ score, label }: { score: number; label: string }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-medium">{score}/100</span>
      </div>
      <div className="w-full bg-var(--clay-gray) rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-500"
          style={{ 
            width: `${score}%`,
            backgroundColor: score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
          }}
        />
      </div>
    </div>
  )

  return (
    <div className="w-80 h-full flex flex-col" style={{ background: 'var(--graphite-mist)', color: 'var(--cloud-white)' }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--clay-gray)' }}>
        <div className="flex items-center gap-2 mb-3">
          <h3 className="font-semibold">🎨 Brand Assistant</h3>
          <div className="ai-chip text-xs">AI Powered</div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1">
          {[
            { id: 'analysis', label: '📊 Analysis', name: 'Analysis' },
            { id: 'assistant', label: '🤖 Assistant', name: 'Assistant' },
            { id: 'suggestions', label: '💡 Ideas', name: 'Ideas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                activeTab === tab.id ? 'bg-blue-600 text-white' : 'bg-var(--clay-gray)'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-4">
            {analysis ? (
              <>
                {/* Overall Score */}
                <div className="text-center p-4 rounded-lg" style={{ background: 'var(--clay-gray)' }}>
                  <div className="text-3xl font-bold mb-1">{analysis.overallScore}</div>
                  <div className="text-sm opacity-60">Overall Design Score</div>
                </div>

                {/* Individual Scores */}
                <div>
                  <h4 className="font-medium mb-3">Detailed Ratings</h4>
                  <ScoreBar score={analysis.brandScore} label="Brand Consistency" />
                  <ScoreBar score={analysis.typographyScore} label="Typography" />
                  <ScoreBar score={analysis.colorScore} label="Color Harmony" />
                  <ScoreBar score={analysis.logoScore} label="Logo Integration" />
                </div>

                {/* Strengths */}
                {analysis.strengths?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-green-400">✅ Strengths</h4>
                    <ul className="space-y-1 text-sm">
                      {analysis.strengths.map((strength: string, i: number) => (
                        <li key={i} className="opacity-80">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {analysis.improvements?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 text-yellow-400">⚠️ Improvements</h4>
                    <ul className="space-y-1 text-sm">
                      {analysis.improvements.map((improvement: string, i: number) => (
                        <li key={i} className="opacity-80">• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <button 
                  onClick={analyzeDesign}
                  disabled={isAnalyzing || designElements.length === 0}
                  className="btn-primary disabled:opacity-50"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Design'}
                </button>
                {designElements.length === 0 && (
                  <p className="text-xs opacity-60 mt-2">Add design elements to analyze</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Assistant Tab */}
        {activeTab === 'assistant' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Ask the Brand Expert</h4>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about colors, typography, branding, layout..."
                className="w-full p-3 rounded-lg border resize-none text-sm"
                style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
                rows={3}
              />
              <button
                onClick={askAssistant}
                disabled={isAsking || !query.trim()}
                className="btn-primary text-sm mt-2 w-full disabled:opacity-50"
              >
                {isAsking ? 'Thinking...' : 'Ask Assistant'}
              </button>
            </div>

            {response && (
              <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--clay-gray)' }}>
                <div className="font-medium mb-2">💡 Assistant Response:</div>
                <div className="opacity-90">{response}</div>
              </div>
            )}

            {/* Quick Questions */}
            <div>
              <h4 className="font-medium mb-2">Quick Questions</h4>
              <div className="space-y-2">
                {[
                  'What colors work best for my brand?',
                  'How can I improve typography hierarchy?',
                  'Is my design accessible?',
                  'What fonts pair well together?'
                ].map(question => (
                  <button
                    key={question}
                    onClick={() => setQuery(question)}
                    className="w-full p-2 text-left text-sm rounded hover:bg-var(--clay-gray) transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">AI Suggestions</h4>
              
              <button
                onClick={generateColorPalette}
                className="btn-secondary text-sm w-full mb-3"
              >
                🎨 Generate Color Palette
              </button>

              <div className="space-y-3">
                <div className="p-3 rounded-lg" style={{ background: 'var(--clay-gray)' }}>
                  <div className="font-medium mb-1">Typography Tip</div>
                  <div className="text-sm opacity-80">Use max 2-3 font families for better consistency</div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'var(--clay-gray)' }}>
                  <div className="font-medium mb-1">Color Harmony</div>
                  <div className="text-sm opacity-80">Stick to 60-30-10 rule: 60% primary, 30% secondary, 10% accent</div>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'var(--clay-gray)' }}>
                  <div className="font-medium mb-1">Brand Consistency</div>
                  <div className="text-sm opacity-80">Maintain consistent spacing and alignment throughout</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Brand Context */}
      {brandContext && (
        <div className="p-3 border-t text-xs" style={{ borderColor: 'var(--clay-gray)', background: 'var(--clay-gray)' }}>
          <div className="opacity-60">Brand Context</div>
          <div>{brandContext.brandName} • {brandContext.industry}</div>
        </div>
      )}
    </div>
  )
}