'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDesignStore } from '@/store/design-store'

export function Toolbar() {
  const { currentMockup, selectedElements, deleteElement, clearSelection, addElement, updateElement } = useDesignStore()
  const [activeTool, setActiveTool] = useState<string | null>(null)

  const tools = [
    { id: 'select', name: 'Select', icon: '👆', shortcut: 'V' },
    { id: 'text', name: 'Text', icon: '📝', shortcut: 'T' },
    { id: 'shape', name: 'Shape', icon: '⬜', shortcut: 'S' },
    { id: 'image', name: 'Image', icon: '🖼️', shortcut: 'I' },
    { id: 'icon', name: 'Icon', icon: '🔘', shortcut: 'O' },
    { id: 'button', name: 'Button', icon: '🔘', shortcut: 'B' },
    { id: 'video', name: 'Video', icon: '🎥', shortcut: 'V' },
  ]

  const handleToolClick = (toolId: string) => {
    setActiveTool(activeTool === toolId ? null : toolId)
  }

  const handleDelete = () => {
    if (selectedElements.length > 0) {
      selectedElements.forEach((elementId) => {
        deleteElement(elementId)
      })
      clearSelection()
    }
  }


  const handleDuplicate = () => {
    if (!currentMockup || selectedElements.length === 0) return;
    // Find selected elements
    const elementsToDuplicate = currentMockup.elements.filter(el => selectedElements.includes(el.id));
    elementsToDuplicate.forEach((el) => {
      const newId = `${el.id}-copy-${Date.now()}`;
      const duplicated = {
        ...el,
        id: newId,
        position: {
          ...el.position,
          x: el.position.x + 40,
          y: el.position.y + 40,
        },
        children: el.children ? el.children.map(child => ({ ...child, id: `${child.id}-copy-${Date.now()}` })) : undefined,
      };
      addElement(duplicated);
    });
    clearSelection();
  }


  const handleGroup = () => {
    if (!currentMockup || selectedElements.length < 2) return;
    // Find and remove selected elements
    const elementsToGroup = currentMockup.elements.filter(el => selectedElements.includes(el.id));
    const remainingElements = currentMockup.elements.filter(el => !selectedElements.includes(el.id));
    // Create a new container element
    const groupId = `group-${Date.now()}`;
    const groupElement: import("@/types/index").DesignElement = {
      id: groupId,
      type: 'container',
      position: { x: elementsToGroup[0].position.x, y: elementsToGroup[0].position.y },
      size: { width: 400, height: 300 },
      style: {},
      children: elementsToGroup,
    };
    // Remove grouped elements and add the group
    if (currentMockup) {
      currentMockup.elements = [...remainingElements, groupElement];
      updateElement(groupId, {}); // trigger update
    }
    clearSelection();
  }


  const handleUngroup = () => {
    if (!currentMockup || selectedElements.length === 0) return;
    // Find selected container elements
    const containers = currentMockup.elements.filter(el => selectedElements.includes(el.id) && el.type === 'container' && el.children && el.children.length > 0);
    let newElements = [...currentMockup.elements];
    containers.forEach(container => {
      // Remove the container
      newElements = newElements.filter(el => el.id !== container.id);
      // Add its children to the root
      newElements = [...newElements, ...container.children!];
    });
    if (currentMockup) {
      currentMockup.elements = newElements;
      updateElement(newElements[0].id, {}); // trigger update
    }
    clearSelection();
  }

  return (
    <div className="h-12 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 flex items-center justify-between px-4">
      {/* Left Tools */}
      <div className="flex items-center space-x-1">
        {tools.map((tool) => (
          <motion.button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
              activeTool === tool.id
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'hover:bg-secondary-100 dark:hover:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={`${tool.name} (${tool.shortcut})`}
          >
            <span className="text-lg">{tool.icon}</span>
          </motion.button>
        ))}
      </div>

      {/* Center Actions */}
      <div className="flex items-center space-x-2">
        {selectedElements.length > 0 && (
          <>
            <button
              onClick={handleDuplicate}
              className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
            >
              Duplicate
            </button>
            <button
              onClick={handleGroup}
              className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
            >
              Group
            </button>
            <button
              onClick={handleUngroup}
              className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors"
            >
              Ungroup
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              Delete
            </button>
          </>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors">
          Undo
        </button>
        <button className="px-3 py-1.5 text-sm bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-lg hover:bg-secondary-200 dark:hover:bg-secondary-600 transition-colors">
          Redo
        </button>
        <button className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
          Export
        </button>
      </div>
    </div>
  )
}
