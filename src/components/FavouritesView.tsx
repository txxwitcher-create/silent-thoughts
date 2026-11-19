import React from 'react';
import { BookOpen, Heart } from 'lucide-react';
import type {
  AuthorProfile,
  FontSizePreference,
  QuoteEntry,
} from '../types/content';
import { getAuthorById } from '../data/authors';
import { QuoteCard } from './QuoteCard';

interface FavouritesViewProps {
  entries: QuoteEntry[];
  fontSize: FontSizePreference;
  onBrowseHome: () => void;
  onOpenReader: (entries: QuoteEntry[], index: number, label: string) => void;
  onOpenAuthor: (authorId: string) => void;
  onCopy: (entry: QuoteEntry, author: AuthorProfile) => Promise<void>;
  onShare: (entry: QuoteEntry, author: AuthorProfile) => void;
  onToggleFavourite: (entryId: string) => void;
}

export const FavouritesView: React.FC<FavouritesViewProps> = ({
  entries,
  fontSize,
  onBrowseHome,
  onOpenReader,
  onOpenAuthor,
  onCopy,
  onShare,
  onToggleFavourite,
}) => {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-slate-200/80 pb-6 dark:border-slate-800/80 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-rose-700 dark:text-rose-400">
            Saved Locally on This Device
          </p>
          <h1 className="font-editorial mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            My Favourites
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 tabular-nums dark:text-slate-400">
            {entries.length === 0
              ? 'No saved quotes yet.'
              : `${entries.length} saved ${entries.length === 1 ? 'entry' : 'entries'} preserved offline.`}
          </p>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={() => onOpenReader(entries, 0, 'My Favourites')}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <BookOpen className="h-4 w-4" />
            <span className="whitespace-nowrap">Read Saved in Full Screen</span>
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="mx-auto my-12 max-w-md rounded-3xl border border-slate-200/90 bg-white p-8 text-center dark:border-slate-800/90 dark:bg-slate-900/70">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Heart className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
            Your personal anthology is empty
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Tap Save on any quotation or Hadith entry to keep it here for quiet
            re-reading—even while offline.
          </p>
          <button
            type="button"
            onClick={onBrowseHome}
            className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            Explore Home Feed
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5">
          {entries.map((entry, index) => {
            const author = getAuthorById(entry.authorId);
            if (!author) return null;
            return (
              <QuoteCard
                key={entry.id}
                entry={entry}
                author={author}
                isFavourite
                fontSize={fontSize}
                showAuthorHeader
                onOpenReader={() =>
                  onOpenReader(entries, index, 'My Favourites')
                }
                onOpenAuthor={onOpenAuthor}
                onCopy={onCopy}
                onShare={onShare}
                onToggleFavourite={onToggleFavourite}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
