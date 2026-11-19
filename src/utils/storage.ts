import type {
  AppearanceMode,
  FontSizePreference,
  NotificationPreferences,
  ReaderThemeId,
} from '../types/content';
import { isValidReaderTheme } from './themes';

export const STORAGE_KEYS = {
  APPEARANCE: 'silent-thoughts-appearance',
  READER_THEME: 'silent-thoughts-reader-theme',
  FAVOURITES: 'silent-thoughts-favourites',
  FONT_SIZE: 'silent-thoughts-font-size',
  NOTIFICATIONS: 'silent-thoughts-notifications',
} as const;

export interface StorageAdapter {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
}

function getBrowserStorage(): StorageAdapter | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function loadAppearance(storage: StorageAdapter | null = getBrowserStorage()): AppearanceMode {
  try {
    const val = storage?.getItem(STORAGE_KEYS.APPEARANCE);
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch {
    // ignore storage errors
  }
  return 'system';
}

export function saveAppearance(
  mode: AppearanceMode,
  storage: StorageAdapter | null = getBrowserStorage()
): void {
  try {
    storage?.setItem(STORAGE_KEYS.APPEARANCE, mode);
  } catch {
    // ignore storage errors
  }
}

export function resolveEffectiveDarkMode(
  mode: AppearanceMode,
  systemPrefersDark: boolean
): boolean {
  if (mode === 'dark') return true;
  if (mode === 'light') return false;
  return systemPrefersDark;
}

export function loadReaderTheme(storage: StorageAdapter | null = getBrowserStorage()): ReaderThemeId {
  try {
    const val = storage?.getItem(STORAGE_KEYS.READER_THEME);
    if (isValidReaderTheme(val)) {
      return val;
    }
  } catch {
    // ignore storage errors
  }
  return 'midnight-blue';
}

export function saveReaderTheme(
  themeId: ReaderThemeId,
  storage: StorageAdapter | null = getBrowserStorage()
): void {
  try {
    storage?.setItem(STORAGE_KEYS.READER_THEME, themeId);
  } catch {
    // ignore storage errors
  }
}

export function loadFontSize(
  storage: StorageAdapter | null = getBrowserStorage()
): FontSizePreference {
  try {
    const val = storage?.getItem(STORAGE_KEYS.FONT_SIZE);
    if (val === 'small' || val === 'medium' || val === 'large') {
      return val;
    }
  } catch {
    // ignore storage errors
  }
  return 'medium';
}

export function saveFontSize(
  size: FontSizePreference,
  storage: StorageAdapter | null = getBrowserStorage()
): void {
  try {
    storage?.setItem(STORAGE_KEYS.FONT_SIZE, size);
  } catch {
    // ignore storage errors
  }
}

export function loadFavourites(
  storage: StorageAdapter | null = getBrowserStorage()
): string[] {
  try {
    const raw = storage?.getItem(STORAGE_KEYS.FAVOURITES);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const unique = new Set<string>();
      for (const item of parsed) {
        if (typeof item === 'string' && item.trim().length > 0) {
          unique.add(item);
        }
      }
      return Array.from(unique);
    }
  } catch {
    // ignore malformed JSON
  }
  return [];
}

export function saveFavourites(
  ids: string[],
  storage: StorageAdapter | null = getBrowserStorage()
): void {
  try {
    const deduped = Array.from(new Set(ids));
    storage?.setItem(STORAGE_KEYS.FAVOURITES, JSON.stringify(deduped));
  } catch {
    // ignore storage errors
  }
}

export function toggleFavouriteId(currentIds: string[], targetId: string): string[] {
  if (currentIds.includes(targetId)) {
    return currentIds.filter((id) => id !== targetId);
  }
  return [targetId, ...currentIds];
}

export function loadNotificationPrefs(
  storage: StorageAdapter | null = getBrowserStorage()
): NotificationPreferences {
  try {
    const raw = storage?.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
      return {
        enabled: Boolean(parsed.enabled),
        time:
          typeof parsed.time === 'string' && /^\d{2}:\d{2}$/.test(parsed.time)
            ? parsed.time
            : '08:00',
      };
    }
  } catch {
    // ignore storage errors
  }
  return { enabled: false, time: '08:00' };
}

export function saveNotificationPrefs(
  prefs: NotificationPreferences,
  storage: StorageAdapter | null = getBrowserStorage()
): void {
  try {
    storage?.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
}

export function stepReaderIndex(
  currentIndex: number,
  delta: number,
  total: number
): number {
  if (total <= 0) return 0;
  const next = currentIndex + delta;
  if (next < 0) return 0;
  if (next >= total) return total - 1;
  return next;
}

export function getCardQuoteSizeClass(size: FontSizePreference): string {
  switch (size) {
    case 'small':
      return 'text-[1.125rem] sm:text-[1.2rem] leading-[1.6]';
    case 'large':
      return 'text-[1.45rem] sm:text-[1.6rem] leading-[1.52]';
    case 'medium':
    default:
      return 'text-[1.28rem] sm:text-[1.38rem] leading-[1.56]';
  }
}

export function getReaderQuoteSizeClass(size: FontSizePreference): string {
  switch (size) {
    case 'small':
      return 'text-[1.35rem] sm:text-[1.65rem] leading-[1.55]';
    case 'large':
      return 'text-[1.8rem] sm:text-[2.25rem] leading-[1.42]';
    case 'medium':
    default:
      return 'text-[1.55rem] sm:text-[1.95rem] leading-[1.48]';
  }
      }
