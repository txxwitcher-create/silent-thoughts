import React from 'react';
import { BookOpen } from 'lucide-react';
import type {
  AuthorProfile,
  FontSizePreference,
  QuoteEntry,
} from '../types/content';
import { getAuthorEntryCounts } from '../data/contentRegistry';
import { AuthorAvatar } from './AuthorAvatar';
import { QuoteCard } from './QuoteCard';

interface AuthorProfileViewProps {
  author: AuthorProfile;
  entries: QuoteEntry[];
  favouriteIds: string[];
  fontSize: FontSizePreference;
  onOpenReader: (entries: QuoteEntry[], index: number, label: string) => void;
  onCopy: (entry: QuoteEntry, author: AuthorProfile) => Promise<void>;
  onShare: (entry: QuoteEntry, author: AuthorProfile) => void;
  onToggleFavourite: (entryId: string) => void;
}

export const AuthorProfileView: React.FC<AuthorProfileViewProps> = ({
  author,
  entries,
  favouriteIds,
  fontSize,
  onOpenReader,
  onCopy,
  onShare,
  onToggleFavourite,
}) => {
  const counts = getAuthorEntryCounts(author.id);
  const favSet = new Set(favouriteIds);
  const isHadithProfile = author.kind === 'religious_hadith';

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Dedicated Profile Header */}
      <div
        className={`rounded-3xl border p-6 sm:p-8 ${
          isHadithProfile
            ? 'border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/60 dark:bg-emerald-950/20'
            : 'border-slate-200/90 bg-white dark:border-slate-800/90 dark:bg-slate-900/75'
        }`}
      >
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <AuthorAvatar
            author={author}
            size="xl"
            ringClassName={
              isHadithProfile
                ? 'ring-2 ring-emerald-700/30 dark:ring-amber-300/30'
                : 'ring-2 ring-slate-200 dark:ring-slate-700'
            }
          />

          <div className="min-w-0 flex-1">
            <p
              className={`text-xs font-medium ${
                isHadithProfile
                  ? 'text-emerald-800 dark:text-emerald-400'
                  : 'text-blue-700 dark:text-blue-400'
              }`}
            >
              {author.tradition} · {author.era}
            </p>
            <h1 className="font-editorial mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {author.displayName}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              {author.profession}
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {author.biography}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 tabular-nums dark:text-slate-400">
              <span>
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {counts.verified}
                </strong>{' '}
                {isHadithProfile ? 'verified Hadith' : 'verified quotes'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="font-semibold text-slate-900 dark:text-white">
                  {counts.samples}
                </strong>{' '}
                Stage 1 sample slots
              </span>
              <span aria-hidden="true">·</span>
              <span>
                Target archive: {counts.target.toLocaleString()}{' '}
                {isHadithProfile ? 'authentic Hadith' : 'verified quotes'}
              </span>
            </div>
          </div>

          {entries.length > 0 && (
            <div className="w-full shrink-0 sm:w-auto">
              <button
                type="button"
                onClick={() => onOpenReader(entries, 0, author.displayName)}
                className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors active:scale-[0.99] sm:w-auto ${
                  isHadithProfile
                    ? 'bg-emerald-800 hover:bg-emerald-900 dark:bg-emerald-700 dark:hover:bg-emerald-600'
                    : 'bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span className="whitespace-nowrap">Read Full Screen</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collection Heading */}
      <div className="mt-8 mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {isHadithProfile ? 'Hadith Collection' : 'Quote Collection'}
        </h2>
        <span className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} available
        </span>
      </div>

      {/* Scrollable Collection */}
      <div className="space-y-4">
        {entries.map((entry, index) => (
          <QuoteCard
            key={entry.id}
            entry={entry}
            author={author}
            isFavourite={favSet.has(entry.id)}
            fontSize={fontSize}
            showAuthorHeader={false}
            onOpenReader={() =>
              onOpenReader(entries, index, author.displayName)
            }
            onCopy={onCopy}
            onShare={onShare}
            onToggleFavourite={onToggleFavourite}
          />
        ))}
      </div>
    </section>
  );
};
