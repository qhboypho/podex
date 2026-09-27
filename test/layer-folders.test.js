import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../app-core.js';
const C=globalThis.FormCore;
test('duplicate group remaps member IDs and keeps content, visibility and relative layout',()=>{
  let s=C.addIconItem(C.addTextItem(C.createScene(),{content:'Thêu',x:40,y:30}),{x:20,y:30,hidden:true});
  const keys=[`text:${s.textItems[0].id}`,`icon:${s.iconItems[0].id}`,`artwork:${s.overlays[0].id}`];
  s.layerGroups=[{id:'original',name:'Thông tin',side:'front',keys}];
  const result=C.duplicateLayers(s,keys,'original');
  assert.equal(result.scene.layerGroups.length,2);
  const group=result.scene.layerGroups[1];
  assert.equal(group.name,'Thông tin — bản sao');
  assert.ok(group.keys.every(key=>!keys.includes(key)));
  assert.equal(result.scene.textItems[1].content,'Thêu');
  assert.equal(result.scene.iconItems[1].hidden,true);
  assert.equal(result.scene.textItems[1].x-result.scene.iconItems[1].x,20);
  assert.notEqual(result.scene.overlays[1].artwork,s.overlays[0].artwork);
  assert.equal(s.textItems.length,1);
  assert.deepEqual(C.applyDraft(C.createScene(),C.serializeDraft(result.scene)).layerGroups,result.scene.layerGroups);
});
test('duplicate one member is independent of its original group',()=>{
  const s=C.addTextItem(C.createScene(),{content:'Test',groupId:'legacy'});
  const result=C.duplicateLayers(s,[`text:${s.textItems[0].id}`]);
  assert.equal(result.scene.textItems[1].groupId,null);
  assert.equal(result.copies.length,1);
  assert.equal(result.scene.layerGroups?.length || 0,0);
});
test('duplicate stays on back side and repeated copies use unique IDs',()=>{
  let s=C.selectView(C.createScene(),'back');
  s=C.addTextItem(s,{content:'Back',x:96});
  const key=`text:${s.backTextItems[0].id}`;
  const first=C.duplicateLayers(s,[key]);
  const second=C.duplicateLayers(first.scene,[key]);
  assert.equal(second.scene.backTextItems.length,3);
  assert.equal(new Set(second.scene.backTextItems.map(item=>item.id)).size,3);
  assert.equal(second.scene.backTextItems[2].x,97);
  assert.deepEqual(second.scene.textItems,s.textItems);
});
test('folder eye hides and shows every member including locked items, persists after reload',()=>{
  let s=C.addTextItem(C.createScene(),{content:'Full thêu',locked:true});
  s=C.addIconItem(s,{iconId:'star',hidden:true});
  const keys=[`text:${s.textItems[0].id}`,`icon:${s.iconItems[0].id}`];
  s.layerGroups=[{id:'eye',side:'front',keys}];
  const hidden=C.toggleLayerGroupHidden(s,'eye');
  assert.ok(hidden.textItems[0].hidden && hidden.iconItems[0].hidden);
  assert.equal(hidden.textItems[0].locked,true);
  assert.deepEqual(hidden.overlays,s.overlays);
  const restored=C.applyDraft(C.createScene(),C.serializeDraft(hidden));
  assert.equal(C.isLayerGroupHidden(restored,'eye'),true);
  const visible=C.toggleLayerGroupHidden(restored,'eye');
  assert.equal(visible.textItems[0].hidden,false);
  assert.equal(visible.iconItems[0].hidden,false);
  assert.equal(visible.textItems[0].x,s.textItems[0].x);
});
test('folder visibility targets its own side and tolerates removed members',()=>{
  let s=C.addTextItem(C.createScene(),{content:'Front'});
  s={...s,backTextItems:[{...s.textItems[0],side:'back'}],layerGroups:[{id:'back',side:'back',keys:[`text:${s.textItems[0].id}`,'icon:999999']}]};
  const hidden=C.toggleLayerGroupHidden(s,'back');
  assert.equal(hidden.backTextItems[0].hidden,true);
  assert.equal(hidden.textItems[0].hidden,false);
  assert.equal(C.toggleLayerGroupHidden(s,'missing'),s);
});
test('folder title supports double-click rename without a separate rename button',()=>{
  const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
  assert.equal(source.includes('data-folder-rename='),false);
  assert.ok(source.includes("button.addEventListener('dblclick',beginRename)"));
  assert.ok(source.includes('if(preserveFolderList) return;'));
});
test('folder rename and collapsed state survive reload',()=>{
  let s=C.createScene();
  s.layerGroups=[{id:'g1',side:'front',keys:['text:1','icon:2']}];
  s=C.updateLayerGroup(s,'g1',{name:'  Thông tin áo  ',collapsed:true});
  const restored=C.applyDraft(C.createScene(),C.serializeDraft(s));
  assert.equal(restored.layerGroups[0].name,'Thông tin áo');
  assert.equal(restored.layerGroups[0].collapsed,true);
});
test('ungroup removes only folder and keeps layer content and positions',()=>{
  let s=C.addTextItem(C.createScene(),{content:'Full thêu',x:30,y:40});
  s.layerGroups=[{id:'g1',side:'front',keys:['text:1','icon:2']},{id:'g2',side:'back',keys:['text:3','icon:4']}];
  const result=C.removeLayerGroup(s,'g1');
  assert.deepEqual(result.textItems,s.textItems);
  assert.deepEqual(result.overlays,s.overlays);
  assert.deepEqual(result.layerGroups,[s.layerGroups[1]]);
});
test('deselected group frame has an explicit hiding rule',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/\.workspace-group\.hidden\s*\{\s*display:\s*none/);
});
test('folder rename sanitizes length and leaves membership untouched',()=>{
  const s={...C.createScene(),layerGroups:[{id:'g',side:'front',keys:['text:1','icon:2']}]};
  const renamed=C.updateLayerGroup(s,'g',{name:'x'.repeat(120),keys:['text:99']});
  assert.equal(renamed.layerGroups[0].name.length,80);
  assert.deepEqual(renamed.layerGroups[0].keys,s.layerGroups[0].keys);
  assert.equal(C.updateLayerGroup(s,'g',{name:'   '}).layerGroups[0].name,'Nhóm');
});
