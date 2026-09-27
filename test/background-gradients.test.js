import test from 'node:test';
import assert from 'node:assert/strict';
import '../background-gradients.js';

const Gradients = globalThis.FormBackgroundGradients;

test('fashion background library exposes twelve unique named gradients and no old patterns', () => {
  const entries = Gradients.list();
  assert.equal(entries.length, 12);
  assert.equal(new Set(entries.map((entry) => entry.id)).size, entries.length);
  assert.ok(entries.every((entry) => entry.name && entry.label && entry.colors.length >= 3));
  assert.equal(Gradients.has('editorial-grid'), false);
});

test('every fashion gradient renders through the shared preview/export renderer', () => {
  const calls = [];
  const gradient = { addColorStop: (...args) => calls.push(['stop', ...args]) };
  const context = new Proxy({}, {
    get(target, key) {
      if (key in target) return target[key];
      if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => gradient;
      return (...args) => calls.push([key, ...args]);
    },
    set(target, key, value) { target[key] = value; return true; },
  });
  for (const entry of Gradients.list()) {
    calls.length = 0;
    assert.equal(Gradients.draw(context, 675, 1200, entry.id), true, entry.id);
    assert.ok(calls.some(([method]) => method === 'fillRect'), `${entry.id} needs a full-canvas fill`);
    assert.ok(calls.filter(([method]) => method === 'stop').length >= 5, `${entry.id} needs layered colour stops`);
  }
  assert.equal(Gradients.draw(context, 675, 1200, 'not-a-gradient'), false);
});
