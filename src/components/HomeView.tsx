import React, { useState } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import type {
  AuthorProfile,
  FontSizePreference,
  QuoteEntry,
} from '../types/content';
import { getAuthorById } from '../data/authors';
import { getLibraryTotals } from '../data/contentRegistry';
import { QuoteCard } from './QuoteCard';

interface HomeViewProps {
  entries: QuoteEntry[];
  favouriteIds: string[];
  fontSize: FontSizePreference;
  onOpenReader: (entries: QuoteEntry[], index: number, label: string) => void;
  onOpenAuthor: (authorId: string) => void;
  onCopy: (entry: QuoteEntry, author: AuthorProfile) => Promise<void>;
  onShare: (entry: QuoteEntry, author: AuthorProfile) => void;
  onToggleFavourite: (entryId: string) => void;
}

const PAGE_SIZE = 20;

export const HomeView: React.FC<HomeViewProps> = ({
  entries,
  favouriteIds,
  fontSize,
  onOpenReader,
  onOpenAuthor,
  onCopy,
  onShare,
  onToggleFavourite,
}) => {
  const totals = getLibraryTotals();
  const favSet = new Set(favouriteIds);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const visibleEntries = entries.slice(0, visibleCount);
  const hasMore = visibleCount < entries.length;

  const loadMore = () => {
    setVisibleCount((current) =>
      Math.min(current + PAGE_SIZE, entries.length)
    );
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Editorial Intro Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800/80 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
            International Reading Edition · Stage 1 Foundation
          </p>

          <h1 className="font-editorial mt-1.5 text-3xl font-semibold tracking-tight text-slate-900 text-balance dark:text-white sm:text-4xl">
            Words that stay with you.
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Tap any card to open the immersive full-screen reader with four
            independent themes, swipe navigation, and image sharing.
            Currently displaying clearly labelled Stage 1 development
            sample entries—no fabricated quotations or Hadith.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenReader(entries, 0, 'Home Feed')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 active:scale-[0.99] dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <BookOpen className="h-4 w-4" />
            <span className="whitespace-nowrap">Open Reader</span>
          </button>
        </div>
      </div>

      {/* Library Summary */}
      <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
        <span>{totals.literaryAuthorCount} Literary Authors</span>
        <span aria-hidden="true">·</span>
        <span>1 Sacred Hadith Archive</span>
        <span aria-hidden="true">·</span>
        <span>{totals.sampleCount} Stage 1 Sample Entries</span>
        <span aria-hidden="true">·</span>
        <span>Target Archive: {totals.targetTotal.toLocaleString()}</span>
      </div>

      {/* Incremental Quote Feed */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
        {visibleEntries.map((entry) => {
          const author = getAuthorById(entry.authorId);
          if (!author) return null;

          const originalIndex = entries.indexOf(entry);

          return (
            <QuoteCard
              key={entry.id}
              entry={entry}
              author={author}
              isFavourite={favSet.has(entry.id)}
              fontSize={fontSize}
              showAuthorHeader
              onOpenReader={() =>
                onOpenReader(entries, originalIndex, 'Home Feed')
              }
              onOpenAuthor={onOpenAuthor}
              onCopy={onCopy}
              onShare={onShare}
              onToggleFavourite={onToggleFavourite}
            />
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex flex-col items-center justify-center gap-3 py-10">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing {visibleEntries.length.toLocaleString()} of{' '}
            {entries.length.toLocaleString()} entries
          </p>

          <button
            type="button"
            onClick={loadMore}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ChevronDown className="h-4 w-4" />
            Load More Quotes
          </button>
        </div>
      )}

      {!hasMore && entries.length > PAGE_SIZE && (
        <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          You have reached the end of the collection.
        </div>
      )}
    </section>
  );
};
