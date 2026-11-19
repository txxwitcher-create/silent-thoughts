import React, { useState } from 'react';
import { CheckCircle2, Download, Share, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'drawer' | 'settings';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'drawer',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>Installed and running in standalone app mode.</span>
        </div>
      );
    }
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className={
          variant === 'drawer'
            ? 'flex min-h-[44px] w-full items-center gap-3 rounded-xl bg-blue-700 px-3.5 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-blue-800 active:scale-[0.99] dark:bg-blue-600 dark:hover:bg-blue-500'
            : 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-800 active:scale-[0.99] dark:bg-blue-600 dark:hover:bg-blue-500'
        }
      >
        <Download className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">Install SILENT THOUGHTS</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className={
            variant === 'drawer'
              ? 'flex min-h-[44px] w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2.5 text-left text-sm font-medium text-slate-800 transition-colors hover:bg-slate-200/70 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              : 'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
          }
        >
          <Smartphone className="h-4 w-4 shrink-0" />
          <span className="whitespace-nowrap">Install on iPhone / iPad</span>
        </button>

        {showIOSGuide && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-install-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
            onClick={() => setShowIOSGuide(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h3
                  id="ios-install-title"
                  className="text-base font-semibold text-slate-900 dark:text-white"
                >
                  Add to Home Screen
                </h3>
                <button
                  type="button"
                  aria-label="Close install instructions"
                  onClick={() => setShowIOSGuide(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ol className="mt-4 space-y-2.5 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    1.
                  </span>
                  <span>
                    Tap the{' '}
                    <span className="inline-flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                      <Share className="h-3.5 w-3.5" /> Share
                    </span>{' '}
                    button in Safari.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    2.
                  </span>
                  <span>
                    Scroll down and select{' '}
                    <strong className="text-slate-900 dark:text-white">
                      Add to Home Screen
                    </strong>
                    .
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    3.
                  </span>
                  <span>
                    Tap{' '}
                    <strong className="text-slate-900 dark:text-white">
                      Add
                    </strong>{' '}
                    to launch SILENT THOUGHTS like a native app.
                  </span>
                </li>
              </ol>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 min-h-[44px] w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (variant === 'settings') {
    return (
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        Open this app in Chrome on Android (or Edge/Chrome on desktop) over
        HTTPS—such as GitHub Pages—to trigger the direct{' '}
        <strong className="font-medium text-slate-900 dark:text-slate-200">
          Install App
        </strong>{' '}
        prompt, or use your browser menu’s{' '}
        <strong className="font-medium text-slate-900 dark:text-slate-200">
          Add to Home screen
        </strong>{' '}
        option.
      </p>
    );
  }

  return null;
};
