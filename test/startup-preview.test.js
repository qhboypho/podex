import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
function previewHarness(draw) {
  const commits=[];
  const canvas={width:0,height:0};
  const context={clearRect(){},drawImage(frame){commits.push(frame);}};
  const sandbox={decorCanvas:canvas,decorCtx:context,decorPreviewPending:false,decorPreviewToken:0,
    element:{artboard:{clientWidth:400,clientHeight:700,getBoundingClientRect:()=>({width:400,height:450})}},
    window:{devicePixelRatio:1},scene:{},Core:{getTextItems:()=>[{type:'text'}],getIconItems:()=>[]},
    document:{createElement:()=>({width:0,height:0,getContext:()=>({})})},drawDecorItem:draw};
  vm.createContext(sandbox);
  vm.runInContext(source.slice(source.indexOf('  async function runDecorPreview()'),source.indexOf('  function scheduleDecorPreview()')),sandbox);
  return {sandbox,canvas,commits};
}
test('decor preview uses layout dimensions, not the animated bounding rectangle',async()=>{
  const h=previewHarness(async()=>{});
  await h.sandbox.runDecorPreview();
  assert.equal(h.canvas.width,400);assert.equal(h.canvas.height,700);
});
test('overlapping async text renders publish only the latest complete frame',async()=>{
  const releases=[];const contexts=[];
  const h=previewHarness(ctx=>{contexts.push(ctx);return new Promise(resolve=>releases.push(resolve));});
  const first=h.sandbox.runDecorPreview();
  const second=h.sandbox.runDecorPreview();
  assert.notEqual(contexts[0],contexts[1]);
  releases[1]();await second;
  releases[0]();await first;
  assert.equal(h.commits.length,1);
});
test('workspace starts hidden until restoration and first paint are complete',()=>{
  const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
  assert.ok(html.includes('class="workspace-loading"'));
  assert.ok(html.includes('.workspace-loading .stage-well{visibility:hidden'));
  assert.ok(source.includes("document.documentElement.classList.remove('workspace-loading')"));
});
