import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { DesignMockup, DesignElement, Layout, Typography, ColorScheme } from '@/types'

interface DesignState {
  // Current state
  currentMockup: DesignMockup | null
  mockups: DesignMockup[]
  selectedElements: string[]
  isGenerating: boolean
  isCollaborating: boolean
  
  // Actions
  setCurrentMockup: (mockup: DesignMockup | null) => void
  addMockup: (mockup: DesignMockup) => void
  updateMockup: (id: string, updates: Partial<DesignMockup>) => void
  deleteMockup: (id: string) => void
  selectElement: (elementId: string) => void
  deselectElement: (elementId: string) => void
  clearSelection: () => void
  addElement: (element: DesignElement) => void
  updateElement: (elementId: string, updates: Partial<DesignElement>) => void
  deleteElement: (elementId: string) => void
  setGenerating: (isGenerating: boolean) => void
  setCollaborating: (isCollaborating: boolean) => void
  
  // AI Generation
  generateMockups: (prompt: string) => Promise<void>
  
  // Collaboration
  startCollaboration: () => void
  stopCollaboration: () => void
}

const defaultLayout: Layout = {
  type: 'grid',
  columns: 12,
  rows: 8,
  gap: 16,
  padding: 24,
  breakpoints: [
    { name: 'mobile', width: 768, columns: 4, gap: 12 },
    { name: 'tablet', width: 1024, columns: 8, gap: 16 },
    { name: 'desktop', width: 1440, columns: 12, gap: 16 },
    { name: 'large', width: 1920, columns: 12, gap: 24 },
  ],
  gridTemplate: 'repeat(8, 1fr) / repeat(12, 1fr)',
}

const defaultTypography: Typography = {
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: 0,
  textAlign: 'left',
  color: '#1f2937',
}

const defaultColorScheme: ColorScheme = {
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#d946ef',
  background: '#ffffff',
  text: '#1f2937',
  surface: '#f8fafc',
  error: '#ef4444',
  warning: '#f59e0b',
  success: '#10b981',
  palette: ['#3b82f6', '#64748b', '#d946ef', '#f8fafc', '#1f2937'],
}

const createDefaultMockup = (prompt: string): DesignMockup => ({
  id: `mockup-${Date.now()}`,
  title: `Design ${Date.now()}`,
  description: prompt,
  prompt,
  layout: defaultLayout,
  typography: defaultTypography,
  colorScheme: defaultColorScheme,
  elements: [],
  thumbnail: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  isPublic: false,
  tags: [],
  collaborators: [],
})

export const useDesignStore = create<DesignState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentMockup: null,
      mockups: [],
      selectedElements: [],
      isGenerating: false,
      isCollaborating: false,

      // Actions
      setCurrentMockup: (mockup) => set({ currentMockup: mockup }),
      
      addMockup: (mockup) => set((state) => ({
        mockups: [...state.mockups, mockup],
        currentMockup: mockup,
      })),
      
      updateMockup: (id, updates) => set((state) => ({
        mockups: state.mockups.map((mockup) =>
          mockup.id === id ? { ...mockup, ...updates, updatedAt: new Date() } : mockup
        ),
        currentMockup: state.currentMockup?.id === id 
          ? { ...state.currentMockup, ...updates, updatedAt: new Date() }
          : state.currentMockup,
      })),
      
      deleteMockup: (id) => set((state) => ({
        mockups: state.mockups.filter((mockup) => mockup.id !== id),
        currentMockup: state.currentMockup?.id === id ? null : state.currentMockup,
      })),
      
      selectElement: (elementId) => set((state) => ({
        selectedElements: [...state.selectedElements, elementId],
      })),
      
      deselectElement: (elementId) => set((state) => ({
        selectedElements: state.selectedElements.filter((id) => id !== elementId),
      })),
      
      clearSelection: () => set({ selectedElements: [] }),
      
      addElement: (element) => set((state) => {
        if (!state.currentMockup) return state
        
        const updatedMockup = {
          ...state.currentMockup,
          elements: [...state.currentMockup.elements, element],
          updatedAt: new Date(),
        }
        
        return {
          currentMockup: updatedMockup,
          mockups: state.mockups.map((mockup) =>
            mockup.id === updatedMockup.id ? updatedMockup : mockup
          ),
        }
      }),
      
      updateElement: (elementId, updates) => set((state) => {
        if (!state.currentMockup) return state
        
        const updatedElements = state.currentMockup.elements.map((element) =>
          element.id === elementId ? { ...element, ...updates } : element
        )
        
        const updatedMockup = {
          ...state.currentMockup,
          elements: updatedElements,
          updatedAt: new Date(),
        }
        
        return {
          currentMockup: updatedMockup,
          mockups: state.mockups.map((mockup) =>
            mockup.id === updatedMockup.id ? updatedMockup : mockup
          ),
        }
      }),
      
      deleteElement: (elementId) => set((state) => {
        if (!state.currentMockup) return state
        
        const updatedElements = state.currentMockup.elements.filter(
          (element) => element.id !== elementId
        )
        
        const updatedMockup = {
          ...state.currentMockup,
          elements: updatedElements,
          updatedAt: new Date(),
        }
        
        return {
          currentMockup: updatedMockup,
          mockups: state.mockups.map((mockup) =>
            mockup.id === updatedMockup.id ? updatedMockup : mockup
          ),
          selectedElements: state.selectedElements.filter((id) => id !== elementId),
        }
      }),
      
      setGenerating: (isGenerating) => set({ isGenerating }),
      setCollaborating: (isCollaborating) => set({ isCollaborating }),

      // AI Generation
      generateMockups: async (prompt: string) => {
        set({ isGenerating: true });
        
        try {
          const { agentExecutor } = await import('@/lib/ai/agent-executor');
          const result = await agentExecutor.executeTask({
            id: `task-${Date.now()}`,
            type: 'design',
            prompt,
          });

          if (result.success) {
            const newMockup = createDefaultMockup(prompt);
            newMockup.title = `AI Design - ${prompt.slice(0, 20)}...`;
            newMockup.elements = result.data.elements;
            newMockup.layout = result.data.layout;
            newMockup.colorScheme = result.data.colorScheme;
            newMockup.typography = result.data.typography;
            
            set((state) => ({
              mockups: [...state.mockups, newMockup],
              currentMockup: newMockup,
            }));
          } else {
            console.error('AI generation failed:', result.error);
            // Here you might want to set an error state
          }
        } catch (error) {
          console.error('Error generating mockups:', error);
          // Here you might want to set an error state
        } finally {
          set({ isGenerating: false });
        }
      },

      // Collaboration
      startCollaboration: () => set({ isCollaborating: true }),
      stopCollaboration: () => set({ isCollaborating: false }),
    }),
    {
      name: 'design-store',
    }
  )
)
