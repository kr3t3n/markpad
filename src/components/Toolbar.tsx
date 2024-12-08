import React, { useState } from 'react';
import {
  Bold, Italic, Underline, Code, Link, Heading1, Heading2, Heading3,
  Strikethrough, List, ListOrdered, ArrowUpRight, ArrowDownRight,
  Type, ChevronDown, ArrowUpWideNarrow, ArrowDownWideNarrow, CaseSensitive, 
  FileCode, FileText, FileType, File, LayoutPanelLeft, LayoutPanelTop
} from 'lucide-react';
import { clsx } from 'clsx';
import { TextTransform } from '../utils/markdown';
import { exportToMarkdown, exportToPlainText, exportToDocx, exportToOdt } from '../utils/export';

interface ToolbarProps {
  onFormat: (before: string, after: string) => void;
  onTransform: (type: TextTransform) => void;
  buttonClass: string;
  content: string;
  isVertical: boolean;
  onLayoutChange: (vertical: boolean) => void;
}

export function Toolbar({ 
  onFormat, 
  onTransform, 
  buttonClass,
  content,
  isVertical,
  onLayoutChange
}: ToolbarProps) {
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  
  const toolbarGroupClass = "flex gap-2 items-center";
  const dividerClass = "hidden sm:block border-r h-6 mx-2 dark:border-gray-700";
  const buttonStyles = clsx(
    buttonClass,
    "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
  );

  const handleExport = (exportFn: (content: string) => void) => {
    exportFn(content);
    setShowExportDropdown(false);
  };

  return (
    <div className="flex flex-wrap gap-y-2 gap-x-4">
      <div className={toolbarGroupClass}>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('**', '**')}
          title="Bold (Ctrl+B)">
          <Bold size={20} />
        </button>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('_', '_')}
          title="Italic (Ctrl+I)">
          <Italic size={20} />
        </button>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('<u>', '</u>')}
          title="Underline (Ctrl+U)">
          <Underline size={20} />
        </button>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('~~', '~~')}
          title="Strikethrough (Ctrl+S)">
          <Strikethrough size={20} />
        </button>
      </div>

      <div className={dividerClass} />

      <div className={toolbarGroupClass}>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('# ', '')}
          title="Heading 1 (Ctrl+1)">
          <Heading1 size={20} />
        </button>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('## ', '')}
          title="Heading 2 (Ctrl+2)">
          <Heading2 size={20} />
        </button>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('### ', '')}
          title="Heading 3 (Ctrl+3)">
          <Heading3 size={20} />
        </button>
      </div>

      <div className={dividerClass} />

      <div className={toolbarGroupClass}>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('```\n', '\n```')}
          title="Code Block (Ctrl+`)">
          <Code size={20} />
        </button>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('[', '](url)')}
          title="Link (Ctrl+K)">
          <Link size={20} />
        </button>
      </div>

      <div className={dividerClass} />

      <div className={toolbarGroupClass}>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('- ', '')}
          title="Bullet List (Ctrl+8)">
          <List size={20} />
        </button>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('1. ', '')}
          title="Numbered List (Ctrl+9)">
          <ListOrdered size={20} />
        </button>
      </div>

      <div className={dividerClass} />

      <div className={toolbarGroupClass}>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('<sup>', '</sup>')}
          title="Superscript (Ctrl+6)">
          <ArrowUpRight size={20} />
        </button>
        <button 
          className={buttonStyles}
          onClick={() => onFormat('<sub>', '</sub>')}
          title="Subscript (Ctrl+5)">
          <ArrowDownRight size={20} />
        </button>
      </div>

      <div className={dividerClass} />

      <div className={clsx(toolbarGroupClass, "relative")}>
        <button
          className={clsx(buttonStyles, "flex items-center gap-1")}
          onClick={() => setShowCaseDropdown(!showCaseDropdown)}
          title="Text Case"
        >
          <Type size={20} />
          <ChevronDown size={16} className={clsx(
            "transition-transform",
            showCaseDropdown && "rotate-180"
          )} />
        </button>

        {showCaseDropdown && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
            <button 
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                onTransform('sentence');
                setShowCaseDropdown(false);
              }}
            >
              <Type size={20} />
              Sentence case
            </button>
            <button 
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                onTransform('upper');
                setShowCaseDropdown(false);
              }}
            >
              <ArrowUpWideNarrow size={20} />
              UPPERCASE
            </button>
            <button 
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                onTransform('lower');
                setShowCaseDropdown(false);
              }}
            >
              <ArrowDownWideNarrow size={20} />
              lowercase
            </button>
            <button 
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                onTransform('camel');
                setShowCaseDropdown(false);
              }}
            >
              <CaseSensitive size={20} />
              camelCase (keep spaces)
            </button>
            <button 
              className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => {
                onTransform('camelTrim');
                setShowCaseDropdown(false);
              }}
            >
              <CaseSensitive size={20} />
              camelCase (trim spaces)
            </button>
          </div>
        )}
      </div>

      <div className={dividerClass} />

      <div className={clsx(toolbarGroupClass, "relative")}>
        <button
          onClick={() => setShowExportDropdown(!showExportDropdown)}
          className={clsx(buttonStyles, "flex items-center gap-1")}
          title="Export As"
        >
          <FileCode size={20} />
          <ChevronDown size={16} className={clsx(
            "transition-transform",
            showExportDropdown && "rotate-180"
          )} />
        </button>
        
        {showExportDropdown && (
          <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-10">
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

      <button
        onClick={() => onLayoutChange(!isVertical)}
        className={buttonStyles}
        title={isVertical ? "Switch to horizontal layout" : "Switch to vertical layout"}
      >
        {isVertical ? <LayoutPanelTop size={20} /> : <LayoutPanelLeft size={20} />}
      </button>
    </div>
  );
}