import React, { useState } from 'react';
import { Check, Copy, ExternalLink, MessageCircle, Share2, X } from 'lucide-react';
import { buildWhatsAppUrl, copyTextToClipboard } from '../utils/shareUtils';

interface ShareSheetModalProps {
  title: string;
  text: string;
  url?: string;
  onClose: () => void;
  onShowToast: (message: string) => void;
}

export const ShareSheetModal: React.FC<ShareSheetModalProps> = ({
  title,
  text,
  url,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  const combinedText = url ? `${text}\n${url}` : text;

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(combinedText);
    if (ok) {
      setCopied(true);
      onShowToast('Copied to clipboard.');
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      onShowToast('Clipboard access is restricted in this browser.');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        onClose();
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }
    onShowToast('Native sharing is unavailable here—use Copy or WhatsApp below.');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-sheet-title"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700 sm:hidden" />

        <div className="flex items-center justify-between gap-3">
          <h2
            id="share-sheet-title"
            className="text-base font-semibold text-slate-900 dark:text-white"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share options"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 max-h-40 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
          {combinedText}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
          </button>

          <a
            href={buildWhatsAppUrl(combinedText)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-900 transition-colors hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/70"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Share on WhatsApp</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-70" />
          </a>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Share2 className="h-4 w-4" />
              <span>More System Share Options</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
