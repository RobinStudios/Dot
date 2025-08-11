'use client';

import { useState } from 'react';
import { FigmaDesignEditor } from './figma-design-editor';
import { FigmaPropertiesPanel } from './figma-properties-panel';
import { FigmaLayersPanel } from './figma-layers-panel';
import { LoadingState, ErrorState } from '@/components/ui/error-state';
import { useRetry } from '@/hooks/useRetry';
import { toast } from '@/components/ui/toast';

export function EnhancedFigmaEditor() {
  const [designElements, setDesignElements] = useState<any[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const saveDesign = async (elements: any[]) => {
    const response = await fetch('/api/designs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ elements })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save design');
    }
    
    return response.json();
  };

  const { execute: saveWithRetry, isLoading: isSaving, error: saveError } = useRetry(
    saveDesign,
    {
      maxRetries: 3,
      onError: (error) => {
        toast.error('Failed to save design. Please try again.');
      }
    }
  );

  const handleElementsChange = async (newElements: any[]) => {
    setDesignElements(newElements);
    
    // Auto-save with retry
    if (newElements.length > 0) {
      await saveWithRetry(newElements);
    }
  };

  const handleElementUpdate = (id: string, prop: string, value: any) => {
    const updatedElements = designElements.map(el => 
      el.id === id ? { ...el, [prop]: value } : el
    );
    handleElementsChange(updatedElements);
  };

  if (isLoading) {
    return <LoadingState message="Loading design editor..." />;
  }

  return (
    <div className="flex h-full">
      <FigmaLayersPanel 
        elements={designElements}
        selectedElementId={selectedElementId}
        onElementSelect={setSelectedElementId}
        onElementsReorder={handleElementsChange}
        onElementUpdate={handleElementUpdate}
        onElementDelete={(id) => {
          const filtered = designElements.filter(el => el.id !== id);
          handleElementsChange(filtered);
          setSelectedElementId('');
        }}
      />
      
      <div className="flex-1 relative">
        <FigmaDesignEditor 
          elements={designElements}
          onElementsChange={handleElementsChange}
          selectedElementId={selectedElementId}
          onElementSelect={setSelectedElementId}
        />
        
        {isSaving && (
          <div className="absolute top-4 right-4 bg-graphite-mist/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-cloud-white">
            Saving...
          </div>
        )}
        
        {saveError && (
          <div className="absolute top-4 right-4 bg-red-900/90 backdrop-blur-sm px-3 py-2 rounded-lg text-sm text-white">
            Save failed - changes stored locally
          </div>
        )}
      </div>
      
      <FigmaPropertiesPanel 
        selectedElement={designElements.find(el => el.id === selectedElementId) || null}
        onElementUpdate={handleElementUpdate}
      />
    </div>
  );
}