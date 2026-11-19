
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  STORAGE_KEYS,
  loadAppearance,
  saveAppearance,
  resolveEffectiveDarkMode,
  loadReaderTheme,
  saveReaderTheme,
  loadFontSize,
  saveFontSize,
  loadFavourites,
  saveFavourites,
  toggleFavouriteId,
  loadNotificationPrefs,
  saveNotificationPrefs,
  stepReaderIndex,
  type StorageAdapter,
} from './storage';

function createMemoryStorage(): StorageAdapter {
  const store = new Map<string, string>();
  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

test('appearance mode persists and resolves light, dark, and system correctly', () => {
  const mem = createMemoryStorage();
  assert.equal(loadAppearance(mem), 'system');

  saveAppearance('dark', mem);
  assert.equal(loadAppearance(mem), 'dark');
  assert.equal(resolveEffectiveDarkMode('dark', false), true);
  assert.equal(resolveEffectiveDarkMode('light', true), false);
  assert.equal(resolveEffectiveDarkMode('system', true), true);
  assert.equal(resolveEffectiveDarkMode('system', false), false);
});

test('reader theme persists independently of appearance mode and validates unknown values', () => {
  const mem = createMemoryStorage();
  assert.equal(loadReaderTheme(mem), 'midnight-blue');

  saveReaderTheme('emerald-dream', mem);
  saveAppearance('light', mem);
  assert.equal(loadReaderTheme(mem), 'emerald-dream');
  assert.equal(loadAppearance(mem), 'light');

  saveReaderTheme('crimson-aura', mem);
  assert.equal(loadReaderTheme(mem), 'crimson-aura');

  mem.setItem(STORAGE_KEYS.READER_THEME, 'invalid-theme');
  assert.equal(loadReaderTheme(mem), 'midnight-blue');
});

test('favourites toggle, deduplicate, and persist across restarts', () => {
  const mem = createMemoryStorage();
  assert.deepEqual(loadFavourites(mem), []);

  let favs = toggleFavouriteId([], 'william-shakespeare-sample-001');
  favs = toggleFavouriteId(favs, 'rumi-sample-001');
  saveFavourites([...favs, 'rumi-sample-001'], mem);

  const reloaded = loadFavourites(mem);
  assert.deepEqual(reloaded, ['rumi-sample-001', 'william-shakespeare-sample-001']);

  const afterRemove = toggleFavouriteId(reloaded, 'rumi-sample-001');
  saveFavourites(afterRemove, mem);
  assert.deepEqual(loadFavourites(mem), ['william-shakespeare-sample-001']);
});

test('font size and notification preferences persist safely', () => {
  const mem = createMemoryStorage();
  assert.equal(loadFontSize(mem), 'medium');
  saveFontSize('large', mem);
  assert.equal(loadFontSize(mem), 'large');

  assert.deepEqual(loadNotificationPrefs(mem), { enabled: false, time: '08:00' });
  saveNotificationPrefs({ enabled: true, time: '07:30' }, mem);
  assert.deepEqual(loadNotificationPrefs(mem), { enabled: true, time: '07:30' });
});

test('reader swipe index clamps cleanly within collection bounds', () => {
  assert.equal(stepReaderIndex(0, -1, 5), 0);
  assert.equal(stepReaderIndex(0, 1, 5), 1);
  assert.equal(stepReaderIndex(4, 1, 5), 4);
  assert.equal(stepReaderIndex(2, -1, 5), 1);
  assert.equal(stepReaderIndex(0, 1, 0), 0);
});
    
