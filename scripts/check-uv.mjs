/* Compare UVs from the source FBX against the exported GLB. If they match,
   the round-trip was identity and the textures keep TextureLoader's default
   flipY; if V is inverted, they need flipY = false. */
import fs from 'node:fs';
const stub = () => { const e={addEventListener(){},removeEventListener(){},style:{},getContext:()=>null}; let s=''; Object.defineProperty(e,'src',{get:()=>s,set:v=>{s=v}}); return e; };
globalThis.self ??= globalThis;
globalThis.document ??= { createElementNS: stub, createElement: stub };

const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
const { MeshoptDecoder } = await import('three/examples/jsm/libs/meshopt_decoder.module.js');

const rd = (p) => { const b = fs.readFileSync(p); return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength); };

let fbxUV = null;
new FBXLoader().parse(rd('public/models/phoenix/fly.fbx'), '').traverse(o => {
    if (o.isMesh && !fbxUV) fbxUV = o.geometry.attributes.uv.array;
});

const loader = new GLTFLoader();
await MeshoptDecoder.ready;
loader.setMeshoptDecoder(MeshoptDecoder);

const gltf = await loader.parseAsync(rd('public/models/phoenix/phoenix.opt.glb'), '');
let glbUV = null;
gltf.scene.traverse(o => {
    if (!o.isMesh || glbUV) return;
    const a = o.geometry.attributes.uv;
    // KHR_mesh_quantization stores UVs as normalized integers; undo that so
    // the two sets are comparable.
    const max = a.normalized ? (a.array.BYTES_PER_ELEMENT === 2 ? 65535 : 255) : 1;
    glbUV = Array.from(a.array, (v) => v / max);
});

console.log('FBX uv[0..7]:', Array.from(fbxUV.slice(0, 8)).map(n => n.toFixed(4)).join(' '));
console.log('GLB uv[0..7]:', Array.from(glbUV.slice(0, 8)).map(n => n.toFixed(4)).join(' '));

let same = 0, flipped = 0;
for (let i = 0; i < 400; i += 2) {
    if (Math.abs(fbxUV[i + 1] - glbUV[i + 1]) < 0.02) same++;
    if (Math.abs((1 - fbxUV[i + 1]) - glbUV[i + 1]) < 0.02) flipped++;
}
console.log(`\nV matches: ${same}/200   V inverted: ${flipped}/200`);
console.log(same > flipped ? '=> identity round-trip: KEEP default flipY (true)'
                           : '=> V was flipped: SET flipY = false');
