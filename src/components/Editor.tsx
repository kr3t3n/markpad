import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { clsx } from 'clsx';
import { Save, Plus } from 'lucide-react';
import { parseMarkdown, shortcuts, transformText, TextTransform } from '../utils/markdown';
import { toast } from 'sonner';
import { FormatCard } from './FormatCard';
import { Card } from './Card';
import { CopyButton } from './CopyButton';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';
import { getDocument } from '../lib/database';

const STORAGE_KEY = 'markdown-content';
const LAYOUT_KEY = 'markdown-layout';
const FORMAT_EXPANDED_KEY = 'format-expanded';
const EDITOR_EXPANDED_KEY = 'editor-expanded';
const PREVIEW_EXPANDED_KEY = 'preview-expanded';

export function Editor() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const previewRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { create, update } = useDocuments();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const isNew = useMemo(() => !id, [id]);

  useEffect(() => {
    if (id) {
      loadDocument();
    } else if (!isNew) {
      const saved = Cookies.get(STORAGE_KEY);
      if (saved) {
        setContent(saved);
        setPreview(parseMarkdown(saved));
      }
    }
  }, [id, isNew]);

  const loadDocument = async () => {
    if (!id) return;
    
    const { data, error } = await getDocument(id);
    if (error) {
      setError(error.message);
      return;
    }
    
    if (data) {
      setTitle(data.title);
      setContent(data.content);
      parseMarkdown(data.content).then(setPreview);
    }
  };

  useEffect(() => {
    if (!id) {
      Cookies.set(STORAGE_KEY, content, { expires: 365 });
    }
    parseMarkdown(content).then(setPreview);
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

  const getFormattedText = () => {
    if (!previewRef.current) return '';
    return previewRef.current.innerText;
  };

  const handleSave = async () => {
    if (!user) return;
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const toastId = toast.loading('Creating document...');
      if (isNew) {
        const doc = await create(title, content);
        if (doc) {
          toast.dismiss(toastId);
          toast.success('Document created successfully');
          navigate(`/edit/${doc.id}`);
        }
      } else if (id) {
        const toastId = toast.loading('Saving changes...');
        await update(id, title, content);
        toast.dismiss(toastId);
        toast.success('Changes saved successfully');
      }
    } catch (err) {
      toast.error('Failed to save document');
      setError('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleNew = () => {
    setContent('');
    setTitle('');
    setError(null);
    navigate('/new');
  };

  return (
    <div className="container mx-auto px-0 sm:px-4 flex-1 flex flex-col">
      <div className="bg-white dark:bg-gray-800 rounded-none sm:rounded-lg shadow-lg flex-1 flex flex-col overflow-hidden">
        {user && (
          <div className="flex items-center gap-4 p-4 border-b dark:border-gray-700">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              className="flex-1 px-3 py-1.5 rounded-lg border dark:border-gray-700 dark:bg-gray-900"
            />
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Plus size={20} />
              New
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={clsx(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-blue-600 text-white hover:bg-blue-700 transition-colors",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              <Save size={20} />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
        
        {error && (
          <div className="p-4 text-red-500 text-sm">{error}</div>
        )}
        
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
            <div className="relative flex-1">
              <textarea
                className="absolute inset-0 w-full h-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono resize-none dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Start writing markdown..."
              />
              <CopyButton text={content} />
            </div>
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
            <div className="relative flex-1">
              <div 
                ref={previewRef}
                className="absolute inset-0 h-full prose dark:prose-invert max-w-none p-4 border rounded-lg overflow-y-auto dark:border-gray-700"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
              <CopyButton 
                text={content}
                getTextToCopy={getFormattedText}
                className="!bg-gray-50/90 dark:!bg-gray-900/90"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}