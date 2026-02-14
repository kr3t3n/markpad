import { LayoutPanelLeft, LayoutPanelTop } from 'lucide-react';
import { clsx } from 'clsx';

interface LayoutControlsProps {
  isVertical: boolean;
  onLayoutChange: (vertical: boolean) => void;
  className?: string;
}

export function LayoutControls({ isVertical, onLayoutChange, className }: LayoutControlsProps) {
  return (
    <button
      onClick={() => onLayoutChange(!isVertical)}
      className={clsx(
        "p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
        className
      )}
      title={isVertical ? "Switch to horizontal layout" : "Switch to vertical layout"}
    >
      {isVertical ? <LayoutPanelTop size={20} /> : <LayoutPanelLeft size={20} />}
    </button>
  );
}