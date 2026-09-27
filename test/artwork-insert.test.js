import test from 'node:test';
import assert from 'node:assert/strict';
import '../app-core.js';
const C=globalThis.FormCore;
test('inserting real artwork replaces Rouge placeholder and adds exactly one real layer',()=>{
  let s=C.createScene();
  s=C.insertArtwork(s,{name:'one.png',src:'blob:one'});
  assert.equal(s.overlays.length,1);
  assert.equal(s.overlays[0].artwork.src,'blob:one');
  s=C.insertArtwork(s,{name:'two.png',src:'blob:two'});
  assert.equal(s.overlays.length,2);
  assert.ok(s.overlays.every(o=>o.artwork.src));
});
test('cleanup removes only empty Rouge placeholders beside actual artwork',()=>{
  let s=C.createScene();
  s=C.addOverlay(s);
  s=C.updateDirectOverlay(s,{artwork:{name:C.DEFAULT_ARTWORK.name,src:'blob:real'}});
  const cleaned=C.removeUnusedArtworkPlaceholders(s);
  assert.equal(cleaned.overlays.length,1);
  assert.equal(cleaned.overlays[0].artwork.src,'blob:real');
  assert.deepEqual(cleaned.backOverlays,s.backOverlays);
});
test('invalid artwork cannot leave an extra placeholder',()=>{
  const s=C.createScene();
  assert.equal(C.insertArtwork(s,{name:'failed.png'}),s);
});
