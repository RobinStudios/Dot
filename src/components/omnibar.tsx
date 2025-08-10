'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OmnibarProps {
  onCommand: (command: string) => void
}

const SUGGESTIONS = [
  { text: 'Add text', icon: '📝', command: 'add:text' },
  { text: 'Create shape', icon: '⬜', command: 'add:shape' },
  { text: 'Upload image', icon: '🖼️', command: 'add:image' },
  { text: 'Apply minimal serif', icon: '🔤', command: 'ai:typography:minimal-serif' },
  { text: 'Add fade-in animation', icon: '✨', command: 'ai:animate:fade-in' },
  { text: 'Export to React', icon: '⚛️', command: 'export:react' },
  { text: 'Generate brand colors', icon: '🎨', command: 'ai:colors:brand' },
  { text: 'Create logo variations', icon: '🏷️', command: 'ai:logo:variations' }
]

export function Omnibar({ onCommand }: OmnibarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState(SUGGESTIONS)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
        setTimeout(() => inputRef.current?.focus(), 100)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (query) {
      const filtered = SUGGESTIONS.filter(suggestion =>
        suggestion.text.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredSuggestions(filtered)
    } else {
      setFilteredSuggestions(SUGGESTIONS)
    }
  }, [query])

  const handleSuggestionClick = (command: string) => {
    onCommand(command)
    setIsOpen(false)
    setQuery('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onCommand(`ai:prompt:${query}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  return (
    <>
      {/* Omnibar Input */}
      <div className="omnibar">
        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="omnibar-input"
            placeholder="Search, command, or ask AI... (⌘K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
          />
        </form>

        {/* Suggestions Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="omnibar-suggestions"
            >
              {filteredSuggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.command}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick(suggestion.command)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{suggestion.icon}</span>
                    <span className="text-sm">{suggestion.text}</span>
                    {suggestion.command.startsWith('ai:') && (
                      <span className="ai-chip ml-auto">AI</span>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {query && !filteredSuggestions.length && (
                <div className="suggestion-item">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🤖</span>
                    <span className="text-sm">Ask AI: "{query}"</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}