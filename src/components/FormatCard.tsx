import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Toolbar } from './Toolbar';
import { TextTransform } from '../utils/markdown';

interface FormatCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  onFormat: (before: string, after: string) => void;
  onTransform: (type: TextTransform) => void;
  content: string;
  isVertical: boolean;
  onLayoutChange: (vertical: boolean) => void;
  className?: string;
}

export function FormatCard({ 
  isExpanded, 
  onToggle, 
  onFormat, 
  onTransform, 
  content,
  isVertical,
  onLayoutChange,
  className 
}: FormatCardProps) {
  return (
    <div className={clsx("border-b dark:border-gray-700", className)}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2 text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        Format
      </button>
      
      {isExpanded && (
        <div className="p-2 border-t dark:border-gray-700">
          <Toolbar 
            onFormat={onFormat}
            onTransform={onTransform}
            buttonClass="p-2 rounded"
            content={content}
            isVertical={isVertical}
            onLayoutChange={onLayoutChange}
          />
        </div>
      )}
    </div>
  );
}