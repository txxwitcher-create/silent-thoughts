import React, { useState } from 'react';
import {
  Bell,
  Check,
  ExternalLink,
  Info,
  Monitor,
  Moon,
  Palette,
  Sun,
  Type,
  User,
} from 'lucide-react';
import type {
  AppearanceMode,
  FontSizePreference,
  NotificationPreferences,
  ReaderThemeId,
} from '../types/content';
import { READER_THEME_LIST } from '../utils/themes';
import { getLibraryTotals } from '../data/contentRegistry';
import { BrandLogoPlaceholder } from './BrandLogoPlaceholder';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsViewProps {
  appearance: AppearanceMode;
  readerTheme: ReaderThemeId;
  fontSize: FontSizePreference;
  notifications: NotificationPreferences;
  onChangeAppearance: (mode: AppearanceMode) => void;
  onChangeReaderTheme: (themeId: ReaderThemeId) => void;
  onChangeFontSize: (size: FontSizePreference) => void;
  onChangeNotifications: (prefs: NotificationPreferences) => void;
  onShowToast: (message: string) => void;
}

function getBrowserNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  appearance,
  readerTheme,
  fontSize,
  notifications,
  onChangeAppearance,
  onChangeReaderTheme,
  onChangeFontSize,
  onChangeNotifications,
  onShowToast,
}) => {
  const [notifPermission, setNotifPermission] = useState<
    NotificationPermission | 'unsupported'
  >(getBrowserNotificationPermission);

  const totals = getLibraryTotals();

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotifPermission('unsupported');
      onShowToast('Browser notifications are not supported in this browser.');
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setNotifPermission(result);
      if (result === 'granted') {
        onChangeNotifications({ ...notifications, enabled: true });
        onShowToast('Notification permission granted.');
      } else if (result === 'denied') {
        onShowToast(
          'Notification permission was denied in browser settings.'
        );
      }
    } catch {
      onShowToast('Unable to request notification permission in this context.');
    }
  };

  const handleSendTestNotification = () => {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window) ||
      Notification.permission !== 'granted'
    ) {
      onShowToast('Grant browser notification permission first.');
      return;
    }
    try {
      new Notification('SILENT THOUGHTS', {
        body: 'Words that stay with you. Daily reading reminder preview.',
        icon: './pwa-192x192.png',
      });
      onShowToast('Test notification sent.');
    } catch {
      onShowToast('This browser blocks direct notifications outside a service worker.');
    }
  };

  const handleToggleDailyReminder = async () => {
    const nextEnabled = !notifications.enabled;
    if (nextEnabled && notifPermission === 'default') {
      await handleRequestPermission();
      return;
    }
    onChangeNotifications({ ...notifications, enabled: nextEnabled });
    onShowToast(
      nextEnabled
        ? `Daily reminder preference saved for ${notifications.time}.`
        : 'Daily reminder preference disabled.'
    );
  };

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-8">
      <div className="mb-6 border-b border-slate-200/80 pb-5 dark:border-slate-800/80">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
          Preferences &amp; About
        </p>
        <h1 className="font-editorial mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Settings
        </h1>
        <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
          All settings are stored locally on your device with no account or
          cloud service required.
        </p>
      </div>

      <div className="space-y-6">
        {/* 1. APPEARANCE (Application-wide Light / Dark / System) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/75 sm:p-6">
          <div className="flex items-start gap-3">
            <Sun className="mt-0.5 h-5 w-5 shrink-0 text-slate-700 dark:text-slate-300" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                App Appearance
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Controls the interface theme across Home, Drawer, Author
                Profiles, Favourites, and Settings. Independent of the four
                Full-Screen Quote Reader themes.
              </p>

              <div
                role="radiogroup"
                aria-label="App appearance mode"
                className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-950"
              >
                {(
                  [
                    { id: 'light', label: 'Light', Icon: Sun },
                    { id: 'dark', label: 'Dark', Icon: Moon },
                    { id: 'system', label: 'System', Icon: Monitor },
                  ] as const
                ).map(({ id, label, Icon }) => {
                  const active = appearance === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onChangeAppearance(id)}
                      className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="whitespace-nowrap">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 2. FULL-SCREEN QUOTE READER THEME (Independent of Light/Dark) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/75 sm:p-6">
          <div className="flex items-start gap-3">
            <Palette className="mt-0.5 h-5 w-5 shrink-0 text-slate-700 dark:text-slate-300" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Full-Screen Quote Reader Theme
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Choose the immersive backdrop used in the quote reader and
                exported quote images. Persisted independently of Light/Dark
                mode.
              </p>

              <div
                role="radiogroup"
                aria-label="Full-screen quote reader theme"
                className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                {READER_THEME_LIST.map((theme) => {
                  const active = readerTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onChangeReaderTheme(theme.id)}
                      className={`flex min-h-[72px] items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all ${
                        active
                          ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-600 dark:border-blue-400 dark:bg-blue-950/30 dark:ring-blue-400'
                          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700'
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ring-1 ring-black/10"
                        style={{ background: theme.swatchGradient }}
                      >
                        {active && <Check className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {theme.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {theme.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. READING TYPOGRAPHY / FONT SIZE */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/75 sm:p-6">
          <div className="flex items-start gap-3">
            <Type className="mt-0.5 h-5 w-5 shrink-0 text-slate-700 dark:text-slate-300" />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Quote Text Size
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Adjust quotation legibility across feed cards, author profiles,
                and the full-screen reader.
              </p>

              <div
                role="radiogroup"
                aria-label="Quote text size"
                className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1.5 dark:bg-slate-950"
              >
                {(
                  [
                    { id: 'small', label: 'Small' },
                    { id: 'medium', label: 'Medium' },
                    { id: 'large', label: 'Large' },
                  ] as const
                ).map(({ id, label }) => {
                  const active = fontSize === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onChangeFontSize(id)}
                      className={`min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                          : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 4. DAILY READING REMINDER (Honest Browser Notification Handling) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/75 sm:p-6">
          <div className="flex items-start gap-3">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-slate-700 dark:text-slate-300" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                    Daily Reading Reminder
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Browser permission:{' '}
                    <strong className="font-medium text-slate-800 capitalize dark:text-slate-200">
                      {notifPermission}
                    </strong>
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={notifications.enabled}
                  aria-label="Toggle daily reading reminder preference"
                  onClick={handleToggleDailyReminder}
                  className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    notifications.enabled
                      ? 'bg-blue-700 dark:bg-blue-500'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full bg-white shadow-xs transition-transform ${
                      notifications.enabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label
                  htmlFor="daily-reminder-time"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Preferred time
                </label>
                <input
                  id="daily-reminder-time"
                  type="time"
                  value={notifications.time}
                  onChange={(e) =>
                    onChangeNotifications({
                      ...notifications,
                      time: e.target.value || '08:00',
                    })
                  }
                  className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 tabular-nums focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                {notifPermission !== 'granted' &&
                  notifPermission !== 'unsupported' && (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="min-h-[44px] rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Allow Notifications
                    </button>
                  )}

                {notifPermission === 'granted' && (
                  <button
                    type="button"
                    onClick={handleSendTestNotification}
                    className="min-h-[44px] rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Send Preview Notification
                  </button>
                )}
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                Platform note: Because SILENT THOUGHTS runs as a static PWA
                without a paid push backend, scheduled notifications fire only
                when your browser supports notifications and the app is active.
                Background delivery while fully closed requires a future Web
                Push service.
              </p>
            </div>
          </div>
        </div>

        {/* 5. INSTALL AS ANDROID / MOBILE PWA */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/75 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Install &amp; Offline Reading
          </h2>
          <p className="mt-1 mb-4 text-sm text-slate-600 dark:text-slate-400">
            Install SILENT THOUGHTS onto your Android home screen for full-screen
            standalone reading and offline access to cached collections.
          </p>
          <PWAInstallButton variant="settings" />
        </div>

        {/* 6. ABOUT SILENT THOUGHTS */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/75 sm:p-6">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-slate-700 dark:text-slate-300" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <BrandLogoPlaceholder size="sm" />
                <div>
                  <h2 className="font-editorial text-lg font-semibold tracking-[0.06em] text-slate-900 dark:text-white">
                    SILENT THOUGHTS
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Words that stay with you. · Stage 1 Foundation
                  </p>
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                SILENT THOUGHTS is an international literary quotation and
                authentic Hadith reading Progressive Web App crafted for calm,
                distraction-free reflection. Designed with an expandable JSON
                content architecture targeting{' '}
                <span className="tabular-nums font-medium text-slate-900 dark:text-slate-200">
                  {totals.targetTotal.toLocaleString()}
                </span>{' '}
                verified entries (16 literary authors × 200 quotes and 1,000
                authenticated Hadith).
              </p>
            </div>
          </div>
        </div>

        {/* 7. FOUNDER PROFILE (Structured Photo Placeholder) */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800/90 dark:bg-slate-900/75 sm:p-6">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Founder Profile
          </p>
          <div className="mt-4 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            {/* Dedicated Founder Photo Placeholder (actual photo supplied separately) */}
            <div
              data-founder-photo-slot="true"
              aria-label="Founder photograph placeholder for Aamir Shafi Bhat"
              className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-400"
            >
              <User className="h-6 w-6" />
              <span className="mt-0.5 text-[10px] font-medium">Photo Slot</span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Aamir Shafi Bhat
              </h3>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Founder &amp; Creator
              </p>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">
                Creator by passion. Angler by heart. 🎣
              </p>
              <a
                href="https://www.instagram.com/unfiltered.java/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-medium text-slate-800 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <span>Instagram: @unfiltered.java</span>
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
