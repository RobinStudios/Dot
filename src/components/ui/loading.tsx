import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
}

interface LoadingStateProps {
  message?: string;
  progress?: number;
  className?: string;
}

export function LoadingState({ message = 'Loading...', progress, className = '' }: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <LoadingSpinner size="lg" className="text-clay-gray mb-4" />
      <p className="text-fog-gray text-sm mb-2">{message}</p>
      {progress !== undefined && (
        <div className="w-48 bg-graphite-mist/20 rounded-full h-2">
          <div 
            className="bg-clay-gray h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  label?: string;
  className?: string;
}

export function ProgressBar({ progress, label, className = '' }: ProgressBarProps) {
  return (
    <div className={`w-full ${className}`}>
      {label && <p className="text-sm text-fog-gray mb-2">{label}</p>}
      <div className="w-full bg-graphite-mist/20 rounded-full h-2">
        <div 
          className="bg-clay-gray h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      <p className="text-xs text-fog-gray mt-1">{Math.round(progress)}%</p>
    </div>
  );
}