'use client'

import { useState, useEffect } from 'react'
import { mcpPluginManager } from '@/lib/mcp/plugin-manager'

interface MCPPlugin {
  id: string
  name: string
  description: string
  endpoint: string
  apiKey?: string
  capabilities: string[]
  icon: string
}

export function MCPPluginPanel() {
  const [plugins, setPlugins] = useState<MCPPlugin[]>([])
  const [selectedPlugin, setSelectedPlugin] = useState<string>('')
  const [prompt, setPrompt] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [showInstallForm, setShowInstallForm] = useState(false)

  useEffect(() => {
    setPlugins(mcpPluginManager.getPlugins())
  }, [])

  const handleExecutePlugin = async () => {
    if (!selectedPlugin || !prompt) return

    const plugin = mcpPluginManager.getPlugin(selectedPlugin)
    if (!plugin) return

    setIsExecuting(true)
    try {
      const result = await mcpPluginManager.executePlugin({
        method: 'generate',
        params: { prompt },
        plugin
      })
      console.log('Plugin result:', result)
    } catch (error) {
      console.error('Plugin execution failed:', error)
    } finally {
      setIsExecuting(false)
    }
  }

  const handleInstallPlugin = async (pluginData: Partial<MCPPlugin>) => {
    const plugin: MCPPlugin = {
      id: pluginData.id || '',
      name: pluginData.name || '',
      description: pluginData.description || '',
      endpoint: pluginData.endpoint || '',
      apiKey: pluginData.apiKey,
      capabilities: pluginData.capabilities || [],
      icon: pluginData.icon || '🔌'
    }

    const success = await mcpPluginManager.installPlugin(plugin)
    if (success) {
      setPlugins(mcpPluginManager.getPlugins())
      setShowInstallForm(false)
    }
  }

  return (
    <div className="p-4 space-y-4" style={{ background: 'var(--graphite-mist)' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">🔌 MCP Plugins</h3>
          <div className="ai-chip text-xs">Custom AI</div>
        </div>
        <button 
          onClick={() => setShowInstallForm(true)}
          className="btn-secondary text-sm"
        >
          + Install
        </button>
      </div>

      {/* Plugin Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Available Plugins</label>
        <div className="space-y-2">
          {plugins.map(plugin => (
            <button
              key={plugin.id}
              onClick={() => setSelectedPlugin(plugin.id)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                selectedPlugin === plugin.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-var(--clay-gray) hover:bg-var(--fog-gray)'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{plugin.icon}</span>
                <span className="font-medium">{plugin.name}</span>
              </div>
              <p className="text-sm opacity-75">{plugin.description}</p>
              <div className="flex gap-1 mt-2">
                {plugin.capabilities.map(cap => (
                  <span key={cap} className="text-xs px-2 py-1 rounded bg-black/20">
                    {cap}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input */}
      {selectedPlugin && (
        <div>
          <label className="block text-sm font-medium mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt for the selected AI plugin..."
            className="w-full p-3 rounded-lg border resize-none"
            style={{ background: 'var(--clay-gray)', borderColor: 'var(--fog-gray)' }}
            rows={3}
          />
        </div>
      )}

      {/* Execute Button */}
      {selectedPlugin && (
        <button
          onClick={handleExecutePlugin}
          disabled={isExecuting || !prompt.trim()}
          className="w-full btn-primary py-3 disabled:opacity-50"
        >
          {isExecuting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin w-4 h-4 border border-current border-t-transparent rounded-full"></div>
              Executing Plugin...
            </div>
          ) : (
            `Execute ${plugins.find(p => p.id === selectedPlugin)?.name}`
          )}
        </button>
      )}

      {/* Install Plugin Form */}
      {showInstallForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4" style={{ background: 'var(--graphite-mist)' }}>
            <h4 className="font-semibold mb-4">Install MCP Plugin</h4>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              handleInstallPlugin({
                id: formData.get('id') as string,
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                endpoint: formData.get('endpoint') as string,
                apiKey: formData.get('apiKey') as string,
                capabilities: (formData.get('capabilities') as string).split(',').map(s => s.trim()),
                icon: formData.get('icon') as string
              })
            }} className="space-y-3">
              <input name="id" placeholder="Plugin ID" className="w-full p-2 rounded border" style={{ background: 'var(--clay-gray)' }} required />
              <input name="name" placeholder="Plugin Name" className="w-full p-2 rounded border" style={{ background: 'var(--clay-gray)' }} required />
              <input name="description" placeholder="Description" className="w-full p-2 rounded border" style={{ background: 'var(--clay-gray)' }} required />
              <input name="endpoint" placeholder="API Endpoint" className="w-full p-2 rounded border" style={{ background: 'var(--clay-gray)' }} required />
              <input name="apiKey" placeholder="API Key (optional)" className="w-full p-2 rounded border" style={{ background: 'var(--clay-gray)' }} />
              <input name="capabilities" placeholder="Capabilities (comma-separated)" className="w-full p-2 rounded border" style={{ background: 'var(--clay-gray)' }} />
              <input name="icon" placeholder="Icon (emoji)" className="w-full p-2 rounded border" style={{ background: 'var(--clay-gray)' }} />
              
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">Install</button>
                <button type="button" onClick={() => setShowInstallForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}