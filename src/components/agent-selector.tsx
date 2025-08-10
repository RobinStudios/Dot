'use client'

import { useState, useEffect } from 'react'
import { AIAgent } from '@/lib/ai/agent-registry'

interface AgentSelectorProps {
  taskType: string
  onAgentSelect: (agentId: string | null) => void
  selectedAgent?: string | null
}

export function AgentSelector({ taskType, onAgentSelect, selectedAgent }: AgentSelectorProps) {
  const [agents, setAgents] = useState<AIAgent[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    fetchAgents()
  }, [])

  const fetchAgents = async () => {
    try {
      const response = await fetch('/api/agents')
      const data = await response.json()
      setAgents(data.agents)
    } catch (error) {
      console.error('Failed to fetch agents:', error)
    }
  }

  const getRecommendedAgents = () => {
    return agents.filter(agent => {
      switch (taskType) {
        case 'design_generation':
          return agent.specialties.includes('layout_design') || agent.type === 'multimodal'
        case 'asset_creation':
          return agent.type === 'image' || agent.specialties.includes('icon_creation')
        case 'copywriting':
          return agent.specialties.includes('marketing_copy') || agent.type === 'text'
        case 'code_export':
          return agent.type === 'code' || agent.specialties.includes('layout_design')
        default:
          return true
      }
    })
  }

  const currentAgent = selectedAgent ? agents.find(a => a.id === selectedAgent) : null
  const recommendedAgents = getRecommendedAgents()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <span className="text-sm">
          {currentAgent ? currentAgent.name : 'Auto-select best agent'}
        </span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-900">Select AI Agent</h3>
            <p className="text-xs text-gray-500">Choose an agent for {taskType.replace('_', ' ')}</p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            <button
              onClick={() => {
                onAgentSelect(null)
                setIsOpen(false)
              }}
              className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 ${
                !selectedAgent ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">🤖 Auto-select</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recommended</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Automatically choose the best agent for this task
              </p>
            </button>

            {recommendedAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => {
                  onAgentSelect(agent.id)
                  setIsOpen(false)
                }}
                className={`w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 ${
                  selectedAgent === agent.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{agent.name}</span>
                  <div className="flex space-x-1">
                    {agent.isFineTuned && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Fine-tuned
                      </span>
                    )}
                    {agent.isDefault && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {agent.provider} • {agent.type} • {agent.specialties.slice(0, 2).join(', ')}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}