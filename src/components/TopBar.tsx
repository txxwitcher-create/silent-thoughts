
import React from 'react';
import { ArrowLeft, Heart, Menu, Share2 } from 'lucide-react';
import type { AppView } from '../types/content';
import { getAuthorById } from '../data/authors';

interface TopBarProps {
  view: AppView;
  favouritesCount: number;
  isDrawerOpen: boolean;
  onToggleDrawer: () => void;
  onNavigateHome: () => void;
  onOpenFavourites: () => void;
  onShareApp: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  view,
  favouritesCount,
  isDrawerOpen,
  onToggleDrawer,
  onNavigateHome,
  onOpenFavourites,
  onShareApp,
}) => {
  const isSubView = view.type !== 'home';

  let centerTitle = 'SILENT THOUGHTS';
  if (view.type === 'author') {
    centerTitle = getAuthorById(view.authorId)?.displayName ?? 'Author Profile';
  } else if (view.type === 'favourites') {
    centerTitle = 'My Favourites';
  } else if (view.type === 'settings') {
    centerTitle = 'Settings';
  }

  return (
    <header className="sticky top-0 z-50 h-16 pt-2 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors dark:border-slate-800/80 dark:bg-slate-950/90">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 px-3 sm:px-6">
        {/* Left: Menu + optional Back */}
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={onToggleDrawer}
            aria-label={
              isDrawerOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={isDrawerOpen}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-200 dark:hover:bg-slate-800/80"
          >
            <Menu className="h-5 w-5" />
          </button>

          {isSubView && (
            <button
              type="button"
              onClick={onNavigateHome}
              aria-label="Back to Home"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-200 dark:hover:bg-slate-800/80"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <div className="min-w-0 pl-1">
            {view.type === 'home' ? (
              <button
                type="button"
                onClick={onNavigateHome}
                className="font-editorial truncate text-left text-xl font-semibold tracking-[0.08em] text-slate-900 whitespace-nowrap dark:text-white"
              >
                SILENT THOUGHTS
              </button>
            ) : (
              <h1 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                {centerTitle}
              </h1>
            )}
          </div>
        </div>

        {/* Right: Share App + Favourites Shortcut */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onShareApp}
            aria-label="Share SILENT THOUGHTS app"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600 dark:text-slate-200 dark:hover:bg-slate-800/80"
          >
            <Share2 className="h-[19px] w-[19px]" />
          </button>

          <button
            type="button"
            onClick={onOpenFavourites}
            aria-label={`Open My Favourites (${favouritesCount} saved)`}
            className={`relative flex h-11 items-center justify-center gap-1.5 rounded-xl px-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
              view.type === 'favourites'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80'
            }`}
          >
            <Heart
              className={`h-[19px] w-[19px] ${
                view.type === 'favourites' || favouritesCount > 0
                  ? 'fill-current'
                  : ''
              }`}
            />
            {favouritesCount > 0 && (
              <span className="text-xs font-semibold tabular-nums">
                {favouritesCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
