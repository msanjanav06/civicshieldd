import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...', size = 'md', fullScreen = false }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size] || 'w-8 h-8';

  const content = (
    <div className="flex flex-col items-center justify-center p-6 text-slate-500">
      <Loader2 className={`${sizeClasses} animate-spin text-sky-600 mb-2`} />
      {text && <p className="text-sm font-medium text-slate-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-6 flex flex-col items-center">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
