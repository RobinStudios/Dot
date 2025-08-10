'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface AdvancedFeaturesPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function AdvancedFeaturesPanel({ isOpen, onClose }: AdvancedFeaturesPanelProps) {
  const [activeFeature, setActiveFeature] = useState('clustering')

  const features = [
    {
      id: 'clustering',
      title: 'Concept Clustering & Scoring',
      icon: '🎯',
      description: 'Automatically groups similar mockups and highlights top 3 based on style, contrast, and accessibility metrics.',
      benefits: [
        'Smart grouping by design style and approach',
        'Objective scoring system for quality assessment',
        'Instant identification of best-performing designs',
        'Data-driven design decision making'
      ]
    },
    {
      id: 'filters',
      title: 'Style Presets & Filters',
      icon: '🎨',
      description: 'Filter the 10 outputs by mood tags—"corporate," "playful," "elegant"—for instant narrowing.',
      benefits: [
        'Quick filtering by mood and style tags',
        'Sort by style, contrast, or accessibility scores',
        'Cluster-based organization',
        'Real-time filtering with visual feedback'
      ]
    },
    {
      id: 'voting',
      title: 'Collaborative Voting',
      icon: '🗳️',
      description: 'Teams upvote favorites directly in your app, with real-time analytics on selection trends.',
      benefits: [
        'Real-time team voting on design options',
        'Live analytics and trending indicators',
        'Vote percentage tracking',
        'Activity feed for team engagement'
      ]
    },
    {
      id: 'tours',
      title: 'Guided Ideation Tours',
      icon: '🎪',
      description: 'A built-in walkthrough that narrates how each mockup addresses the original prompt\'s key goals.',
      benefits: [
        'Step-by-step design explanation',
        'Prompt alignment analysis',
        'Key design decision highlights',
        'Auto-play tour functionality'
      ]
    }
  ]

  const currentFeature = features.find(f => f.id === activeFeature)

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Advanced AI Features
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Powerful tools to enhance your design workflow
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Feature Navigation */}
          <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-2">
              {features.map(feature => (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`w-full p-4 text-left rounded-lg transition-colors ${
                    activeFeature === feature.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {feature.description.substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Feature Details */}
          <div className="flex-1 p-6">
            {currentFeature && (
              <motion.div
                key={currentFeature.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-4xl">{currentFeature.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {currentFeature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {currentFeature.description}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Key Benefits:
                  </h4>
                  <div className="space-y-3">
                    {currentFeature.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <span className="text-green-500 mt-1">✓</span>
                        <span className="text-gray-600 dark:text-gray-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feature Demo */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    How it works:
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {currentFeature.id === 'clustering' && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                          <span>AI analyzes all generated mockups</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                          <span>Groups similar designs by style and approach</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                          <span>Scores each design on style, contrast, and accessibility</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                          <span>Highlights top 3 performers automatically</span>
                        </div>
                      </div>
                    )}
                    {currentFeature.id === 'filters' && (
                      <div className="space-y-2">
                        <div>Click mood tags like "Corporate", "Playful", or "Elegant" to instantly filter designs</div>
                        <div>Sort by overall score, style quality, contrast ratio, or accessibility rating</div>
                        <div>View cluster summaries showing design count and average scores</div>
                      </div>
                    )}
                    {currentFeature.id === 'voting' && (
                      <div className="space-y-2">
                        <div>Team members vote on their favorite designs with heart icons</div>
                        <div>Real-time analytics show voting trends and percentages</div>
                        <div>Activity feed tracks recent voting activity</div>
                        <div>Top 3 most voted designs are highlighted with rankings</div>
                      </div>
                    )}
                    {currentFeature.id === 'tours' && (
                      <div className="space-y-2">
                        <div>Step-by-step walkthrough of each design's approach</div>
                        <div>Explains how design elements address the original prompt</div>
                        <div>Highlights key design decisions and their rationale</div>
                        <div>Auto-play mode for hands-free presentation</div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              These features are automatically available when generating designs
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Got it!
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}