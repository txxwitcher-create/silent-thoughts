import type { AuthorProfile, QuoteEntry } from '../types/content';

export function getEntryDisplayText(entry: QuoteEntry): string {
  return entry.entryType === 'hadith' ? entry.englishTranslation : entry.text;
}

export function formatEntryForShare(
  entry: QuoteEntry,
  author: AuthorProfile
): string {
  const body = getEntryDisplayText(entry);
  if (entry.entryType === 'hadith') {
    const parts = [body];
    const refParts = [
      entry.collection,
      entry.hadithNumber ? `Hadith ${entry.hadithNumber}` : null,
      entry.authenticityGrade,
    ].filter(Boolean);
    parts.push(`— ${author.displayName}`);
    if (refParts.length > 0) {
      parts.push(refParts.join(' · '));
    }
    if (entry.verificationStatus === 'sample_placeholder') {
      parts.push('[Stage 1 Sample Entry — SILENT THOUGHTS]');
    } else {
      parts.push('Shared via SILENT THOUGHTS');
    }
    return parts.join('\n');
  }

  const lines = [`“${body}”`, `— ${author.displayName}`];
  if (entry.source) {
    lines.push(entry.source);
  }
  if (entry.verificationStatus === 'sample_placeholder') {
    lines.push('[Stage 1 Sample Entry — SILENT THOUGHTS]');
  } else {
    lines.push('Shared via SILENT THOUGHTS');
  }
  return lines.join('\n');
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to textarea fallback
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function buildWhatsAppUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
