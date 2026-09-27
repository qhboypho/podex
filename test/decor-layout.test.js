import test from 'node:test';
import assert from 'node:assert/strict';
import '../decor-layout.js';
const L = globalThis.FormDecorLayout;
test('snap nearest edge rather than first matching centre', () => {
  const result = L.snap({left:19.7,right:29.7,top:10,bottom:20}, [{left:20,right:40,top:40,bottom:50}], .6,.6);
  assert.ok(Math.abs(result.dx-.3)<1e-8);
  assert.equal(result.v,20);
});
test('measure gaps from edges only where objects share an axis', () => {
  const gaps = L.gaps({left:10,right:20,top:10,bottom:20}, [{left:10,right:25,top:25,bottom:35},{left:70,right:80,top:70,bottom:80}]);
  assert.equal(gaps.length,1);
  assert.equal(gaps[0].distance,5);
  assert.equal(gaps[0].axis,'y');
});
test('explicit spacing accounts for different item sizes', () => {
  const result=L.space([{left:0,right:10,top:0,bottom:10},{left:30,right:50,top:0,bottom:10},{left:70,right:75,top:0,bottom:10}], 'x', 3);
  assert.deepEqual(result,[5,23,38.5]);
});
test('distant targets do not attract a dragged object', () => {
  assert.deepEqual(L.snap({left:1,right:3,top:1,bottom:3}, [{left:40,right:60,top:40,bottom:60}], .5,.5), {dx:0,dy:0,v:null,h:null});
});
test('snap threshold respects separate screen-space scales on both axes', () => {
  const result = L.snap({left:19.6,right:29.6,top:19.6,bottom:29.6}, [{left:20,right:40,top:20,bottom:40}], .3,.5);
  assert.equal(result.dx,0);
  assert.ok(Math.abs(result.dy-.4)<1e-8);
});
test('only nearest visible gap per direction is reported', () => {
  const box={left:10,right:20,top:10,bottom:20};
  const gaps=L.gaps(box,[{left:30,right:40,top:10,bottom:20},{left:25,right:27,top:10,bottom:20}]);
  assert.equal(gaps.length,1);
  assert.equal(gaps[0].distance,5);
});

test('text width changes keep its left edge fixed', () => {
  assert.deepEqual(
    L.anchorTextLeft({ x: 40, y: 30, rotation: 0 }, 100, 60, 1),
    { x: 35, y: 30 },
  );
  assert.deepEqual(
    L.anchorTextLeft({ x: 40, y: 30, rotation: 0 }, 60, 100, 1),
    { x: 45, y: 30 },
  );
});

test('rotated text preserves its visual left anchor while changing width', () => {
  const next = L.anchorTextLeft({ x: 40, y: 30, rotation: 90 }, 100, 60, 16 / 9);
  assert.ok(Math.abs(next.x - 40) < 1e-8);
  assert.ok(Math.abs(next.y - (30 - 5 * 16 / 9)) < 1e-8);
});
