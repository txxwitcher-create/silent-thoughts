import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AppearanceMode,
  AppView,
  AuthorProfile,
  FontSizePreference,
  NotificationPreferences,
  QuoteEntry,
  ReaderSession,
  ReaderThemeId,
} from './types/content';
import { getAuthorById } from './data/authors';
import {
  ALL_ENTRIES,
  getEntriesByAuthor,
  getEntryById,
} from './data/contentRegistry';
import {
  loadAppearance,
  loadFavourites,
  loadFontSize,
  loadNotificationPrefs,
  loadReaderTheme,
  resolveEffectiveDarkMode,
  saveAppearance,
  saveFavourites,
  saveFontSize,
  saveNotificationPrefs,
  saveReaderTheme,
  toggleFavouriteId,
} from './utils/storage';
import {
  copyTextToClipboard,
  formatEntryForShare,
} from './utils/shareUtils';
import { TopBar } from './components/TopBar';
import { NavigationDrawer } from './components/NavigationDrawer';
import { HomeView } from './components/HomeView';
import { AuthorProfileView } from './components/AuthorProfileView';
import { FavouritesView } from './components/FavouritesView';
import { SettingsView } from './components/SettingsView';
import { QuoteReaderModal } from './components/QuoteReaderModal';
import { ShareSheetModal } from './components/ShareSheetModal';
import { OfflineIndicator } from './components/OfflineIndicator';

interface ShareSheetState {
  title: string;
  text: string;
  url?: string;
}

export default function App() {
  const [view, setView] = useState<AppView>({ type: 'home' });
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 1024;
  });

  // Persisted independent preferences
  const [appearance, setAppearance] = useState<AppearanceMode>(() =>
    loadAppearance()
  );
  const [readerTheme, setReaderTheme] = useState<ReaderThemeId>(() =>
    loadReaderTheme()
  );
  const [fontSize, setFontSize] = useState<FontSizePreference>(() =>
    loadFontSize()
  );
  const [favouriteIds, setFavouriteIds] = useState<string[]>(() =>
    loadFavourites()
  );
  const [notifications, setNotifications] = useState<NotificationPreferences>(
    () => loadNotificationPrefs()
  );

  // Full-screen quote reader state (separate from author collection & home views)
  const [readerSession, setReaderSession] = useState<ReaderSession | null>(
    null
  );
  const [shareSheet, setShareSheet] = useState<ShareSheetState | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Apply application-wide Light / Dark / System mode (completely independent of reader themes)
  useEffect(() => {
    saveAppearance(appearance);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyMode = () => {
      const isDark = resolveEffectiveDarkMode(appearance, mediaQuery.matches);
      document.documentElement.classList.toggle('dark', isDark);
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta) {
        themeMeta.setAttribute('content', isDark ? '#0B1120' : '#F8FAFC');
      }
    };

    applyMode();
    if (appearance === 'system') {
      mediaQuery.addEventListener('change', applyMode);
      return () => mediaQuery.removeEventListener('change', applyMode);
    }
  }, [appearance]);

  // Persist reader theme, font size, favourites, and notifications
  useEffect(() => {
    saveReaderTheme(readerTheme);
  }, [readerTheme]);

  useEffect(() => {
    saveFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    saveFavourites(favouriteIds);
  }, [favouriteIds]);

  useEffect(() => {
    saveNotificationPrefs(notifications);
  }, [notifications]);

  // Keep drawer state responsive across resize transitions
  useEffect(() => {
    let lastDesktop = window.innerWidth >= 1024;
    const onResize = () => {
      const nowDesktop = window.innerWidth >= 1024;
      if (nowDesktop !== lastDesktop) {
        lastDesktop = nowDesktop;
        setIsDrawerOpen(nowDesktop);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const favouriteEntries = useMemo(() => {
    return favouriteIds
      .map((id) => getEntryById(id))
      .filter((entry): entry is QuoteEntry => Boolean(entry));
  }, [favouriteIds]);

  const handleToggleFavourite = useCallback(
    (entryId: string) => {
      setFavouriteIds((prev) => {
        const wasSaved = prev.includes(entryId);
        const next = toggleFavouriteId(prev, entryId);
        showToast(wasSaved ? 'Removed from Favourites.' : 'Saved to Favourites.');
        return next;
      });
    },
    [showToast]
  );

  const handleCopyEntry = useCallback(
    async (entry: QuoteEntry, author: AuthorProfile) => {
      const formatted = formatEntryForShare(entry, author);
      const ok = await copyTextToClipboard(formatted);
      showToast(
        ok
          ? 'Copied to clipboard.'
          : 'Clipboard access is restricted in this browser.'
      );
    },
    [showToast]
  );

  const handleShareEntry = useCallback(
    async (entry: QuoteEntry, author: AuthorProfile) => {
      const text = formatEntryForShare(entry, author);
      const title = `SILENT THOUGHTS — ${author.displayName}`;

      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        try {
          await navigator.share({ title, text });
          return;
        } catch (err) {
          if ((err as Error)?.name === 'AbortError') return;
        }
      }
      setShareSheet({ title, text });
    },
    []
  );

  const handleShareApp = useCallback(async () => {
    const title = 'SILENT THOUGHTS';
    const text =
      'SILENT THOUGHTS — Words that stay with you. An international quote-reading Progressive Web App.';
    const url = typeof window !== 'undefined' ? window.location.href : undefined;

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }
    setShareSheet({ title: 'Share SILENT THOUGHTS', text, url });
  }, []);

  const handleOpenReader = useCallback(
    (entries: QuoteEntry[], activeIndex: number, contextLabel: string) => {
      if (entries.length === 0) return;
      setReaderSession({ entries, activeIndex, contextLabel });
    },
    []
  );

  const navigateTo = useCallback((nextView: AppView) => {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const activeAuthor =
    view.type === 'author' ? getAuthorById(view.authorId) : undefined;
  const activeAuthorEntries = useMemo(
    () => (activeAuthor ? getEntriesByAuthor(activeAuthor.id) : []),
    [activeAuthor]
  );

  return (
    <div className="flex min-h-dvh bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Navigation Drawer (Slide-over on mobile, collapsible docked rail on desktop) */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        currentView={view}
        favouritesCount={favouriteEntries.length}
        onClose={() => setIsDrawerOpen(false)}
        onSelectHome={() => navigateTo({ type: 'home' })}
        onSelectFavourites={() => navigateTo({ type: 'favourites' })}
        onSelectSettings={() => navigateTo({ type: 'settings' })}
        onSelectAuthor={(authorId) =>
          navigateTo({ type: 'author', authorId })
        }
      />

      {/* Main Content Shell */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          view={view}
          favouritesCount={favouriteEntries.length}
          isDrawerOpen={isDrawerOpen}
          onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
          onNavigateHome={() => navigateTo({ type: 'home' })}
          onOpenFavourites={() => navigateTo({ type: 'favourites' })}
          onShareApp={handleShareApp}
        />

        <main className="flex-1 pb-12">
          {view.type === 'home' && (
            <HomeView
              entries={ALL_ENTRIES}
              favouriteIds={favouriteIds}
              fontSize={fontSize}
              onOpenReader={handleOpenReader}
              onOpenAuthor={(authorId) =>
                navigateTo({ type: 'author', authorId })
              }
              onCopy={handleCopyEntry}
              onShare={handleShareEntry}
              onToggleFavourite={handleToggleFavourite}
            />
          )}

          {view.type === 'author' && activeAuthor && (
            <AuthorProfileView
              author={activeAuthor}
              entries={activeAuthorEntries}
              favouriteIds={favouriteIds}
              fontSize={fontSize}
              onOpenReader={handleOpenReader}
              onCopy={handleCopyEntry}
              onShare={handleShareEntry}
              onToggleFavourite={handleToggleFavourite}
            />
          )}

          {view.type === 'favourites' && (
            <FavouritesView
              entries={favouriteEntries}
              fontSize={fontSize}
              onBrowseHome={() => navigateTo({ type: 'home' })}
              onOpenReader={handleOpenReader}
              onOpenAuthor={(authorId) =>
                navigateTo({ type: 'author', authorId })
              }
              onCopy={handleCopyEntry}
              onShare={handleShareEntry}
              onToggleFavourite={handleToggleFavourite}
            />
          )}

          {view.type === 'settings' && (
            <SettingsView
              appearance={appearance}
              readerTheme={readerTheme}
              fontSize={fontSize}
              notifications={notifications}
              onChangeAppearance={setAppearance}
              onChangeReaderTheme={setReaderTheme}
              onChangeFontSize={setFontSize}
              onChangeNotifications={setNotifications}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Full-Screen Quote Reader (Four Independent Themes) */}
      {readerSession && (
        <QuoteReaderModal
          entries={readerSession.entries}
          activeIndex={readerSession.activeIndex}
          contextLabel={readerSession.contextLabel}
          readerTheme={readerTheme}
          fontSize={fontSize}
          favouriteIds={favouriteIds}
          onChangeIndex={(nextIndex) =>
            setReaderSession((prev) =>
              prev ? { ...prev, activeIndex: nextIndex } : null
            )
          }
          onChangeTheme={setReaderTheme}
          onClose={() => setReaderSession(null)}
          onOpenAuthor={(authorId) =>
            navigateTo({ type: 'author', authorId })
          }
          onCopy={handleCopyEntry}
          onShare={handleShareEntry}
          onToggleFavourite={handleToggleFavourite}
          onShowToast={showToast}
        />
      )}

      {/* Fallback Share Sheet */}
      {shareSheet && (
        <ShareSheetModal
          title={shareSheet.title}
          text={shareSheet.text}
          url={shareSheet.url}
          onClose={() => setShareSheet(null)}
          onShowToast={showToast}
        />
      )}

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Subtle Action Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`pointer-events-none fixed left-1/2 z-[80] -translate-x-1/2 rounded-full bg-slate-900/95 px-4 py-2.5 text-xs font-medium text-white shadow-xl ring-1 ring-white/15 backdrop-blur-md dark:bg-slate-100/95 dark:text-slate-900 ${
            readerSession ? 'bottom-24 sm:bottom-28' : 'bottom-5'
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
