/* Does the GLB occupy the same space as the FBX it came from?
   If the round-trip changed the root transform, scale={0.02} is now wrong
   and the bird would be rendering enormously off-scale. */
import fs from 'node:fs';
const stub = () => { const e={addEventListener(){},removeEventListener(){},style:{},getContext:()=>null}; let s=''; Object.defineProperty(e,'src',{get:()=>s,set:v=>{s=v}}); return e; };
globalThis.self ??= globalThis;
globalThis.document ??= { createElementNS: stub, createElement: stub };

const THREE = await import('three');
const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');
const rd = (p) => { const b = fs.readFileSync(p); return b.buffer.slice(b.byteOffset, b.byteOffset+b.byteLength); };

const fbx = new FBXLoader().parse(rd('assets-src/phoenix/fly.fbx'), '');

const gl = new GLTFLoader();
await MeshoptDecoder.ready;
gl.setMeshoptDecoder(MeshoptDecoder);
const glb = (await gl.parseAsync(rd('public/models/phoenix/phoenix.opt.glb'), '')).scene;

const report = (label, obj) => {
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const size = box.getSize(new THREE.Vector3());
    const ctr = box.getCenter(new THREE.Vector3());
    console.log(`\n${label}`);
    console.log('  root scale :', obj.scale.toArray().map(n=>n.toFixed(4)).join(', '));
    console.log('  size       :', size.toArray().map(n=>n.toFixed(1)).join(' x '));
    console.log('  center     :', ctr.toArray().map(n=>n.toFixed(1)).join(', '));
    // What the page actually renders: <group scale={0.02}>
    console.log('  @scale 0.02:', size.toArray().map(n=>(n*0.02).toFixed(2)).join(' x '),
                ' center', ctr.toArray().map(n=>(n*0.02).toFixed(2)).join(', '));
    return size;
};

const a = report('FBX (original)', fbx);
const b = report('GLB (shipping)', glb);

const ratio = b.clone().divide(a);
console.log('\nGLB / FBX size ratio:', ratio.toArray().map(n=>n.toFixed(3)).join(', '));
console.log(Math.abs(ratio.x-1) < 0.02 ? '=> SAME SCALE — scale={0.02} still correct'
                                       : '=> SCALE CHANGED — scale={0.02} is now WRONG');

// Visible extent of the camera used in HeroScene
const fov=50, dist=25;
const h = 2*dist*Math.tan(fov*Math.PI/360);
console.log(`\ncamera sees ~${h.toFixed(1)} units tall at z=25; model is ${(b.y*0.02).toFixed(1)} tall`);
