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

import React, { useRef } from 'react'

export function MobileLayout({ 
  children, 
  showTemplates, 
  onToggleTemplates, 
  showSidebar, 
  onToggleSidebar,
  sidebarContent,
  templateContent 
}: MobileLayoutProps) {
  // Swipe gesture support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchEndX.current - touchStartX.current;
      if (diff > 60) {
        // Swipe right: open templates
        if (!showTemplates) onToggleTemplates();
      } else if (diff < -60) {
        // Swipe left: open sidebar
        if (!showSidebar) onToggleSidebar();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--obsidian)', color: 'var(--cloud-white)' }}>
      {/* Mobile Top Bar - Same as Desktop, but larger touch targets */}
      <div className="h-16 flex items-center justify-between px-4 border-b" style={{ background: 'var(--graphite-mist)', borderColor: 'var(--clay-gray)' }}>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTemplates}
            className="p-4 rounded-xl text-lg focus:outline-none active:scale-95 transition-transform"
            style={{ background: showTemplates ? 'var(--ink-blue)' : 'var(--clay-gray)' }}
            aria-label="Open Templates"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-bold tracking-wide">🎨 AI Designer</h1>
        </div>
        <button
          onClick={onToggleSidebar}
          className="p-4 rounded-xl text-lg focus:outline-none active:scale-95 transition-transform"
          style={{ background: showSidebar ? 'var(--ink-blue)' : 'var(--clay-gray)' }}
          aria-label="Open Sidebar"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Mobile Content Area with swipe gesture support */}
      <div
        className="flex-1 flex overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
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

      {/* Bottom Navigation Bar for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--graphite-mist)] border-t border-[var(--clay-gray)] flex justify-around items-center h-16 shadow-lg">
        <button
          onClick={onToggleTemplates}
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl text-base ${showTemplates ? 'text-blue-500 font-bold' : 'text-white'}`}
          aria-label="Templates"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          Templates
        </button>
        <button
          onClick={onToggleSidebar}
          className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl text-base ${showSidebar ? 'text-blue-500 font-bold' : 'text-white'}`}
          aria-label="Sidebar"
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
          Sidebar
        </button>
        <button
          className="flex flex-col items-center justify-center px-4 py-2 rounded-xl text-base text-white"
          aria-label="Canvas"
          style={{ pointerEvents: 'none', opacity: 0.6 }}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" /></svg>
          Canvas
        </button>
        <button
          className="flex flex-col items-center justify-center px-4 py-2 rounded-xl text-base text-white"
          aria-label="Settings"
          style={{ pointerEvents: 'none', opacity: 0.6 }}
        >
          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /></svg>
          Settings
        </button>
      </nav>
    </div>
  )
}