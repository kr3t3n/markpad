import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';

interface CardProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, isExpanded, onToggle, children, className }: CardProps) {
  return (
    <div className={clsx("flex flex-col h-full", className)}>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        {title}
      </button>
      
      {isExpanded && (
        <div className="flex-1 mt-2 min-h-0">
          {children}
        </div>
      )}
    </div>
  );
}