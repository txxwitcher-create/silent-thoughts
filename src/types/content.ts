export type VerificationStatus =
  | 'sample_placeholder'
  | 'pending_verification'
  | 'verified';

export type ProfileKind = 'literary' | 'religious_hadith';

export interface AuthorProfile {
  id: string;
  name: string;
  displayName: string;
  profession: string;
  era: string;
  tradition: string;
  biography: string;
  kind: ProfileKind;
  portraitSrc?: string;
  monogram: string;
  accentHue: string;
  targetCount: number;
}

export interface LiteraryQuote {
  id: string;
  entryType: 'literary';
  authorId: string;
  text: string;
  source: string | null;
  originalLanguage: string;
  translator: string | null;
  verificationStatus: VerificationStatus;
}

export interface HadithEntry {
  id: string;
  entryType: 'hadith';
  authorId: 'prophet-muhammad';
  arabicText: string | null;
  englishTranslation: string;
  narrator: string | null;
  collection: string | null;
  hadithNumber: string | null;
  chapter: string | null;
  authenticityGrade: string | null;
  sourceReference: string | null;
  verificationStatus: VerificationStatus;
}

export type QuoteEntry = LiteraryQuote | HadithEntry;

export type ReaderThemeId =
  | 'midnight-blue'
  | 'ocean-blue'
  | 'emerald-dream'
  | 'crimson-aura';

export type AppearanceMode = 'light' | 'dark' | 'system';

export type FontSizePreference = 'small' | 'medium' | 'large';

export interface NotificationPreferences {
  enabled: boolean;
  time: string;
}

export type AppView =
  | { type: 'home' }
  | { type: 'author'; authorId: string }
  | { type: 'favourites' }
  | { type: 'settings' };

export interface ReaderSession {
  entries: QuoteEntry[];
  activeIndex: number;
  contextLabel: string;
}
