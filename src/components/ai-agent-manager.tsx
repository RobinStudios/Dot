'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AIAgent } from '@/lib/ai/agent-registry'

interface AIAgentManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function AIAgentManager({ isOpen, onClose }: AIAgentManagerProps) {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [activeTab, setActiveTab] = useState<'browse' | 'custom' | 'settings'>('browse')
  const [customAgent, setCustomAgent] = useState({
    name: '',
    provider: 'custom',
    type: 'text' as const,
    apiEndpoint: '',
    apiKey: '',
    specialties: [] as string[]
  })

  useEffect(() => {
    if (isOpen) {
      fetchAgents()
    }
  }, [isOpen])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents(data.agents)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    }
  }

  const addCustomAgent = async () => {
    try {
      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customAgent)
      })
      
      if (response.ok) {
        fetchAgents()
        setCustomAgent({
          name: '',
          provider: 'custom',
          type: 'text',
          apiEndpoint: '',
          apiKey: '',
          specialties: []
        })
      }
    } catch (error) {
      console.error('Failed to add agent:', error)
    }
  }

  const toggleAgent = async (agentId: string, enabled: boolean) => {
    try {
      await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      })
      fetchAgents()
    } catch (error) {
      console.error('Failed to toggle agent:', error)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🤖 AI Agent Manager</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          
          <div className="flex space-x-4 mt-4">
            {['browse', 'custom', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {activeTab === 'browse' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Available AI Agents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(agent => (
                  <div key={agent.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{agent.name}</h4>
                      <div className="flex items-center space-x-2">
                        {agent.isFineTuned && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Fine-tuned</span>}
                        {agent.isDefault && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Default</span>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Provider: {agent.provider}</p>
                    <p className="text-sm text-gray-600 mb-2">Type: {agent.type}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {agent.specialties.map(specialty => (
                        <span key={specialty} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {specialty.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => toggleAgent(agent.id, !agent.isDefault)}
                      className={`w-full py-2 rounded ${
                        agent.isDefault 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {agent.isDefault ? 'Enabled' : 'Enable'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Add Custom AI Agent</h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Agent Name"
                  value={customAgent.name}
                  onChange={(e) => setCustomAgent({...customAgent, name: e.target.value})}
                  className="p-2 border rounded"
                />
                <select
                  value={customAgent.type}
                  onChange={(e) => setCustomAgent({...customAgent, type: e.target.value as any})}
                  className="p-2 border rounded"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="code">Code</option>
                  <option value="multimodal">Multimodal</option>
                </select>
                <input
                  type="url"
                  placeholder="API Endpoint"
                  value={customAgent.apiEndpoint}
                  onChange={(e) => setCustomAgent({...customAgent, apiEndpoint: e.target.value})}
                  className="p-2 border rounded"
                />
                <input
                  type="password"
                  placeholder="API Key"
                  value={customAgent.apiKey}
                  onChange={(e) => setCustomAgent({...customAgent, apiKey: e.target.value})}
                  className="p-2 border rounded"
                />
              </div>
              <button
                onClick={addCustomAgent}
                className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
              >
                Add Custom Agent
              </button>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Agent Settings</h3>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Auto-select best agent for each task</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" defaultChecked />
                  <span>Enable agent fallback on failure</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" />
                  <span>Show agent selection in UI</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}