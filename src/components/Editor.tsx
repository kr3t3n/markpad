import React, { useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import { clsx } from 'clsx';
import { parseMarkdown, shortcuts, transformText, TextTransform } from '../utils/markdown';
import { FormatCard } from './FormatCard';
import { Card } from './Card';

const STORAGE_KEY = 'markdown-content';
const LAYOUT_KEY = 'markdown-layout';
const FORMAT_EXPANDED_KEY = 'format-expanded';
const EDITOR_EXPANDED_KEY = 'editor-expanded';
const PREVIEW_EXPANDED_KEY = 'preview-expanded';

export function Editor() {
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState('');
  const [isVertical, setIsVertical] = useState(() => {
    const saved = Cookies.get(LAYOUT_KEY);
    return saved === 'vertical';
  });
  const [isFormatExpanded, setIsFormatExpanded] = useState(() => {
    const saved = Cookies.get(FORMAT_EXPANDED_KEY);
    return saved !== 'false';
  });
  const [isEditorExpanded, setIsEditorExpanded] = useState(() => {
    const saved = Cookies.get(EDITOR_EXPANDED_KEY);
    return saved !== 'false';
  });
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(() => {
    const saved = Cookies.get(PREVIEW_EXPANDED_KEY);
    return saved !== 'false';
  });

  useEffect(() => {
    const saved = Cookies.get(STORAGE_KEY);
    if (saved) {
      setContent(saved);
      setPreview(parseMarkdown(saved));
    }
  }, []);

  useEffect(() => {
    Cookies.set(STORAGE_KEY, content, { expires: 365 });
    setPreview(parseMarkdown(content));
  }, [content]);

  useEffect(() => {
    Cookies.set(LAYOUT_KEY, isVertical ? 'vertical' : 'horizontal', { expires: 365 });
  }, [isVertical]);

  useEffect(() => {
    Cookies.set(FORMAT_EXPANDED_KEY, String(isFormatExpanded), { expires: 365 });
  }, [isFormatExpanded]);

  useEffect(() => {
    Cookies.set(EDITOR_EXPANDED_KEY, String(isEditorExpanded), { expires: 365 });
  }, [isEditorExpanded]);

  useEffect(() => {
    Cookies.set(PREVIEW_EXPANDED_KEY, String(isPreviewExpanded), { expires: 365 });
  }, [isPreviewExpanded]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      Object.entries(shortcuts).forEach(([_, { key, before, after }]) => {
        if (e.key.toLowerCase() === key) {
          e.preventDefault();
          const textarea = e.target as HTMLTextAreaElement;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const selected = content.substring(start, end);
          const newContent = 
            content.substring(0, start) +
            before + selected + after +
            content.substring(end);
          setContent(newContent);
        }
      });
    }
  }, [content]);

  const insertFormat = (before: string, after: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const newContent = 
      content.substring(0, start) +
      before + selected + after +
      content.substring(end);
    setContent(newContent);
    textarea.focus();
  };

  const handleTransform = (type: TextTransform) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const transformed = transformText(selected, type);
    const newContent = 
      content.substring(0, start) +
      transformed +
      content.substring(end);
    setContent(newContent);
    textarea.focus();
  };

  return (
    <div className="container mx-auto p-2 sm:p-4 flex-1 flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
        <FormatCard
          isExpanded={isFormatExpanded}
          onToggle={() => setIsFormatExpanded(!isFormatExpanded)}
          onFormat={insertFormat}
          onTransform={handleTransform}
          content={content}
          isVertical={isVertical}
          onLayoutChange={setIsVertical}
        />
        
        <div className={clsx(
          "flex-1 flex gap-4 p-4 overflow-hidden min-h-0",
          isVertical ? "flex-col" : "flex-col lg:flex-row"
        )}>
          <Card
            title="Editor"
            isExpanded={isEditorExpanded}
            onToggle={() => setIsEditorExpanded(!isEditorExpanded)}
            className={clsx(
              "flex flex-col min-h-0",
              !isVertical && "transition-[flex-basis]",
              !isVertical && isEditorExpanded && isPreviewExpanded && "lg:basis-1/2",
              !isVertical && isEditorExpanded && !isPreviewExpanded && "lg:basis-full",
              !isVertical && !isEditorExpanded && "lg:basis-[40px]"
            )}
          >
            <textarea
              className="w-full flex-1 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 min-h-0"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Start writing markdown..."
            />
          </Card>
          
          <Card
            title="Preview"
            isExpanded={isPreviewExpanded}
            onToggle={() => setIsPreviewExpanded(!isPreviewExpanded)}
            className={clsx(
              "flex flex-col min-h-0",
              !isVertical && "transition-[flex-basis]",
              !isVertical && isPreviewExpanded && isEditorExpanded && "lg:basis-1/2",
              !isVertical && isPreviewExpanded && !isEditorExpanded && "lg:basis-full",
              !isVertical && !isPreviewExpanded && "lg:basis-[40px]"
            )}
          >
            <div 
              className="prose dark:prose-invert max-w-none flex-1 p-4 border rounded-lg overflow-y-auto dark:border-gray-700 min-h-0"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}