
import type { HadithEntry, LiteraryQuote, QuoteEntry } from '../types/content';
import { APPROVED_AUTHORS } from './authors';

import allamaIqbal from './allama-iqbal.json';
import charlesDickens from './charles-dickens.json';
import emilyDickinson from './emily-dickinson.json';
import homer from './homer.json';
import janeAusten from './jane-austen.json';
import jrrTolkien from './jrr-tolkien.json';
import markTwain from './mark-twain.json';
import mayaAngelou from './maya-angelou.json';
import mirzaGhalib from './mirza-ghalib.json';
import oscarWilde from './oscar-wilde.json';
import pabloNeruda from './pablo-neruda.json';
import prophetMuhammad from './prophet-muhammad.json';
import robertFrost from './robert-frost.json';
import rumi from './rumi.json';
import virginiaWoolf from './virginia-woolf.json';
import waltWhitman from './walt-whitman.json';
import williamShakespeare from './william-shakespeare.json';

const COLLECTIONS_BY_AUTHOR: Record<string, QuoteEntry[]> = {
  'william-shakespeare': williamShakespeare as LiteraryQuote[],
  'oscar-wilde': oscarWilde as LiteraryQuote[],
  'mark-twain': markTwain as LiteraryQuote[],
  'jane-austen': janeAusten as LiteraryQuote[],
  'maya-angelou': mayaAngelou as LiteraryQuote[],
  'charles-dickens': charlesDickens as LiteraryQuote[],
  'robert-frost': robertFrost as LiteraryQuote[],
  'virginia-woolf': virginiaWoolf as LiteraryQuote[],
  'jrr-tolkien': jrrTolkien as LiteraryQuote[],
  homer: homer as LiteraryQuote[],
  'emily-dickinson': emilyDickinson as LiteraryQuote[],
  'walt-whitman': waltWhitman as LiteraryQuote[],
  rumi: rumi as LiteraryQuote[],
  'pablo-neruda': pabloNeruda as LiteraryQuote[],
  'mirza-ghalib': mirzaGhalib as LiteraryQuote[],
  'allama-iqbal': allamaIqbal as LiteraryQuote[],
  'prophet-muhammad': prophetMuhammad as HadithEntry[],
};

export function getEntriesByAuthor(authorId: string): QuoteEntry[] {
  return COLLECTIONS_BY_AUTHOR[authorId] ?? [];
}

/** Builds the interleaved feed only when requested. */
export function getHomeFeedEntries(): QuoteEntry[] {
  const orderedLists = APPROVED_AUTHORS.map((author) =>
    getEntriesByAuthor(author.id)
  );
  const maxLen = Math.max(0, ...orderedLists.map((list) => list.length));
  const interleaved: QuoteEntry[] = [];

  for (let round = 0; round < maxLen; round++) {
    for (const list of orderedLists) {
      if (list[round]) interleaved.push(list[round]);
    }
  }

  return interleaved;
}

/** Lazy cache: the full feed is no longer built at module initialization. */
let cachedHomeFeed: QuoteEntry[] | null = null;

export function getAllEntries(): QuoteEntry[] {
  if (!cachedHomeFeed) cachedHomeFeed = getHomeFeedEntries();
  return cachedHomeFeed;
}

/** Lazy ID lookup: constructed only when first needed. */
let cachedEntryById: Record<string, QuoteEntry> | null = null;

export function getEntryById(id: string): QuoteEntry | undefined {
  if (!cachedEntryById) {
    cachedEntryById = Object.fromEntries(
      getAllEntries().map((entry) => [entry.id, entry])
    );
  }
  return cachedEntryById[id];
}

export function getAuthorEntryCounts(authorId: string): {
  total: number;
  verified: number;
  samples: number;
  target: number;
} {
  const entries = getEntriesByAuthor(authorId);
  const author = APPROVED_AUTHORS.find((a) => a.id === authorId);
  const verified = entries.filter((e) => e.verificationStatus === 'verified').length;
  const samples = entries.filter(
    (e) => e.verificationStatus === 'sample_placeholder'
  ).length;

  return {
    total: entries.length,
    verified,
    samples,
    target: author?.targetCount ?? 200,
  };
}

/** Lightweight totals: counts come from author targets rather than scanning every quote. */
export function getLibraryTotals(): {
  profileCount: number;
  literaryAuthorCount: number;
  totalEntries: number;
  verifiedCount: number;
  sampleCount: number;
  targetTotal: number;
} {
  const literaryAuthorCount = APPROVED_AUTHORS.filter(
    (a) => a.kind === 'literary'
  ).length;
  const targetTotal = APPROVED_AUTHORS.reduce(
    (sum, a) => sum + a.targetCount,
    0
  );

  return {
    profileCount: APPROVED_AUTHORS.length,
    literaryAuthorCount,
    totalEntries: 0,
    verifiedCount: 0,
    sampleCount: 0,
    targetTotal,
  };
}
