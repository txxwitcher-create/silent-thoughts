import type { ReaderThemeId } from '../types/content';

export interface ReaderThemeConfig {
  id: ReaderThemeId;
  name: string;
  shortLabel: string;
  description: string;
  backgroundStyle: string;
  swatchGradient: string;
  canvasStops: [string, string, string];
  canvasGlow: string;
  accentRing: string;
}

export const READER_THEMES: Record<ReaderThemeId, ReaderThemeConfig> = {
  'midnight-blue': {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    shortLabel: 'Midnight',
    description: 'Deep navy gradient with quiet nocturnal contrast',
    backgroundStyle: 'radial-gradient(circle at 18% 15%, rgba(56, 102, 204, 0.32) 0%, transparent 48%), linear-gradient(155deg, #040917 0%, #0C1B3E 48%, #16306B 100%)',
    swatchGradient: 'linear-gradient(135deg, #060D21 0%, #102452 55%, #1D3F87 100%)',
    canvasStops: ['#040917', '#0C1B3E', '#16306B'],
    canvasGlow: 'rgba(67, 118, 232, 0.25)',
    accentRing: 'ring-blue-300',
  },
  'ocean-blue': {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    shortLabel: 'Ocean',
    description: 'Rich coastal cerulean and luminous marine depths',
    backgroundStyle: 'radial-gradient(circle at 82% 18%, rgba(56, 189, 248, 0.28) 0%, transparent 50%), linear-gradient(155deg, #05223E 0%, #0A467D 50%, #1474B8 100%)',
    swatchGradient: 'linear-gradient(135deg, #062747 0%, #0D5392 55%, #1882CC 100%)',
    canvasStops: ['#05223E', '#0A467D', '#1474B8'],
    canvasGlow: 'rgba(56, 189, 248, 0.24)',
    accentRing: 'ring-sky-300',
  },
  'emerald-dream': {
    id: 'emerald-dream',
    name: 'Emerald Dream',
    shortLabel: 'Emerald',
    description: 'Vibrant botanical emerald and serene turquoise light',
    backgroundStyle: 'radial-gradient(circle at 20% 20%, rgba(45, 212, 191, 0.26) 0%, transparent 50%), linear-gradient(155deg, #032624 0%, #07594F 50%, #0F8F7D 100%)',
    swatchGradient: 'linear-gradient(135deg, #042D2A 0%, #09685C 55%, #129E8B 100%)',
    canvasStops: ['#032624', '#07594F', '#0F8F7D'],
    canvasGlow: 'rgba(45, 212, 191, 0.24)',
    accentRing: 'ring-teal-300',
  },
  'crimson-aura': {
    id: 'crimson-aura',
    name: 'Crimson Aura',
    shortLabel: 'Crimson',
    description: 'Deep garnet crimson woven into imperial plum velvet',
    backgroundStyle: 'radial-gradient(circle at 80% 16%, rgba(244, 63, 94, 0.26) 0%, transparent 48%), linear-gradient(155deg, #21071A 0%, #5F112F 50%, #8A1E3E 100%)',
    swatchGradient: 'linear-gradient(135deg, #270920 0%, #6D1437 55%, #9B2246 100%)',
    canvasStops: ['#21071A', '#5F112F', '#8A1E3E'],
    canvasGlow: 'rgba(244, 63, 94, 0.24)',
    accentRing: 'ring-rose-300',
  },
};

export const READER_THEME_LIST: ReaderThemeConfig[] = [
  READER_THEMES['midnight-blue'],
  READER_THEMES['ocean-blue'],
  READER_THEMES['emerald-dream'],
  READER_THEMES['crimson-aura'],
];

export function isValidReaderTheme(value: unknown): value is ReaderThemeId {
  return (
    typeof value === 'string' &&
    Object.prototype.hasOwnProperty.call(READER_THEMES, value)
  );
}
