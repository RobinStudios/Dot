'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDesignStore } from '@/store/design-store'
import { DesignMockup } from '@/types'
import { MockupFilters } from './mockup-filters'
import { useAIRating } from '@/hooks/useAIRating'
import { GuidedIdeationTour } from './guided-ideation-tour'

interface MockupGalleryProps {
  isOpen: boolean
  onClose: () => void
  mockups: DesignMockup[]
  clusters?: any[]
  topThree?: any[]
  originalPrompt?: string
}

export function MockupGallery({ isOpen, onClose, mockups, clusters = [], topThree = [], originalPrompt = '' }: MockupGalleryProps) {
  const { setCurrentMockup, deleteMockup, addMockup } = useDesignStore()
  const [selectedMockup, setSelectedMockup] = useState<DesignMockup | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredMockups, setFilteredMockups] = useState(mockups)
  const [showTour, setShowTour] = useState(false)
  // const [showVoting, setShowVoting] = useState(false)

  const handleMockupSelect = (mockup: DesignMockup) => {
    setCurrentMockup(mockup)
    onClose()
  }

  const handleMockupDelete = (mockupId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteMockup(mockupId)
  }

  const handleMockupDuplicate = (mockup: DesignMockup, e: React.MouseEvent) => {
    e.stopPropagation();
    // Duplicate the mockup with a new id and timestamps
    const newId = `mockup-${Date.now()}`;
    const duplicated: DesignMockup = {
      ...mockup,
      id: newId,
      title: `${mockup.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      elements: mockup.elements.map(el => ({
        ...el,
        id: `${el.id}-copy-${Date.now()}`,
        children: el.children ? el.children.map(child => ({ ...child, id: `${child.id}-copy-${Date.now()}` })) : undefined,
      })),
    };
    addMockup(duplicated);
  }

  return (
    <AnimatePresence>
      {isOpen && (
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
            className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-secondary-900 dark:text-white">
                    Design Gallery
                  </h2>
                  <p className="text-secondary-500 dark:text-secondary-400">
                    {mockups.length} design{mockups.length !== 1 ? 's' : ''} created
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowTour(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                  >
                    🎯 Tour
                  </button>
                  {/*
                  <button
                    onClick={() => setShowVoting(!showVoting)}
                    className="px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600"
                  >
                    🗳️ Vote
                  </button>
                  */}
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-2 text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300"
                  >
                    {viewMode === 'grid' ? '📋' : '🔲'}
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="px-6 py-4 border-b border-secondary-200 dark:border-secondary-700">
              <MockupFilters 
                mockups={mockups} 
                onFilter={setFilteredMockups}
                clusters={clusters}
              />
            </div>

            {/* AI Rating Highlight (to be implemented) */}
            {/* TODO: Show top-rated designs by AI here */}

            {/* AI Rating Section (to be implemented) */}
            {/* TODO: Add AI-based design rating here */}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {filteredMockups.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-secondary-200 dark:bg-secondary-700 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-2">
                    No designs yet
                  </h3>
                  <p className="text-secondary-500 dark:text-secondary-400">
                    Create your first design using the AI generator
                  </p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                  <AnimatePresence>
                    <>
                      {filteredMockups.map((mockup) => {
                        const { rating, critique, suggestions, loading, error, fetchRating } = useAIRating(mockup);
                        React.useEffect(() => { fetchRating(); }, []);
                        return (
                          <motion.div
                            key={mockup.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                          >
                            <div
                              className={`bg-white dark:bg-secondary-700 rounded-lg shadow-soft border border-secondary-200 dark:border-secondary-600 overflow-hidden cursor-pointer hover:shadow-medium transition-shadow ${viewMode === 'list' ? 'flex items-center space-x-4' : ''}`}
                              onClick={() => handleMockupSelect(mockup)}
                            >
                              {/* Thumbnail */}
                              <div className={`relative ${viewMode === 'list' ? 'w-24 h-24 flex-shrink-0' : 'h-48'}`}>
                                <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 flex items-center justify-center">
                                  <span className="text-4xl">🎨</span>
                                </div>
                                <div className="absolute top-2 right-2 flex space-x-1">
                                  <button
                                    onClick={(e) => handleMockupDuplicate(mockup, e)}
                                    className="w-6 h-6 bg-white dark:bg-secondary-600 rounded-full flex items-center justify-center text-xs shadow-sm hover:bg-secondary-50 dark:hover:bg-secondary-500"
                                  >
                                    📋
                                  </button>
                                  <button
                                    onClick={(e) => handleMockupDelete(mockup.id, e)}
                                    className="w-6 h-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-xs text-red-500 shadow-sm hover:bg-red-200 dark:hover:bg-red-900/50"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>

                              {/* Content */}
                              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                                <h3 className="font-semibold text-secondary-900 dark:text-white mb-1 truncate">
                                  {mockup.title}
                                </h3>
                                <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2 line-clamp-2">
                                  {mockup.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-secondary-400 dark:text-secondary-500 mb-2">
                                  <span>{mockup.elements?.length || 0} elements</span>
                                </div>
                                {/* AI Rating Display */}
                                <div className="mt-2">
                                  {loading ? (
                                    <span className="text-xs text-blue-500">AI rating...</span>
                                  ) : error ? (
                                    <span className="text-xs text-red-500">AI rating error</span>
                                  ) : rating !== null ? (
                                    <div>
                                      <span className="text-sm font-bold text-green-600">AI Score: {rating}/10</span>
                                      {critique && <div className="text-xs mt-1 text-secondary-600">{critique}</div>}
                                      {suggestions.length > 0 && (
                                        <ul className="text-xs mt-1 text-secondary-500 list-disc list-inside">
                                          {suggestions.map((s, i) => <li key={i}>{s}</li>)}
                                        </ul>
                                      )}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </>
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary-500 dark:text-secondary-400">
                Click on a design to open it in the editor
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-secondary-200 dark:bg-secondary-600 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-300 dark:hover:bg-secondary-500 transition-colors"
              >
                Close
              </button>
            </div>

            {/* Guided Tour */}
            <GuidedIdeationTour 
              mockups={filteredMockups}
              originalPrompt={originalPrompt}
              isOpen={showTour}
              onClose={() => setShowTour(false)}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
