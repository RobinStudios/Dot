'use client'

import { MOCKUP_TEMPLATES, MockupTemplate } from '@/lib/templates/mockup-templates'

interface TemplateSelectorProps {
  onSelect: (template: MockupTemplate) => void
  selectedId?: string
}

export function TemplateSelector({ onSelect, selectedId }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {MOCKUP_TEMPLATES.map(template => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className={`p-4 border rounded-lg text-left transition-colors ${
            selectedId === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <h3 className="font-semibold text-sm mb-2">{template.name}</h3>
          <p className="text-xs text-gray-600 capitalize">{template.category}</p>
        </button>
      ))}
    </div>
  )
}