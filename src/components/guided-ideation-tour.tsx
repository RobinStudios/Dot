'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TourStep {
  mockupId: string
  title: string
  description: string
  keyPoints: string[]
  promptAlignment: string
}

interface GuidedIdeationTourProps {
  mockups: any[]
  originalPrompt: string
  isOpen: boolean
  onClose: () => void
}

export function GuidedIdeationTour({ mockups, originalPrompt, isOpen, onClose }: GuidedIdeationTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [tourSteps, setTourSteps] = useState<TourStep[]>([])
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (isOpen && mockups.length > 0) {
      generateTourSteps()
    }
  }, [isOpen, mockups, originalPrompt])

  const generateTourSteps = () => {
    const steps: TourStep[] = mockups.map((mockup, index) => ({
      mockupId: mockup.id,
      title: `Design Approach ${index + 1}`,
      description: generateDescription(mockup, originalPrompt),
      keyPoints: generateKeyPoints(mockup),
      promptAlignment: analyzePromptAlignment(mockup, originalPrompt)
    }))
    setTourSteps(steps)
  }

  const generateDescription = (mockup: any, prompt: string): string => {
    const style = mockup.style || 'modern'
    const layout = mockup.layout?.type || 'grid'
    const colors = mockup.colors?.length || 3
    
    return `This ${style} design uses a ${layout} layout with ${colors} carefully selected colors. The approach emphasizes ${getDesignEmphasis(mockup)} to create a compelling visual hierarchy that directly addresses your prompt: "${prompt.substring(0, 50)}..."`
  }

  const generateKeyPoints = (mockup: any): string[] => {
    const points = []
    
    if (mockup.colors?.length > 3) {
      points.push(`Rich color palette (${mockup.colors.length} colors) creates visual depth`)
    }
    
    if (mockup.typography?.fontPairs > 1) {
      points.push('Strategic font pairing enhances readability and hierarchy')
    }
    
    if (mockup.layout?.responsive) {
      points.push('Mobile-first responsive design ensures accessibility across devices')
    }
    
    if (mockup.elements?.some((e: any) => e.type === 'image')) {
      points.push('Visual elements support the core message and brand identity')
    }
    
    if (mockup.accessibilityScore > 70) {
      points.push('High accessibility score ensures inclusive design principles')
    }
    
    return points.length > 0 ? points : [
      'Clean, focused design approach',
      'Balanced composition and spacing',
      'Clear visual hierarchy'
    ]
  }

  const analyzePromptAlignment = (mockup: any, prompt: string): string => {
    const promptWords = prompt.toLowerCase().split(' ')
    const alignmentFactors = []
    
    if (promptWords.includes('modern') && mockup.style?.includes('modern')) {
      alignmentFactors.push('modern aesthetic')
    }
    if (promptWords.includes('professional') && mockup.style?.includes('professional')) {
      alignmentFactors.push('professional tone')
    }
    if (promptWords.includes('colorful') && mockup.colors?.length > 4) {
      alignmentFactors.push('vibrant color usage')
    }
    if (promptWords.includes('minimal') && mockup.style?.includes('minimal')) {
      alignmentFactors.push('minimalist approach')
    }
    
    return alignmentFactors.length > 0 
      ? `Directly addresses: ${alignmentFactors.join(', ')}`
      : 'Interprets the prompt through creative visual storytelling'
  }

  const getDesignEmphasis = (mockup: any): string => {
    if (mockup.contrastScore > 80) return 'high contrast and bold typography'
    if (mockup.styleScore > 80) return 'sophisticated styling and composition'
    if (mockup.accessibilityScore > 80) return 'inclusive design and usability'
    return 'balanced visual elements and user experience'
  }

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const startAutoPlay = () => {
    setIsPlaying(true)
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= tourSteps.length - 1) {
          setIsPlaying(false)
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 5000)
  }

  if (!isOpen || tourSteps.length === 0) return null

  const currentTourStep = tourSteps[currentStep]
  const currentMockup = mockups.find(m => m.id === currentTourStep?.mockupId)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Guided Design Tour
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Step {currentStep + 1} of {tourSteps.length}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={startAutoPlay}
                  disabled={isPlaying}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 disabled:opacity-50"
                >
                  {isPlaying ? '▶️ Playing' : '▶️ Auto Play'}
                </button>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 flex space-x-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Mockup Preview */}
            <div className="w-1/2">
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                <span className="text-gray-400">Design Preview</span>
              </div>
              
              {/* Mockup Stats */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">
                  <div className="font-medium text-blue-700 dark:text-blue-300">Style</div>
                  <div className="text-blue-600 dark:text-blue-400">{currentMockup?.styleScore || 0}/100</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded text-center">
                  <div className="font-medium text-green-700 dark:text-green-300">Contrast</div>
                  <div className="text-green-600 dark:text-green-400">{currentMockup?.contrastScore || 0}/100</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-center">
                  <div className="font-medium text-purple-700 dark:text-purple-300">A11y</div>
                  <div className="text-purple-600 dark:text-purple-400">{currentMockup?.accessibilityScore || 0}/100</div>
                </div>
              </div>
            </div>

            {/* Tour Content */}
            <div className="w-1/2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {currentTourStep.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {currentTourStep.description}
                </p>
              </div>

              {/* Key Points */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Design Decisions:</h4>
                <ul className="space-y-2">
                  {currentTourStep.keyPoints.map((point, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prompt Alignment */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">Prompt Alignment:</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {currentTourStep.promptAlignment}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>

              {/* Progress Dots */}
              <div className="flex space-x-2">
                {tourSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStep(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep 
                        ? 'bg-blue-500' 
                        : index < currentStep 
                          ? 'bg-blue-300' 
                          : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={currentStep === tourSteps.length - 1 ? onClose : nextStep}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                {currentStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next →'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}