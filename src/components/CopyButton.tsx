import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface CopyButtonProps {
  text: string;
  className?: string;
  getTextToCopy?: () => string;
}

export function CopyButton({ text, className, getTextToCopy }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = getTextToCopy ? getTextToCopy() : text;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={clsx(
        "absolute top-4 right-4 p-2 rounded-lg",
        "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
        "border border-gray-200 dark:border-gray-700",
        "shadow-sm hover:shadow-md",
        "transition-all duration-200",
        "group",
        "z-10",
        className
      )}
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check size={16} className="text-green-500" />
      ) : (
        <Copy size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400" />
      )}
    </button>
  );
}