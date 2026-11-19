import type { AuthorProfile, QuoteEntry, ReaderThemeId } from '../types/content';
import { getEntryDisplayText } from './shareUtils';
import { READER_THEMES } from './themes';

export type ShareImageFormat = 'card' | 'whatsapp-status';

interface CanvasImageResult {
  dataUrl: string;
  blob: Blob | null;
  filename: string;
  width: number;
  height: number;
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function generateQuoteShareImage(
  entry: QuoteEntry,
  author: AuthorProfile,
  themeId: ReaderThemeId,
  format: ShareImageFormat
): Promise<CanvasImageResult> {
  const width = 1080;
  const height = format === 'whatsapp-status' ? 1920 : 1350;
  const theme = READER_THEMES[themeId];

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  // 1. Rich multi-stop gradient background matching active reader theme
  const grad = ctx.createLinearGradient(0, 0, width * 0.75, height);
  grad.addColorStop(0, theme.canvasStops[0]);
  grad.addColorStop(0.5, theme.canvasStops[1]);
  grad.addColorStop(1, theme.canvasStops[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Atmospheric glow accent
  const radial = ctx.createRadialGradient(
    width * 0.22,
    height * 0.18,
    40,
    width * 0.22,
    height * 0.18,
    width * 0.65
  );
  radial.addColorStop(0, theme.canvasGlow);
  radial.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);

  // 2. Translucent glass card container
  const cardMarginX = 92;
  const cardW = width - cardMarginX * 2;
  const cardH = format === 'whatsapp-status' ? 1120 : 880;
  const cardY = Math.round((height - cardH) / 2) - 24;

  ctx.save();
  drawRoundedRect(ctx, cardMarginX, cardY, cardW, cardH, 44);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.11)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.24)';
  ctx.stroke();
  ctx.restore();

  // 3. Stage 1 / Collection caption at top of glass card
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.66)';
  ctx.font = '500 24px "Plus Jakarta Sans", -apple-system, sans-serif';
  const topLabel =
    entry.verificationStatus === 'sample_placeholder'
      ? entry.entryType === 'hadith'
        ? 'STAGE 1 SAMPLE · HADITH SLOT'
        : 'STAGE 1 SAMPLE ENTRY'
      : entry.entryType === 'hadith'
        ? 'AUTHENTIC HADITH'
        : 'CURATED LITERARY ARCHIVE';
  ctx.fillText(topLabel, width / 2, cardY + 92);

  // Hairline rule
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 48, cardY + 124);
  ctx.lineTo(width / 2 + 48, cardY + 124);
  ctx.stroke();

  // 4. Quote Typography (large italic serif)
  const rawText = getEntryDisplayText(entry);
  const textMaxW = cardW - 144;
  const fontSize = rawText.length > 180 ? 44 : rawText.length > 110 ? 50 : 58;
  const lineHeight = Math.round(fontSize * 1.48);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `italic 500 ${fontSize}px "Cormorant Garamond", Georgia, serif`;
  const lines = wrapTextLines(ctx, rawText, textMaxW).slice(0, 9);

  const textBlockHeight = lines.length * lineHeight;
  const textStartY = cardY + 190 + Math.max(0, (cardH - 460 - textBlockHeight) / 2) + fontSize;

  lines.forEach((line, idx) => {
    ctx.fillText(line, width / 2, textStartY + idx * lineHeight);
  });

  // 5. Author Attribution
  const attrY = cardY + cardH - 135;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 90, attrY - 56);
  ctx.lineTo(width / 2 + 90, attrY - 56);
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '600 34px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText(author.displayName, width / 2, attrY);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.font = '400 24px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText(author.profession, width / 2, attrY + 42);

  // 6. Bottom Brand Signature
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.font = '600 24px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText('SILENT THOUGHTS', width / 2, height - 108);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.font = 'italic 400 26px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('Words that stay with you.', width / 2, height - 68);

  const dataUrl = canvas.toDataURL('image/png');
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/png')
  );

  const suffix = format === 'whatsapp-status' ? 'whatsapp-status' : 'quote-card';
  const filename = `silent-thoughts-${author.id}-${suffix}.png`;

  return { dataUrl, blob, filename, width, height };
}
