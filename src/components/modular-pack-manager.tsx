'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ModularPack } from '@/lib/ai/adaptive-agent'

interface ModularPackManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function ModularPackManager({ isOpen, onClose }: ModularPackManagerProps) {
  const [installedPacks, setInstalledPacks] = useState<ModularPack[]>([])
  const [availablePacks, setAvailablePacks] = useState<ModularPack[]>([])
  const [installing, setInstalling] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchPacks()
    }
  }, [isOpen])

  const fetchPacks = async () => {
    try {
      const response = await fetch('/api/agents/packs')
      const data = await response.json()
      setInstalledPacks(data.installed)
      setAvailablePacks(data.available)
    } catch (error) {
      console.error('Failed to fetch packs:', error)
    }
  }

  const installPack = async (packId: string) => {
    setInstalling(packId)
    try {
      const response = await fetch(`/api/agents/packs/${packId}/install`, {
        method: 'POST'
      })
      
      if (response.ok) {
        fetchPacks()
      }
    } catch (error) {
      console.error('Failed to install pack:', error)
    } finally {
      setInstalling(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'design': return '🎨'
      case 'code': return '💻'
      case 'content': return '📝'
      case 'workflow': return '⚡'
      default: return '📦'
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
            <h2 className="text-xl font-bold">📦 AI Pack Manager</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Install modular AI packs to enhance your workflow
          </p>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Installed Packs */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Installed Packs ({installedPacks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {installedPacks.map(pack => (
                <div key={pack.id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(pack.category)}</span>
                      <h4 className="font-medium">{pack.name}</h4>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Installed
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    Category: {pack.category}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {pack.capabilities.slice(0, 3).map(cap => (
                      <span key={cap} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {cap.replace('_', ' ')}
                      </span>
                    ))}
                    {pack.capabilities.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{pack.capabilities.length - 3} more
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    Agents: {pack.agents.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Available Packs */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              Available Packs ({availablePacks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availablePacks.map(pack => (
                <div key={pack.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{getCategoryIcon(pack.category)}</span>
                      <h4 className="font-medium">{pack.name}</h4>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded capitalize">
                      {pack.category}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {pack.capabilities.map(cap => (
                      <span key={cap} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {cap.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  {pack.dependencies.length > 0 && (
                    <div className="text-xs text-gray-500 mb-3">
                      Requires: {pack.dependencies.join(', ')}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 mb-3">
                    Includes: {pack.agents.join(', ')}
                  </div>

                  <button
                    onClick={() => installPack(pack.id)}
                    disabled={installing === pack.id}
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {installing === pack.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Installing...
                      </>
                    ) : (
                      'Install Pack'
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}