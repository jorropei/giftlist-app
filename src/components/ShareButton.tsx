import React, { useState } from 'react';
import { Share2, Check } from 'lucide-react';
import type { DBList } from '../lib/firebase';
import { useTranslation } from '../hooks/useTranslation';

interface ShareButtonProps {
  list: DBList;
  password: string;
  className?: string;
}

export function ShareButton({ list, password, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleShare = async () => {
    // Get the current URL and replace any path/query with just the list ID
    const baseUrl = window.location.origin;
    const listUrl = `${baseUrl}?list=${encodeURIComponent(list.name)}`;

    const message = `${t('joinMe')} "${list.name}"!\n\n` +
      `${t('toJoin')}:\n` +
      `- ${t('listName')}: ${list.name}\n` +
      `- ${t('password')}: ${password}\n\n` +
      `${t('clickToJoin')}: ${listUrl}\n\n`;

    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 transition-all ${className}`}
      title="Copy list details to clipboard"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {t('copied')}
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          {t('shareList')}
        </>
      )}
    </button>
  );
}