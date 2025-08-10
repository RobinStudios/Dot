'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDeviceDetection } from '@/hooks/useDeviceDetection'

interface ResponsiveLayoutProps {
  children: React.ReactNode
  sidebar?: React.ReactNode
  toolbar?: React.ReactNode
}

export function ResponsiveLayout({ children, sidebar, toolbar }: ResponsiveLayoutProps) {
  const { isMobile, isTouchDevice } = useDeviceDetection()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50 safe-area-inset">
        {/* Mobile Header */}
        <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">AI Designer</h1>
          <div className="w-10" />
        </header>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSidebarOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              className="w-80 h-full bg-white shadow-xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tools</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">{sidebar}</div>
            </motion.div>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">{children}</main>

        {/* Mobile Toolbar */}
        <div className="bg-white border-t px-4 py-2 safe-area-inset-bottom">
          {toolbar || (
            <div className="flex items-center justify-around">
              <button className="p-3 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button className="p-3 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-3 bg-blue-500 text-white rounded-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <button className="p-3 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-3 rounded-lg hover:bg-gray-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Desktop Layout
  return (
    <div className="h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      {sidebar && (
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          {sidebar}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {toolbar && (
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            {toolbar}
          </div>
        )}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  )
}