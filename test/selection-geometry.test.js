import test from 'node:test';
import assert from 'node:assert/strict';
import '../selection-geometry.js';
const G=globalThis.FormSelectionGeometry;
test('Ctrl toggles individual layers and complete groups without losing other selections',()=>{
  const group=['text:1','icon:2'];
  const first=G.toggleSelection(['artwork:3'],group);
  assert.deepEqual([...first],['artwork:3',...group]);
  assert.deepEqual([...G.toggleSelection(first,group)],['artwork:3']);
  assert.deepEqual([...G.toggleSelection(['text:1'],group)],group);
  assert.deepEqual([...G.toggleSelection(first,['text:1'])],['artwork:3','icon:2']);
});
test('workspace tools are exclusive and Space temporarily overrides with hand',()=>{
  assert.equal(G.pointerMode('select',false,false),'select');
  assert.equal(G.pointerMode('marquee',false,false),'marquee');
  assert.equal(G.pointerMode('hand',false,false),'pan');
  assert.equal(G.pointerMode('marquee',true,false),'pan');
  assert.equal(G.pointerMode('select',false,true),'brush');
  assert.equal(G.pointerMode('select',true,true),'pan');
});
test('reverse marquee selects only fully enclosed layers',()=>{
  const r=G.rectangle({x:80,y:90},{x:10,y:20});
  assert.equal(G.contains(r,{left:20,right:40,top:30,bottom:60}),true);
  assert.equal(G.contains(r,{left:0,right:40,top:30,bottom:60}),false);
});
test('shift marquee is square in screen coordinates in any direction',()=>{
  const r=G.rectangle({x:100,y:100},{x:80,y:40},true);
  assert.deepEqual(r,{left:40,right:100,top:40,bottom:100});
});
test('group resize preserves opposite corner and clamps whole-group scale',()=>{
  const box={left:10,right:110,top:20,bottom:70};
  assert.deepEqual(G.resize(box,'se',{x:210,y:120}),{anchor:{x:10,y:20},scale:2});
  assert.equal(G.resize(box,'se',{x:1000,y:1000},{min:.5,max:1.5}).scale,1.5);
  assert.equal(G.resize(box,'nw',{x:310,y:120},{min:.5,max:1.5}).scale,.5);
});
