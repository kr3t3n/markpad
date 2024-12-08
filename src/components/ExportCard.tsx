import React, { useState } from 'react';
import { ChevronDown, ChevronRight, FileCode, FileText, FileType, File } from 'lucide-react';
import { clsx } from 'clsx';
import { exportToMarkdown, exportToPlainText, exportToDocx, exportToOdt } from '../utils/export';

interface ExportCardProps {
  isExpanded: boolean;
  onToggle: () => void;
  content: string;
  className?: string;
}

export function ExportCard({ isExpanded, onToggle, content, className }: ExportCardProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const handleExport = (exportFn: (content: string) => void) => {
    exportFn(content);
    setShowDropdown(false);
  };

  return (
    <div className={clsx("border-b dark:border-gray-700 relative", className)}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 p-2 text-lg font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        Export
      </button>
      
      {isExpanded && (
        <div className="p-2 border-t dark:border-gray-700">
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-2 rounded-lg border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="flex items-center gap-2">
                <FileCode size={20} />
                Export As
              </span>
              <ChevronDown size={20} className={clsx(
                "transition-transform",
                showDropdown && "rotate-180"
              )} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleExport(exportToMarkdown)}
                >
                  <FileCode size={20} />
                  Markdown (.md)
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleExport(exportToPlainText)}
                >
                  <FileText size={20} />
                  Plain Text (.txt)
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleExport(exportToDocx)}
                >
                  <FileType size={20} />
                  Word Document (.docx)
                </button>
                <button 
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => handleExport(exportToOdt)}
                >
                  <File size={20} />
                  OpenDocument (.odt)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}