
import React, { useEffect } from 'react';
import { Heart, Home, Settings, X } from 'lucide-react';
import type { AppView } from '../types/content';
import {
  getAlphabeticalLiteraryAuthors,
  getSpecialReligiousProfiles,
} from '../data/authors';
import {
  getAuthorEntryCounts,
  getLibraryTotals,
} from '../data/contentRegistry';
import { AuthorAvatar } from './AuthorAvatar';
import { BrandLogoPlaceholder } from './BrandLogoPlaceholder';
import { PWAInstallButton } from './PWAInstallButton';

interface NavigationDrawerProps {
  isOpen: boolean;
  currentView: AppView;
  favouritesCount: number;
  onClose: () => void;
  onSelectHome: () => void;
  onSelectFavourites: () => void;
  onSelectSettings: () => void;
  onSelectAuthor: (authorId: string) => void;
}

const LITERARY_AUTHORS = getAlphabeticalLiteraryAuthors();
const RELIGIOUS_PROFILES = getSpecialReligiousProfiles();

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  currentView,
  favouritesCount,
  onClose,
  onSelectHome,
  onSelectFavourites,
  onSelectSettings,
  onSelectAuthor,
}) => {
  const totals = getLibraryTotals();

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleMobileAutoClose = (callback: () => void) => {
    callback();
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Drawer / Collapsible Desktop Sidebar */}
      <aside
        aria-label="Main navigation drawer"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 left-0 z-[60] flex w-[312px] max-w-[86vw] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-200 ease-out dark:border-slate-800 dark:bg-slate-950 lg:sticky lg:top-0 lg:z-20 lg:h-dvh lg:shadow-none ${
          isOpen
            ? 'translate-x-0 lg:w-80'
            : '-translate-x-full lg:hidden lg:w-0'
        }`}
      >
        {/* BRAND HEADER */}
        <div className="shrink-0 border-b border-slate-200/90 bg-slate-900 px-5 pt-5 pb-4 text-white dark:border-slate-800 dark:bg-slate-900/90">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <BrandLogoPlaceholder size="md" tone="light" />
              <div className="min-w-0">
                <p className="font-editorial text-lg font-semibold tracking-[0.09em] text-white whitespace-nowrap">
                  SILENT THOUGHTS
                </p>
                <p className="mt-0.5 text-xs text-slate-300">
                  Words that stay with you.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation drawer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-400 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-300 tabular-nums">
            <span>{totals.profileCount} Profiles</span>
            <span aria-hidden="true" className="text-slate-500">
              ·
            </span>
            <span>{totals.totalEntries} Sample Entries</span>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <nav className="subtle-scroll flex-1 overflow-y-auto px-3 py-4">
          {/* QUICK ACCESS */}
          <div className="px-2 pb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            Quick Access
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => handleMobileAutoClose(onSelectHome)}
              className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                currentView.type === 'home'
                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <Home className="h-[18px] w-[18px] shrink-0" />
                <span>Home Feed</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileAutoClose(onSelectFavourites)}
              className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                currentView.type === 'favourites'
                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <Heart className="h-[18px] w-[18px]" />
                <span>My Favourites</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 tabular-nums dark:bg-slate-800 dark:text-slate-300">
                {favouritesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileAutoClose(onSelectSettings)}
              className={`flex min-h-[44px] w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                currentView.type === 'settings'
                  ? 'bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200'
                  : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-3">
                <Settings className="h-[18px] w-[18px]" />
                <span>Settings</span>
              </span>
            </button>

            <div className="pt-1">
              <PWAInstallButton variant="drawer" />
            </div>
          </div>

          {/* SPECIAL RELIGIOUS PROFILE */}
          <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
            <div className="px-2 pb-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
              Sacred Hadith Archive
            </div>
            <div className="space-y-1">
              {RELIGIOUS_PROFILES.map((profile) => {
                const counts = getAuthorEntryCounts(profile.id);
                const isActive =
                  currentView.type === 'author' &&
                  currentView.authorId === profile.id;
                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() =>
                      handleMobileAutoClose(() => onSelectAuthor(profile.id))
                    }
                    className={`flex min-h-[58px] w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-100'
                        : 'text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <AuthorAvatar author={profile} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        Prophet Muhammad{' '}
                        <span className="font-arabic ml-0.5 text-base font-normal">
                          ﷺ
                        </span>
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {profile.profession}
                      </p>
                    </div>
                    <span
                      title={`${counts.total} sample Hadith entries`}
                      className="shrink-0 rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-semibold text-emerald-900 tabular-nums dark:bg-emerald-900/60 dark:text-emerald-200"
                    >
                      {counts.total}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AUTHORS A–Z */}
          <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800/80">
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Authors A–Z
              </span>
              <span className="text-xs text-slate-400 tabular-nums dark:text-slate-500">
                {LITERARY_AUTHORS.length}
              </span>
            </div>

            <ul className="space-y-1">
              {LITERARY_AUTHORS.map((author) => {
                const counts = getAuthorEntryCounts(author.id);
                const isActive =
                  currentView.type === 'author' &&
                  currentView.authorId === author.id;
                return (
                  <li key={author.id}>
                    <button
                      type="button"
                      onClick={() =>
                        handleMobileAutoClose(() => onSelectAuthor(author.id))
                      }
                      className={`flex min-h-[58px] w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/60 dark:text-blue-100'
                          : 'text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <AuthorAvatar author={author} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {author.displayName}
                        </p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                          {author.profession}
                        </p>
                      </div>
                      <span
                        title={`${counts.total} sample entries`}
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums ${
                          isActive
                            ? 'bg-blue-600 text-white dark:bg-blue-500'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {counts.total}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
};
