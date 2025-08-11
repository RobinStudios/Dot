'use client'

import { useState, useEffect } from 'react'
import { MockupTemplate } from '@/lib/templates/mockup-templates'

interface VisualPreviewProps {
  template: MockupTemplate
  onCodeChange?: (code: string) => void
}

export function VisualPreview({ template, onCodeChange }: VisualPreviewProps) {
  const [previewHtml, setPreviewHtml] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    generatePreview()
  }, [template.code])

  const generatePreview = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/preview/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: template.code })
      })
      
      const { html } = await response.json()
      setPreviewHtml(html)
    } catch (error) {
      console.error('Preview generation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIEdit = async (prompt: string) => {
    setIsLoading(true)
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
      
      const { modifiedCode } = await response.json()
      onCodeChange?.(modifiedCode)
    } catch (error) {
      console.error('AI edit failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--clay-gray)' }}>
        <div className="flex gap-2">
          {template.aiPrompts.slice(0, 3).map(prompt => (
            <button
              key={prompt}
              onClick={() => handleAIEdit(prompt)}
              disabled={isLoading}
              className="ai-chip text-xs"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={generatePreview}
            disabled={isLoading}
            className="btn-secondary text-sm"
          >
            {isLoading ? '⟳' : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* Live Preview */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10">
            <div className="ai-chip">
              <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
              Generating Preview...
            </div>
          </div>
        )}
        
        <iframe
          srcDoc={previewHtml || generateStaticPreview(template.code)}
          className="w-full h-full border-0"
          sandbox="allow-scripts"
          title="Design Preview"
        />
      </div>
    </div>
  )
}

function generateStaticPreview(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        ${code.replace('export default', 'const Component =')}
        
        ReactDOM.render(React.createElement(Component), document.getElementById('root'));
    </script>
</body>
</html>`
}