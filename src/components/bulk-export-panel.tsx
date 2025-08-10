'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ExportConfig, BulkExportJob } from '@/lib/ai/bulk-export-engine'

interface BulkExportPanelProps {
  mockups: any[]
  isOpen: boolean
  onClose: () => void
}

export function BulkExportPanel({ mockups, isOpen, onClose }: BulkExportPanelProps) {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'react',
    styling: 'tailwind',
    responsive: true,
    optimization: 'production',
    bundling: false
  })
  const [jobs, setJobs] = useState<BulkExportJob[]>([])
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchJobs()
      const interval = setInterval(fetchJobs, 2000)
      return () => clearInterval(interval)
    }
  }, [isOpen])

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/export/jobs')
      const data = await response.json()
      setJobs(data.jobs)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    }
  }

  const startBulkExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/export/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mockups: mockups.map(m => ({ id: m.id, ...m })),
          config
        })
      })
      
      if (response.ok) {
        fetchJobs()
      }
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadResults = async (jobId: string) => {
    try {
      const response = await fetch(`/api/export/jobs/${jobId}/download`)
      const blob = await response.blob()
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export_${jobId}.zip`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
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
            <h2 className="text-xl font-bold">⚡ Bulk Export</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Export {mockups.length} mockups to production-ready code
          </p>
        </div>

        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Export Configuration */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Export Configuration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <select
                  value={config.format}
                  onChange={(e) => setConfig({...config, format: e.target.value as any})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="html">HTML + CSS</option>
                  <option value="react">React + TypeScript</option>
                  <option value="vue">Vue 3 + TypeScript</option>
                  <option value="angular">Angular</option>
                  <option value="figma">Figma JSON</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Styling</label>
                <select
                  value={config.styling}
                  onChange={(e) => setConfig({...config, styling: e.target.value as any})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="css">Plain CSS</option>
                  <option value="tailwind">Tailwind CSS</option>
                  <option value="styled-components">Styled Components</option>
                  <option value="emotion">Emotion</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Optimization</label>
                <select
                  value={config.optimization}
                  onChange={(e) => setConfig({...config, optimization: e.target.value as any})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="development">Development</option>
                  <option value="production">Production</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.responsive}
                    onChange={(e) => setConfig({...config, responsive: e.target.checked})}
                  />
                  <span className="text-sm">Responsive</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.bundling}
                    onChange={(e) => setConfig({...config, bundling: e.target.checked})}
                  />
                  <span className="text-sm">Bundle</span>
                </label>
              </div>
            </div>

            <button
              onClick={startBulkExport}
              disabled={isExporting || mockups.length === 0}
              className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Starting Export...
                </>
              ) : (
                <>
                  <span className="mr-2">⚡</span>
                  Export {mockups.length} Mockups
                </>
              )}
            </button>
          </div>

          {/* Export Jobs */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Export Jobs</h3>
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No export jobs yet. Start your first bulk export above.
                </div>
              ) : (
                jobs.map(job => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">
                          {job.mockups.length} mockups → {job.config.format.toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(job.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          job.status === 'completed' ? 'bg-green-100 text-green-700' :
                          job.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          job.status === 'failed' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status}
                        </span>
                        {job.status === 'completed' && (
                          <button
                            onClick={() => downloadResults(job.id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            Download
                          </button>
                        )}
                      </div>
                    </div>

                    {job.status === 'processing' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}

                    {job.status === 'completed' && (
                      <div className="mt-2 text-sm text-gray-600">
                        Generated {job.results.length} files
                        {job.results.some(r => r.errors) && (
                          <span className="text-red-500 ml-2">
                            ({job.results.filter(r => r.errors).length} with errors)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}