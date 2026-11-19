import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APPROVED_AUTHORS,
  getAlphabeticalLiteraryAuthors,
  getSpecialReligiousProfiles,
} from './authors';
import {
  ALL_ENTRIES,
  getEntriesByAuthor,
  getLibraryTotals,
} from './contentRegistry';

const EXPECTED_APPROVED_IDS = [
  'william-shakespeare',
  'oscar-wilde',
  'mark-twain',
  'jane-austen',
  'maya-angelou',
  'charles-dickens',
  'robert-frost',
  'virginia-woolf',
  'jrr-tolkien',
  'homer',
  'emily-dickinson',
  'walt-whitman',
  'rumi',
  'pablo-neruda',
  'mirza-ghalib',
  'allama-iqbal',
  'prophet-muhammad',
];

test('directory contains exactly the 17 approved profiles and no unapproved authors', () => {
  assert.equal(APPROVED_AUTHORS.length, 17);
  assert.deepEqual(
    APPROVED_AUTHORS.map((a) => a.id).sort(),
    [...EXPECTED_APPROVED_IDS].sort()
  );
});

test('16 literary authors are sorted alphabetically A–Z and special profile is separated respectfully', () => {
  const literary = getAlphabeticalLiteraryAuthors();
  const special = getSpecialReligiousProfiles();

  assert.equal(literary.length, 16);
  assert.equal(special.length, 1);
  assert.equal(special[0].id, 'prophet-muhammad');
  assert.equal(special[0].portraitSrc, undefined);

  for (let i = 1; i < literary.length; i++) {
    assert.ok(
      literary[i - 1].name.localeCompare(literary[i].name, 'en') <= 0,
      `Expected ${literary[i - 1].name} <= ${literary[i].name}`
    );
  }
});

test('content architecture targets exactly 4,200 entries with unique IDs and zero fabricated quotes', () => {
  const totals = getLibraryTotals();
  assert.equal(totals.profileCount, 17);
  assert.equal(totals.literaryAuthorCount, 16);
  assert.equal(totals.targetTotal, 4200);
  assert.ok(totals.totalEntries >= 50);

  const uniqueIds = new Set(ALL_ENTRIES.map((e) => e.id));
  assert.equal(uniqueIds.size, ALL_ENTRIES.length);

  for (const author of APPROVED_AUTHORS) {
    const entries = getEntriesByAuthor(author.id);
    assert.ok(entries.length >= 3, `Expected sample entries for ${author.id}`);
    for (const entry of entries) {
      assert.equal(entry.authorId, author.id);
      assert.equal(entry.verificationStatus, 'sample_placeholder');
      if (author.id === 'prophet-muhammad') {
        assert.equal(entry.entryType, 'hadith');
        assert.equal(entry.hadithNumber, null);
        assert.equal(entry.authenticityGrade, null);
      } else {
        assert.equal(entry.entryType, 'literary');
        assert.equal(entry.source, null);
      }
    }
  }
});
