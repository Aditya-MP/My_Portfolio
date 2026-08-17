/* Which axis does the phoenix face? Derive it from the rig rather than guess:
   head-minus-pelvis gives the body axis, and the wing bones give the span. */
import fs from 'node:fs';
const stub = () => { const e={addEventListener(){},removeEventListener(){},style:{},getContext:()=>null}; let s=''; Object.defineProperty(e,'src',{get:()=>s,set:v=>{s=v}}); return e; };
globalThis.self ??= globalThis;
globalThis.document ??= { createElementNS: stub, createElement: stub };

const THREE = await import('three');
const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');

const b = fs.readFileSync('public/models/phoenix/phoenix.opt.glb');
const gl = new GLTFLoader();
await MeshoptDecoder.ready;
gl.setMeshoptDecoder(MeshoptDecoder);
const scene = (await gl.parseAsync(b.buffer.slice(b.byteOffset, b.byteOffset+b.byteLength), '')).scene;
scene.updateMatrixWorld(true);

const bones = {};
scene.traverse(o => { if (o.isBone) bones[o.name] = o; });

const wp = (n) => {
    const v = new THREE.Vector3();
    bones[n]?.getWorldPosition(v);
    return v;
};
const show = (n) => `${n.padEnd(16)} ${wp(n).toArray().map(x=>x.toFixed(1).padStart(8)).join(' ')}`;
['b_Head','b_Neck_0','B_Spine','B_Pelvis','B_Tail_0','B_Left_Wing_9','B_Right_Wing_9','b_Root']
    .forEach(n => console.log('  ' + show(n)));

const head = wp('b_Head'), pelvis = wp('B_Pelvis'), tail = wp('B_Tail_0');
const lw = wp('B_Left_Wing_9'), rw = wp('B_Right_Wing_9');

const fwd = head.clone().sub(pelvis).normalize();
const span = lw.clone().sub(rw).normalize();
const axis = (v) => {
    const a = [['+X',v.x],['+Y',v.y],['+Z',v.z]];
    const [n,val] = a.reduce((m,c)=>Math.abs(c[1])>Math.abs(m[1])?c:m);
    return `${val<0 ? n.replace('+','-') : n} (${v.toArray().map(x=>x.toFixed(2)).join(', ')})`;
};
console.log('\n  forward  (head - pelvis) :', axis(fwd));
console.log('  tail dir (tail - pelvis) :', axis(tail.clone().sub(pelvis).normalize()));
console.log('  wingspan (L - R wingtip) :', axis(span));
