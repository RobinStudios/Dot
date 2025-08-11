'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'



interface MobileLayoutProps {
  children: React.ReactNode
  showTemplates: boolean
  onToggleTemplates: () => void
  showSidebar: boolean
  onToggleSidebar: () => void
  sidebarContent?: React.ReactNode
  templateContent?: React.ReactNode
}

export function MobileLayout({ 
  children, 
  showTemplates, 
  onToggleTemplates, 
  showSidebar, 
  onToggleSidebar,
  sidebarContent,
  templateContent 
}: MobileLayoutProps) {
  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--obsidian)', color: 'var(--cloud-white)' }}>
      {/* Mobile Top Bar - Same as Desktop */}
      <div className="h-14 flex items-center justify-between px-4 border-b" style={{ background: 'var(--graphite-mist)', borderColor: 'var(--clay-gray)' }}>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTemplates}
            className="p-2 rounded-lg" 
            style={{ background: showTemplates ? 'var(--ink-blue)' : 'var(--clay-gray)' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">🎨 AI Designer</h1>
        </div>
        
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg"
          style={{ background: showSidebar ? 'var(--ink-blue)' : 'var(--clay-gray)' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Mobile Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Templates Sidebar - Mobile */}
        {showTemplates && (
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="w-80 border-r" 
            style={{ borderColor: 'var(--clay-gray)' }}
          >
            {templateContent}
          </motion.div>
        )}
        
        {/* Main Content */}
        <div className="flex-1">
          {children}
        </div>
        
        {/* Right Sidebar - Mobile */}
        {showSidebar && (
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="w-80 border-l" 
            style={{ borderColor: 'var(--clay-gray)' }}
          >
            {sidebarContent}
          </motion.div>
        )}
      </div>
    </div>
  )
}