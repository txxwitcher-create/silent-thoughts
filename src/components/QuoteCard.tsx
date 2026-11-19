import React, { useState } from 'react';
import { Check, Copy, Heart, Maximize2, Share2 } from 'lucide-react';
import type {
  AuthorProfile,
  FontSizePreference,
  QuoteEntry,
} from '../types/content';
import { getCardQuoteSizeClass } from '../utils/storage';
import { getEntryDisplayText } from '../utils/shareUtils';
import { AuthorAvatar } from './AuthorAvatar';

interface QuoteCardProps {
  entry: QuoteEntry;
  author: AuthorProfile;
  isFavourite: boolean;
  fontSize: FontSizePreference;
  showAuthorHeader?: boolean;
  onOpenReader: () => void;
  onOpenAuthor?: (authorId: string) => void;
  onCopy: (entry: QuoteEntry, author: AuthorProfile) => Promise<void>;
  onShare: (entry: QuoteEntry, author: AuthorProfile) => void;
  onToggleFavourite: (entryId: string) => void;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  entry,
  author,
  isFavourite,
  fontSize,
  showAuthorHeader = true,
  onOpenReader,
  onOpenAuthor,
  onCopy,
  onShare,
  onToggleFavourite,
}) => {
  const [copied, setCopied] = useState(false);
  const displayText = getEntryDisplayText(entry);
  const quoteSizeClass = getCardQuoteSizeClass(fontSize);

  const handleCopy = async () => {
    await onCopy(entry, author);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const metadataLabel =
    entry.entryType === 'hadith'
      ? entry.verificationStatus === 'sample_placeholder'
        ? 'Stage 1 Sample · Hadith Archive Slot'
        : [entry.collection, entry.hadithNumber && `#${entry.hadithNumber}`, entry.authenticityGrade]
            .filter(Boolean)
            .join(' · ')
      : entry.verificationStatus === 'sample_placeholder'
        ? `Stage 1 Sample · ${entry.originalLanguage}`
        : [entry.source, entry.originalLanguage].filter(Boolean).join(' · ');

  return (
    <article
      data-testid={`quote-card-${entry.id}`}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800/90 dark:bg-slate-900/80 dark:hover:border-slate-700 sm:p-6"
    >
      <div>
        {/* Clean unboxed editorial metadata kicker */}
        <div className="mb-3 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="truncate">{metadataLabel}</span>
          <button
            type="button"
            onClick={onOpenReader}
            aria-label={`Open entry ${entry.id} in full-screen reader`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Clickable Quote / Hadith Body -> opens Full-Screen Quote Reader */}
        <button
          type="button"
          onClick={onOpenReader}
          aria-label={`Read quote by ${author.displayName} in full screen`}
          className="block w-full rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
        >
          {entry.entryType === 'hadith' && entry.arabicText && (
            <p
              dir="rtl"
              className="font-arabic mb-3 text-right text-xl leading-loose text-slate-800 dark:text-slate-100"
            >
              {entry.arabicText}
            </p>
          )}
          <blockquote
            className={`font-editorial font-medium italic text-slate-900 dark:text-slate-100 ${quoteSizeClass}`}
          >
            {displayText}
          </blockquote>

          {/* Structured Hadith scholarly metadata block when present */}
          {entry.entryType === 'hadith' && (
            <div className="mt-3.5 border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800/90 dark:text-slate-400">
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                <span>
                  Narrator:{' '}
                  <strong className="font-medium text-slate-700 dark:text-slate-300">
                    {entry.narrator ?? 'Pending verification'}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Collection:{' '}
                  <strong className="font-medium text-slate-700 dark:text-slate-300">
                    {entry.collection ?? 'Pending verification'}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Grade:{' '}
                  <strong className="font-medium text-slate-700 dark:text-slate-300">
                    {entry.authenticityGrade ?? 'Pending verification'}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* Footer: Author Attribution + Actions */}
      <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800/80">
        {showAuthorHeader && (
          <div className="mb-3.5">
            {onOpenAuthor ? (
              <button
                type="button"
                aria-label={`Open ${author.displayName} profile`}
                onClick={() => onOpenAuthor(author.id)}
                className="flex min-h-[44px] w-full items-center gap-3 rounded-xl py-1 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-blue-600 dark:hover:bg-slate-800/60"
              >
                <AuthorAvatar author={author} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {author.displayName}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {author.profession}
                  </p>
                </div>
              </button>
            ) : (
              <div className="flex items-center gap-3 py-1">
                <AuthorAvatar author={author} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {author.displayName}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {author.profession}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              aria-label={`Copy entry ${entry.id}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300">
                    Copied
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => onShare(entry, author)}
              aria-label={`Share entry ${entry.id}`}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavourite(entry.id)}
            aria-label={
              isFavourite
                ? `Remove entry ${entry.id} from favourites`
                : `Save entry ${entry.id} to favourites`
            }
            aria-pressed={isFavourite}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl px-3.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
              isFavourite
                ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 dark:hover:bg-rose-950/80'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavourite ? 'fill-current' : ''}`} />
            <span>{isFavourite ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
