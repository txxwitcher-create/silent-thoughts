import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Heart,
  Image as ImageIcon,
  MessageCircle,
  Share2,
  X,
} from 'lucide-react';
import type {
  AuthorProfile,
  FontSizePreference,
  QuoteEntry,
  ReaderThemeId,
} from '../types/content';
import { getAuthorById } from '../data/authors';
import { READER_THEMES, READER_THEME_LIST } from '../utils/themes';
import { getReaderQuoteSizeClass, stepReaderIndex } from '../utils/storage';
import {
  buildWhatsAppUrl,
  formatEntryForShare,
  getEntryDisplayText,
} from '../utils/shareUtils';
import {
  generateQuoteShareImage,
  type ShareImageFormat,
} from '../utils/quoteImageGenerator';
import { AuthorAvatar } from './AuthorAvatar';

interface QuoteReaderModalProps {
  entries: QuoteEntry[];
  activeIndex: number;
  contextLabel: string;
  readerTheme: ReaderThemeId;
  fontSize: FontSizePreference;
  favouriteIds: string[];
  onChangeIndex: (nextIndex: number) => void;
  onChangeTheme: (themeId: ReaderThemeId) => void;
  onClose: () => void;
  onOpenAuthor: (authorId: string) => void;
  onCopy: (entry: QuoteEntry, author: AuthorProfile) => Promise<void>;
  onShare: (entry: QuoteEntry, author: AuthorProfile) => void;
  onToggleFavourite: (entryId: string) => void;
  onShowToast: (message: string) => void;
}

interface GeneratedImageState {
  format: ShareImageFormat;
  dataUrl: string;
  blob: Blob | null;
  filename: string;
}

export const QuoteReaderModal: React.FC<QuoteReaderModalProps> = ({
  entries,
  activeIndex,
  contextLabel,
  readerTheme,
  fontSize,
  favouriteIds,
  onChangeIndex,
  onChangeTheme,
  onClose,
  onOpenAuthor,
  onCopy,
  onShare,
  onToggleFavourite,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] =
    useState<GeneratedImageState | null>(null);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const safeIndex = Math.max(0, Math.min(activeIndex, entries.length - 1));
  const currentEntry = entries[safeIndex];
  const author = currentEntry ? getAuthorById(currentEntry.authorId) : undefined;
  const activeTheme = READER_THEMES[readerTheme];
  const isFavourite = currentEntry
    ? favouriteIds.includes(currentEntry.id)
    : false;
  const quoteSizeClass = getReaderQuoteSizeClass(fontSize);

  const canGoPrev = safeIndex > 0;
  const canGoNext = safeIndex < entries.length - 1;

  const goPrev = () => {
    if (!canGoPrev) return;
    onChangeIndex(stepReaderIndex(safeIndex, -1, entries.length));
  };

  const goNext = () => {
    if (!canGoNext) return;
    onChangeIndex(stepReaderIndex(safeIndex, 1, entries.length));
  };

  // Lock body scroll and handle keyboard navigation
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (generatedImage) {
          setGeneratedImage(null);
        } else {
          onClose();
        }
      } else if (event.key === 'ArrowLeft' && !generatedImage) {
        onChangeIndex(stepReaderIndex(safeIndex, -1, entries.length));
      } else if (event.key === 'ArrowRight' && !generatedImage) {
        onChangeIndex(stepReaderIndex(safeIndex, 1, entries.length));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [entries.length, generatedImage, onChangeIndex, onClose, safeIndex]);

  // Reset transient states when changing quotes
  useEffect(() => {
    setCopied(false);
    setDragOffsetX(0);
  }, [safeIndex]);

  if (!currentEntry || !author) {
    return null;
  }

  const displayText = getEntryDisplayText(currentEntry);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - touchStartRef.current.x;
    const dy = e.touches[0].clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
      setDragOffsetX(Math.max(-90, Math.min(90, dx * 0.45)));
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const endTouch = e.changedTouches[0];
    const dx = endTouch.clientX - touchStartRef.current.x;
    const dy = endTouch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    setDragOffsetX(0);

    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
  };

  const handleCopy = async () => {
    await onCopy(currentEntry, author);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const handleCreateImage = async (format: ShareImageFormat) => {
    setIsGeneratingImage(true);
    try {
      const result = await generateQuoteShareImage(
        currentEntry,
        author,
        readerTheme,
        format
      );
      setGeneratedImage({
        format,
        dataUrl: result.dataUrl,
        blob: result.blob,
        filename: result.filename,
      });
    } catch {
      onShowToast('Could not render image on this device.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDownloadGeneratedImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage.dataUrl;
    link.download = generatedImage.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('Quote card image saved.');
  };

  const handleNativeShareGeneratedImage = async () => {
    if (!generatedImage?.blob) {
      handleDownloadGeneratedImage();
      return;
    }

    const file = new File([generatedImage.blob], generatedImage.filename, {
      type: 'image/png',
    });

    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };

    if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
      try {
        await nav.share({
          files: [file],
          title: `SILENT THOUGHTS — ${author.displayName}`,
          text: formatEntryForShare(currentEntry, author),
        });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }

    handleDownloadGeneratedImage();
    onShowToast(
      'Direct image sharing is not supported in this browser—PNG downloaded instead.'
    );
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Full-screen quote reader — ${activeTheme.name} theme`}
      data-testid="quote-reader-modal"
      data-reader-theme={readerTheme}
      className="fixed inset-0 z-50 flex flex-col justify-between overflow-hidden text-white transition-[background] duration-300"
      style={{ background: activeTheme.backgroundStyle }}
    >
      {/* TOP BAR: Close (Top-Left), Theme Switcher (Top-Center), Quote Counter (Top-Right) */}
      <div className="relative z-10 flex items-center justify-between gap-2 px-4 pt-4 pb-2 sm:px-6 sm:pt-5">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quote reader"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Four Functional Reading Themes */}
        <div
          role="radiogroup"
          aria-label="Quote reader theme"
          className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-2.5 py-1.5 backdrop-blur-md"
        >
          {READER_THEME_LIST.map((theme) => {
            const active = readerTheme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={`${theme.name} theme`}
                title={theme.name}
                onClick={() => onChangeTheme(theme.id)}
                className={`relative flex h-8 w-8 items-center justify-center rounded-full transition-transform focus-visible:outline-2 focus-visible:outline-white ${
                  active
                    ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-black/40'
                    : 'opacity-80 hover:scale-105 hover:opacity-100'
                }`}
                style={{ background: theme.swatchGradient }}
              >
                {active && <Check className="h-3.5 w-3.5 text-white" />}
              </button>
            );
          })}
        </div>

        {/* Top-Right Counter */}
        <div
          aria-label={`Quote ${safeIndex + 1} of ${entries.length}`}
          data-testid="reader-counter"
          className="flex min-h-[40px] shrink-0 items-center rounded-full border border-white/20 bg-white/10 px-3.5 text-xs font-semibold tracking-wide text-white/95 tabular-nums backdrop-blur-md"
        >
          {safeIndex + 1} / {entries.length}
        </div>
      </div>

      {/* Subtle Context + Theme Caption */}
      <div className="px-4 text-center text-xs text-white/70">
        <span>{contextLabel}</span>
        <span aria-hidden="true" className="mx-2 opacity-60">
          ·
        </span>
        <span>{activeTheme.name}</span>
      </div>

      {/* CENTER STAGE: Translucent Glass Quote Card + Swipe Gesture + Prev/Next */}
      <div
        className="relative flex flex-1 items-center justify-center px-4 py-4 sm:px-10"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Previous Button (Desktop & Accessible Navigation) */}
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous quote"
          className="mr-3 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        {/* Glass Quote Card */}
        <div
          className="reader-glass-card relative flex max-h-[68dvh] w-full max-w-xl flex-col justify-between overflow-y-auto rounded-3xl p-6 transition-transform duration-150 sm:p-9"
          style={{
            transform: `translateX(${dragOffsetX}px)`,
          }}
        >
          <div>
            <p className="text-center text-xs font-medium tracking-wider text-white/70">
              {currentEntry.verificationStatus === 'sample_placeholder'
                ? currentEntry.entryType === 'hadith'
                  ? 'Stage 1 Sample · Hadith Archive Slot'
                  : 'Stage 1 Sample Entry'
                : currentEntry.entryType === 'hadith'
                  ? 'Authenticated Hadith'
                  : 'Verified Quotation'}
            </p>

            <div className="mx-auto my-4 h-px w-12 bg-white/25" />

            {currentEntry.entryType === 'hadith' && currentEntry.arabicText && (
              <p
                dir="rtl"
                className="font-arabic mb-4 text-center text-2xl leading-loose text-white"
              >
                {currentEntry.arabicText}
              </p>
            )}

            <blockquote
              className={`font-editorial text-center font-medium italic text-white ${quoteSizeClass}`}
            >
              {displayText}
            </blockquote>

            {currentEntry.entryType === 'hadith' && (
              <p className="mt-4 text-center text-xs text-white/70">
                {currentEntry.collection ?? 'Collection pending Stage 2'} ·{' '}
                {currentEntry.authenticityGrade ?? 'Grading pending Stage 2'}
              </p>
            )}
          </div>

          {/* Author Portrait + Attribution inside Glass Card */}
          <div className="mt-7 border-t border-white/15 pt-5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthor(author.id);
              }}
              className="mx-auto flex min-h-[48px] max-w-full items-center gap-3.5 rounded-2xl px-3 py-1.5 text-left transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
            >
              <AuthorAvatar
                author={author}
                size="md"
                ringClassName="ring-2 ring-white/30"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  {author.displayName}
                </p>
                <p className="truncate text-xs text-white/75">
                  {author.profession}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Next Button (Desktop & Accessible Navigation) */}
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Next quote"
          className="ml-3 hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-30 sm:flex"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Swipe Hint + Prev/Next Controls */}
      <div className="flex items-center justify-center gap-4 px-4 pb-2 text-xs text-white/65 sm:hidden">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canGoPrev}
          aria-label="Previous quote"
          className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-2.5 text-white/85 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Prev</span>
        </button>
        <span>Swipe left or right</span>
        <button
          type="button"
          onClick={goNext}
          disabled={!canGoNext}
          aria-label="Next quote"
          className="inline-flex min-h-[36px] items-center gap-1 rounded-full px-2.5 text-white/85 disabled:opacity-30"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* BOTTOM ACTION DOCK: Copy, Share, Save, Share Image, WhatsApp Status */}
      <div className="relative z-10 border-t border-white/15 bg-black/20 px-2 pt-2.5 pb-4 backdrop-blur-md sm:px-6 sm:pb-5">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy quote"
            className="flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-white/90 transition-colors hover:bg-white/15 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
          >
            {copied ? (
              <Check className="h-5 w-5 text-emerald-300" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
            <span className="text-[11px] font-medium whitespace-nowrap">
              {copied ? 'Copied' : 'Copy'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onShare(currentEntry, author)}
            aria-label="Share quote"
            className="flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-white/90 transition-colors hover:bg-white/15 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-[11px] font-medium whitespace-nowrap">
              Share
            </span>
          </button>

          <button
            type="button"
            onClick={() => onToggleFavourite(currentEntry.id)}
            aria-label={isFavourite ? 'Remove from favourites' : 'Save to favourites'}
            aria-pressed={isFavourite}
            className={`flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 transition-colors hover:bg-white/15 active:scale-95 focus-visible:outline-2 focus-visible:outline-white ${
              isFavourite ? 'text-rose-300' : 'text-white/90'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavourite ? 'fill-current' : ''}`} />
            <span className="text-[11px] font-medium whitespace-nowrap">
              {isFavourite ? 'Saved' : 'Save'}
            </span>
          </button>

          <button
            type="button"
            disabled={isGeneratingImage}
            onClick={() => handleCreateImage('card')}
            aria-label="Share quote as image"
            className="flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-white/90 transition-colors hover:bg-white/15 active:scale-95 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-white"
          >
            <ImageIcon className="h-5 w-5" />
            <span className="text-[11px] font-medium whitespace-nowrap">
              Image
            </span>
          </button>

          <button
            type="button"
            disabled={isGeneratingImage}
            onClick={() => handleCreateImage('whatsapp-status')}
            aria-label="Share to WhatsApp Status"
            className="flex min-h-[54px] flex-col items-center justify-center gap-1 rounded-2xl px-1 py-1.5 text-white/90 transition-colors hover:bg-white/15 active:scale-95 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-white"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-[11px] font-medium whitespace-nowrap">
              Status
            </span>
          </button>
        </div>
      </div>

      {/* GENERATED IMAGE / WHATSAPP STATUS PREVIEW & EXPORT SHEET */}
      {generatedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-export-title"
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setGeneratedImage(null)}
        >
          <div
            className="flex max-h-[92dvh] w-full max-w-md flex-col rounded-t-3xl border border-white/15 bg-slate-950 p-5 text-white shadow-2xl sm:rounded-3xl sm:p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 id="image-export-title" className="text-base font-semibold">
                  {generatedImage.format === 'whatsapp-status'
                    ? 'WhatsApp Status Card (9:16)'
                    : 'Share Quote Image (4:5)'}
                </h3>
                <p className="text-xs text-slate-400">
                  Rendered in {activeTheme.name} theme
                </p>
              </div>
              <button
                type="button"
                aria-label="Close image preview"
                onClick={() => setGeneratedImage(null)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="my-4 flex flex-1 items-center justify-center overflow-hidden rounded-2xl bg-black/50 p-2">
              <img
                src={generatedImage.dataUrl}
                alt={`Rendered ${activeTheme.name} quote card for ${author.displayName}`}
                className="max-h-[48dvh] w-auto rounded-xl object-contain shadow-lg"
              />
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={handleNativeShareGeneratedImage}
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
              >
                <Share2 className="h-4 w-4" />
                <span>
                  {generatedImage.format === 'whatsapp-status'
                    ? 'Share Status Image'
                    : 'Share Image'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDownloadGeneratedImage}
                className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/15"
              >
                <Download className="h-4 w-4" />
                <span>Download PNG</span>
              </button>

              {generatedImage.format === 'whatsapp-status' && (
                <a
                  href={buildWhatsAppUrl(
                    formatEntryForShare(currentEntry, author)
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/60 px-4 py-2 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-900/60"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Open WhatsApp Text Share</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>

            {generatedImage.format === 'whatsapp-status' && (
              <p className="mt-3 text-center text-[11px] leading-relaxed text-slate-400">
                On Android, tap Share Status Image and select WhatsApp → My
                Status, or download the 9:16 PNG to post directly.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
