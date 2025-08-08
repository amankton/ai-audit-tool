import React from 'react';
import { LayoutVariant, LAYOUT_OPTIONS } from './layouts';
import { Monitor, Columns2 } from 'lucide-react';

interface LayoutSelectorProps {
  currentLayout: LayoutVariant;
  onLayoutChange: (layout: LayoutVariant) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  currentLayout,
  onLayoutChange,
}) => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="text-white text-xs font-medium mb-2">Layout Options</div>
        <div className="flex space-x-2">
          <button
            onClick={() => onLayoutChange('centered')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs transition-colors ${
              currentLayout === 'centered'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-neutral-300 hover:bg-white/20'
            }`}
            title={LAYOUT_OPTIONS.centered.description}
          >
            <Monitor className="w-3 h-3" />
            <span>Centered</span>
          </button>
          <button
            onClick={() => onLayoutChange('split')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-xs transition-colors ${
              currentLayout === 'split'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 text-neutral-300 hover:bg-white/20'
            }`}
            title={LAYOUT_OPTIONS.split.description}
          >
            <Columns2 className="w-3 h-3" />
            <span>2-Panel</span>
          </button>
        </div>
      </div>
    </div>
  );
};
