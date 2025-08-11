'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  action?: { label: string; onClick: () => void };
}

let toastId = 0;
const toasts: Toast[] = [];
const listeners: ((toasts: Toast[]) => void)[] = [];

export const toast = {
  success: (message: string, action?: Toast['action']) => addToast('success', message, action),
  error: (message: string, action?: Toast['action']) => addToast('error', message, action),
  warning: (message: string, action?: Toast['action']) => addToast('warning', message, action),
  info: (message: string, action?: Toast['action']) => addToast('info', message, action),
};

function addToast(type: Toast['type'], message: string, action?: Toast['action']) {
  const id = (++toastId).toString();
  toasts.push({ id, type, message, action });
  listeners.forEach(listener => listener([...toasts]));
  
  setTimeout(() => removeToast(id), 5000);
}

function removeToast(id: string) {
  const index = toasts.findIndex(t => t.id === id);
  if (index > -1) {
    toasts.splice(index, 1);
    listeners.forEach(listener => listener([...toasts]));
  }
}

export function ToastContainer() {
  const [toastList, setToastList] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.push(setToastList);
    return () => {
      const index = listeners.indexOf(setToastList);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info': return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastList.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg border backdrop-blur-sm text-white min-w-80 ${
            toast.type === 'success' ? 'bg-green-900/90 border-green-700' :
            toast.type === 'error' ? 'bg-red-900/90 border-red-700' :
            toast.type === 'warning' ? 'bg-yellow-900/90 border-yellow-700' :
            'bg-blue-900/90 border-blue-700'
          }`}
        >
          {getIcon(toast.type)}
          <div className="flex-1">
            <p className="text-sm">{toast.message}</p>
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="text-xs underline mt-1 hover:no-underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-white/70 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}