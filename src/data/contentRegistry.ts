import type { HadithEntry, LiteraryQuote, QuoteEntry } from '../types/content';
import { APPROVED_AUTHORS } from './authors';

import allamaIqbal from './collections/allama-iqbal.json';
import charlesDickens from './collections/charles-dickens.json';
import emilyDickinson from './collections/emily-dickinson.json';
import homer from './collections/homer.json';
import janeAusten from './collections/jane-austen.json';
import jrrTolkien from './collections/jrr-tolkien.json';
import markTwain from './collections/mark-twain.json';
import mayaAngelou from './collections/maya-angelou.json';
import mirzaGhalib from './collections/mirza-ghalib.json';
import oscarWilde from './collections/oscar-wilde.json';
import pabloNeruda from './collections/pablo-neruda.json';
import prophetMuhammad from './collections/prophet-muhammad.json';
import robertFrost from './collections/robert-frost.json';
import rumi from './collections/rumi.json';
import virginiaWoolf from './collections/virginia-woolf.json';
import waltWhitman from './collections/walt-whitman.json';
import williamShakespeare from './collections/william-shakespeare.json';

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

/**
 * Interleaved Home feed across all 17 approved profiles so readers immediately
 * experience the breadth of the international literary & Hadith archive.
 */
export function getHomeFeedEntries(): QuoteEntry[] {
  const orderedLists = APPROVED_AUTHORS.map((author) =>
    getEntriesByAuthor(author.id)
  );
  const maxLen = Math.max(0, ...orderedLists.map((list) => list.length));
  const interleaved: QuoteEntry[] = [];

  for (let round = 0; round < maxLen; round++) {
    for (const list of orderedLists) {
      if (list[round]) {
        interleaved.push(list[round]);
      }
    }
  }
  return interleaved;
}

export const ALL_ENTRIES: QuoteEntry[] = getHomeFeedEntries();

export const ENTRY_BY_ID: Record<string, QuoteEntry> = Object.fromEntries(
  ALL_ENTRIES.map((entry) => [entry.id, entry])
);

export function getEntryById(id: string): QuoteEntry | undefined {
  return ENTRY_BY_ID[id];
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
  const verifiedCount = ALL_ENTRIES.filter(
    (e) => e.verificationStatus === 'verified'
  ).length;
  const sampleCount = ALL_ENTRIES.filter(
    (e) => e.verificationStatus === 'sample_placeholder'
  ).length;
  const targetTotal = APPROVED_AUTHORS.reduce((sum, a) => sum + a.targetCount, 0);

  return {
    profileCount: APPROVED_AUTHORS.length,
    literaryAuthorCount,
    totalEntries: ALL_ENTRIES.length,
    verifiedCount,
    sampleCount,
    targetTotal,
  };
}
