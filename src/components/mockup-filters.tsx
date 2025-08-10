'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface MockupFiltersProps {
  mockups: any[]
  onFilter: (filtered: any[]) => void
  clusters: any[]
}

export function MockupFilters({ mockups, onFilter, clusters }: MockupFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('overall')

  const moodTags = [
    { id: 'corporate', label: 'Corporate', color: 'blue' },
    { id: 'playful', label: 'Playful', color: 'pink' },
    { id: 'elegant', label: 'Elegant', color: 'purple' },
    { id: 'modern', label: 'Modern', color: 'gray' },
    { id: 'vintage', label: 'Vintage', color: 'amber' },
    { id: 'minimalist', label: 'Minimalist', color: 'slate' }
  ]

  const sortOptions = [
    { value: 'overall', label: 'Overall Score' },
    { value: 'style', label: 'Style Score' },
    { value: 'contrast', label: 'Contrast' },
    { value: 'accessibility', label: 'Accessibility' }
  ]

  const toggleFilter = (filterId: string) => {
    const newFilters = activeFilters.includes(filterId)
      ? activeFilters.filter(f => f !== filterId)
      : [...activeFilters, filterId]
    
    setActiveFilters(newFilters)
    applyFilters(newFilters, sortBy)
  }

  const applyFilters = (filters: string[], sort: string) => {
    let filtered = mockups

    if (filters.length > 0) {
      filtered = mockups.filter(mockup => 
        filters.some(filter => 
          mockup.style?.includes(filter) || 
          mockup.cluster === filter ||
          mockup.tags?.includes(filter)
        )
      )
    }

    // Sort mockups
    filtered.sort((a, b) => {
      switch (sort) {
        case 'style': return (b.styleScore || 0) - (a.styleScore || 0)
        case 'contrast': return (b.contrastScore || 0) - (a.contrastScore || 0)
        case 'accessibility': return (b.accessibilityScore || 0) - (a.accessibilityScore || 0)
        default: return (b.overallScore || 0) - (a.overallScore || 0)
      }
    })

    onFilter(filtered)
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col space-y-4">
        {/* Mood Tags */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Mood
          </h3>
          <div className="flex flex-wrap gap-2">
            {moodTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleFilter(tag.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  activeFilters.includes(tag.id)
                    ? `bg-${tag.color}-500 text-white`
                    : `bg-${tag.color}-100 text-${tag.color}-700 hover:bg-${tag.color}-200`
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value)
              applyFilters(activeFilters, e.target.value)
            }}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Cluster Summary */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {clusters.slice(0, 3).map(cluster => (
            <div key={cluster.cluster} className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
              <div className="font-medium capitalize">{cluster.cluster}</div>
              <div className="text-gray-500">{cluster.mockups.length} designs</div>
              <div className="text-green-600">Score: {cluster.averageScore.toFixed(1)}</div>
            </div>
          ))}
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {activeFilters.map(filter => (
              <span
                key={filter}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs flex items-center space-x-1"
              >
                <span>{filter}</span>
                <button
                  onClick={() => toggleFilter(filter)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setActiveFilters([])
                applyFilters([], sortBy)
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  )
}