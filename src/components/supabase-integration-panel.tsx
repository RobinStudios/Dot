'use client';

import { useState } from 'react';
import { Database, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { LoadingSpinner } from '@/components/ui/loading';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

export default function SupabaseIntegrationPanel() {
  const [config, setConfig] = useState<SupabaseConfig>({ url: '', anonKey: '' });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    if (!config.url || !config.anonKey) {
      toast.error('Please enter Supabase URL and API key');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const result = await response.json();
      
      if (result.success) {
        setIsConnected(true);
        toast.success('Connected to Supabase successfully!');
        localStorage.setItem('supabase_config', JSON.stringify(config));
      } else {
        toast.error(result.error || 'Connection failed');
      }
    } catch (error) {
      toast.error('Failed to test connection');
    } finally {
      setIsLoading(false);
    }
  };

  const deployDesign = async (design: any) => {
    if (!isConnected) {
      toast.error('Please connect to Supabase first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/integrations/supabase/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, design })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Design deployed to Supabase!', {
          label: 'View',
          onClick: () => window.open(result.url, '_blank')
        });
      } else {
        toast.error(result.error || 'Deployment failed');
      }
    } catch (error) {
      toast.error('Failed to deploy design');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full bg-obsidian border-l border-graphite-mist overflow-y-auto">
      <div className="p-4 border-b border-graphite-mist">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-5 h-5 text-cloud-white" />
          <h2 className="text-lg font-semibold text-cloud-white">Supabase Integration</h2>
        </div>
        <p className="text-sm text-fog-gray">Deploy your designs to your own Supabase project</p>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-clay-gray/20 border border-clay-gray/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Database className="w-4 h-4 text-blue-400 mt-0.5" />
            <div className="text-xs text-fog-gray">
              <p className="font-medium text-cloud-white mb-1">Connect Your Supabase</p>
              <p>Enter your Supabase project credentials to deploy designs directly to your database.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-fog-gray mb-1">Project URL</label>
            <input
              type="url"
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3 py-2 bg-obsidian border border-graphite-mist rounded text-sm text-cloud-white placeholder-fog-gray focus:border-clay-gray focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-xs text-fog-gray mb-1">Anon Key</label>
            <input
              type="password"
              value={config.anonKey}
              onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 bg-obsidian border border-graphite-mist rounded text-sm text-cloud-white placeholder-fog-gray focus:border-clay-gray focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-fog-gray mb-1">Service Role Key (Optional)</label>
            <input
              type="password"
              value={config.serviceRoleKey || ''}
              onChange={(e) => setConfig({ ...config, serviceRoleKey: e.target.value })}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 bg-obsidian border border-graphite-mist rounded text-sm text-cloud-white placeholder-fog-gray focus:border-clay-gray focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={testConnection}
          disabled={isLoading || !config.url || !config.anonKey}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-clay-gray hover:bg-clay-gray/80 disabled:bg-clay-gray/50 text-cloud-white text-sm rounded transition-colors"
        >
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : isConnected ? (
            <Check className="w-4 h-4" />
          ) : (
            <Database className="w-4 h-4" />
          )}
          {isLoading ? 'Testing...' : isConnected ? 'Connected' : 'Test Connection'}
        </button>

        {isConnected && (
          <div className="bg-green-900/20 border border-green-700/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <p className="text-sm text-green-400">Connected to Supabase</p>
            </div>
            <p className="text-xs text-green-300 mt-1">You can now deploy designs to your database</p>
          </div>
        )}

        <div className="pt-4 border-t border-graphite-mist/30">
          <h3 className="text-sm font-medium text-cloud-white mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => deployDesign({ name: 'Current Design', code: 'export default function() { return <div>Hello</div>; }' })}
              disabled={!isConnected || isLoading}
              className="w-full text-left px-3 py-2 bg-graphite-mist/20 hover:bg-graphite-mist/30 disabled:bg-graphite-mist/10 text-cloud-white text-sm rounded transition-colors"
            >
              Deploy Current Design
            </button>
            <button
              disabled={!isConnected}
              className="w-full text-left px-3 py-2 bg-graphite-mist/20 hover:bg-graphite-mist/30 disabled:bg-graphite-mist/10 text-cloud-white text-sm rounded transition-colors"
            >
              View Deployed Designs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}