interface MCPPlugin {
  id: string
  name: string
  description: string
  endpoint: string
  apiKey?: string
  capabilities: string[]
  icon: string
}

interface MCPRequest {
  method: string
  params: any
  plugin: MCPPlugin
}

export class MCPPluginManager {
  private plugins: Map<string, MCPPlugin> = new Map()

  constructor() {
    this.loadDefaultPlugins()
  }

  private loadDefaultPlugins() {
    const defaultPlugins: MCPPlugin[] = [
      {
        id: 'openai-gpt4',
        name: 'OpenAI GPT-4',
        description: 'Advanced text generation and code assistance',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        capabilities: ['text-generation', 'code-generation', 'analysis'],
        icon: '🤖'
      },
      {
        id: 'midjourney',
        name: 'Midjourney',
        description: 'High-quality AI image generation',
        endpoint: 'https://api.midjourney.com/v1/imagine',
        capabilities: ['image-generation', 'style-transfer'],
        icon: '🎨'
      },
      {
        id: 'runway-ml',
        name: 'Runway ML',
        description: 'Creative AI tools for video and images',
        endpoint: 'https://api.runwayml.com/v1/generate',
        capabilities: ['image-generation', 'video-generation'],
        icon: '🎬'
      }
    ]

    defaultPlugins.forEach(plugin => {
      this.plugins.set(plugin.id, plugin)
    })
  }

  async installPlugin(plugin: MCPPlugin): Promise<boolean> {
    try {
      if (!plugin.id || !plugin.name || !plugin.endpoint) {
        throw new Error('Invalid plugin configuration')
      }

      this.plugins.set(plugin.id, plugin)
      return true
    } catch (error) {
      console.error('Plugin installation failed:', error)
      return false
    }
  }

  async executePlugin(request: MCPRequest): Promise<any> {
    const plugin = request.plugin

    try {
      const response = await fetch(plugin.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(plugin.apiKey && { 'Authorization': `Bearer ${plugin.apiKey}` })
        },
        body: JSON.stringify({
          method: request.method,
          params: request.params
        })
      })

      if (!response.ok) {
        throw new Error(`Plugin request failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Plugin execution failed:', error)
      throw error
    }
  }

  getPlugins(): MCPPlugin[] {
    return Array.from(this.plugins.values())
  }

  getPlugin(id: string): MCPPlugin | undefined {
    return this.plugins.get(id)
  }

  getPluginsByCapability(capability: string): MCPPlugin[] {
    return this.getPlugins().filter(plugin => 
      plugin.capabilities.includes(capability)
    )
  }
}

export const mcpPluginManager = new MCPPluginManager()