import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({ 
  title = 'Something went wrong',
  message, 
  onRetry, 
  retryLabel = 'Try Again',
  className = '' 
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
      <h3 className="text-lg font-semibold text-cloud-white mb-2">{title}</h3>
      <p className="text-fog-gray mb-4 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-clay-gray hover:bg-clay-gray/80 text-cloud-white rounded transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ title, message, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="w-16 h-16 bg-graphite-mist/20 rounded-full flex items-center justify-center mb-4">
        <div className="w-8 h-8 bg-clay-gray/30 rounded-full" />
      </div>
      <h3 className="text-lg font-semibold text-cloud-white mb-2">{title}</h3>
      <p className="text-fog-gray mb-4 max-w-md">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-clay-gray hover:bg-clay-gray/80 text-cloud-white rounded transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}