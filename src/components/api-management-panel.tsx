'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Trash2, Key, Shield, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/ui/loading';

interface ApiKey {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'replicate' | 'custom';
  keyPreview: string;
  createdAt: string;
  lastUsed?: string;
  isActive: boolean;
}

export default function ApiManagementPanel() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', provider: 'openai', key: '' });
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys');
      if (response.ok) {
        const keys = await response.json();
        setApiKeys(keys);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
  };

  const addApiKey = async () => {
    if (!newKey.name || !newKey.key) return;
    
    setLoading(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken || '',
          'X-Session-Token': localStorage.getItem('auth_token') || ''
        },
        body: JSON.stringify(newKey)
      });
      
      if (response.ok) {
        await loadApiKeys();
        setNewKey({ name: '', provider: 'openai', key: '' });
        setShowAddForm(false);
        toast.success('API key added successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add API key');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const response = await fetch(`/api/user/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken || '',
          'X-Session-Token': localStorage.getItem('auth_token') || ''
        }
      });
      
      if (response.ok) {
        await loadApiKeys();
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'replicate': return '🔄';
      default: return '🔧';
    }
  };

  return (
    <div className="h-full bg-obsidian border-l border-graphite-mist overflow-y-auto">
      <div className="p-4 border-b border-graphite-mist">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-5 h-5 text-cloud-white" />
          <h2 className="text-lg font-semibold text-cloud-white">API Management</h2>
        </div>
        <p className="text-sm text-fog-gray">Manage your AI provider API keys securely</p>
      </div>

      <div className="p-4">
        <div className="bg-clay-gray/20 border border-clay-gray/30 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="text-xs text-fog-gray">
              <p className="font-medium text-cloud-white mb-1">Security Notice</p>
              <p>API keys are encrypted and stored securely. They're only used for your AI requests and never shared.</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center gap-2 p-3 bg-clay-gray/20 hover:bg-clay-gray/30 border border-clay-gray/30 rounded-lg transition-colors mb-4"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add API Key</span>
        </button>

        {showAddForm && (
          <div className="bg-graphite-mist/20 border border-graphite-mist/30 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-cloud-white mb-3">Add New API Key</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-fog-gray mb-1">Name</label>
                <input
                  type="text"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                  placeholder="My OpenAI Key"
                  className="w-full px-3 py-2 bg-obsidian border border-graphite-mist rounded text-sm text-cloud-white placeholder-fog-gray focus:border-clay-gray focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs text-fog-gray mb-1">Provider</label>
                <select
                  value={newKey.provider}
                  onChange={(e) => setNewKey({ ...newKey, provider: e.target.value as any })}
                  className="w-full px-3 py-2 bg-obsidian border border-graphite-mist rounded text-sm text-cloud-white focus:border-clay-gray focus:outline-none"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="replicate">Replicate</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-fog-gray mb-1">API Key</label>
                <input
                  type="password"
                  value={newKey.key}
                  onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 bg-obsidian border border-graphite-mist rounded text-sm text-cloud-white placeholder-fog-gray focus:border-clay-gray focus:outline-none"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={addApiKey}
                disabled={loading || !newKey.name || !newKey.key}
                className="flex-1 px-3 py-2 bg-clay-gray hover:bg-clay-gray/80 disabled:bg-clay-gray/50 text-cloud-white text-sm rounded transition-colors flex items-center gap-2"
              >
                {loading && <LoadingSpinner size="sm" />}
                {loading ? 'Adding...' : 'Add Key'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 bg-graphite-mist/20 hover:bg-graphite-mist/30 text-fog-gray text-sm rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {apiKeys.map((key) => (
            <div key={key.id} className="bg-graphite-mist/10 border border-graphite-mist/20 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getProviderIcon(key.provider)}</span>
                  <div>
                    <h4 className="text-sm font-medium text-cloud-white">{key.name}</h4>
                    <p className="text-xs text-fog-gray capitalize">{key.provider}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleKeyVisibility(key.id)}
                    className="p-1 hover:bg-graphite-mist/20 rounded transition-colors"
                  >
                    {visibleKeys.has(key.id) ? (
                      <EyeOff className="w-4 h-4 text-fog-gray" />
                    ) : (
                      <Eye className="w-4 h-4 text-fog-gray" />
                    )}
                  </button>
                  <button
                    onClick={() => deleteApiKey(key.id)}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-fog-gray font-mono bg-obsidian/50 p-2 rounded">
                {visibleKeys.has(key.id) ? key.keyPreview : '••••••••••••••••'}
              </div>
              
              <div className="flex items-center justify-between mt-2 text-xs text-fog-gray">
                <span>Added {key.createdAt}</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${key.isActive ? 'bg-green-400' : 'bg-gray-400'}`} />
                  <span>{key.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
          ))}
          
          {apiKeys.length === 0 && (
            <div className="text-center py-8 text-fog-gray">
              <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No API keys configured</p>
              <p className="text-xs">Add your first API key to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}