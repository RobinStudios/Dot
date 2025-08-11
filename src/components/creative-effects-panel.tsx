'use client'

import { useState } from 'react'

interface CreativeEffect {
  id: string
  name: string
  icon: string
  cssClass: string
  description: string
}

interface CreativeEffectsPanelProps {
  onApplyEffect: (effect: CreativeEffect, intensity: number) => void
}

export function CreativeEffectsPanel({ onApplyEffect }: CreativeEffectsPanelProps) {
  const [selectedEffect, setSelectedEffect] = useState<string>('')
  const [intensity, setIntensity] = useState(50)

  const effects: CreativeEffect[] = [
    {
      id: 'glassmorphism',
      name: 'Glassmorphism',
      icon: '🪟',
      cssClass: 'backdrop-blur-md bg-white/10 border border-white/20',
      description: 'Frosted glass effect with blur and transparency'
    },
    {
      id: 'neumorphism',
      name: 'Neumorphism',
      icon: '🔘',
      cssClass: 'shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]',
      description: 'Soft, extruded surfaces with subtle shadows'
    },
    {
      id: 'neon-glow',
      name: 'Neon Glow',
      icon: '✨',
      cssClass: 'shadow-[0_0_20px_#00ff88,0_0_40px_#00ff88,0_0_60px_#00ff88]',
      description: 'Vibrant neon lighting effects'
    },
    {
      id: 'depth-layers',
      name: 'Depth Layers',
      icon: '📐',
      cssClass: 'transform-gpu perspective-1000 rotate-x-12 shadow-2xl',
      description: '3D depth with perspective and layering'
    },
    {
      id: 'liquid-gradient',
      name: 'Liquid Gradient',
      icon: '🌊',
      cssClass: 'bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 animate-gradient-x',
      description: 'Flowing, animated gradient backgrounds'
    },
    {
      id: 'holographic',
      name: 'Holographic',
      icon: '🌈',
      cssClass: 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent',
      description: 'Iridescent, color-shifting effects'
    },
    {
      id: 'particle-field',
      name: 'Particle Field',
      icon: '⭐',
      cssClass: 'relative overflow-hidden before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] before:bg-[length:20px_20px]',
      description: 'Animated particle backgrounds'
    },
    {
      id: 'frost-overlay',
      name: 'Frost Overlay',
      icon: '❄️',
      cssClass: 'backdrop-blur-sm bg-gradient-to-br from-white/20 to-white/5 border border-white/30',
      description: 'Subtle frost with gradient overlay'
    }
  ]

  const lightingEffects = [
    { name: 'Ambient', value: 'drop-shadow-lg' },
    { name: 'Dramatic', value: 'drop-shadow-2xl' },
    { name: 'Soft', value: 'drop-shadow-sm' },
    { name: 'Rim Light', value: 'shadow-[0_0_0_2px_rgba(255,255,255,0.3)]' }
  ]

  const handleApplyEffect = (effect: CreativeEffect) => {
    setSelectedEffect(effect.id)
    onApplyEffect(effect, intensity)
  }

  return (
    <div className="p-4 space-y-4" style={{ background: 'var(--graphite-mist)' }}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-semibold">🎨 Creative Effects</h3>
        <div className="ai-chip text-xs">Glass • Light • Depth</div>
      </div>

      {/* Effects Grid */}
      <div className="grid grid-cols-2 gap-2">
        {effects.map(effect => (
          <button
            key={effect.id}
            onClick={() => handleApplyEffect(effect)}
            className={`p-3 rounded-lg text-left transition-all hover:scale-105 ${
              selectedEffect === effect.id
                ? 'bg-blue-600 text-white'
                : 'bg-var(--clay-gray) hover:bg-var(--fog-gray)'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{effect.icon}</span>
              <span className="text-sm font-medium">{effect.name}</span>
            </div>
            <p className="text-xs opacity-75">{effect.description}</p>
          </button>
        ))}
      </div>

      {/* Intensity Slider */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Effect Intensity: {intensity}%
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="w-full h-2 bg-var(--clay-gray) rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Lighting Controls */}
      <div>
        <label className="block text-sm font-medium mb-2">Lighting</label>
        <div className="grid grid-cols-2 gap-2">
          {lightingEffects.map(light => (
            <button
              key={light.name}
              className="p-2 rounded-lg text-sm bg-var(--clay-gray) hover:bg-var(--fog-gray) transition-colors"
            >
              {light.name}
            </button>
          ))}
        </div>
      </div>

      {/* Live Preview */}
      {selectedEffect && (
        <div className="p-4 rounded-lg border" style={{ borderColor: 'var(--clay-gray)' }}>
          <p className="text-sm mb-2">Preview:</p>
          <div 
            className={`w-full h-20 rounded-lg ${effects.find(e => e.id === selectedEffect)?.cssClass}`}
            style={{ opacity: intensity / 100 }}
          >
            <div className="flex items-center justify-center h-full text-sm">
              Sample Element
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <button className="btn-primary text-sm flex-1">Apply to Selection</button>
        <button className="btn-secondary text-sm">Reset Effects</button>
      </div>
    </div>
  )
}