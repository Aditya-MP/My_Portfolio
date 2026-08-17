/**
 * One-off: convert the Phoenix FBX to GLB using the `three` we already depend on,
 * so no native converter binary is needed.
 *
 * Textures are intentionally NOT carried over — Phoenix.jsx builds its own
 * MeshStandardMaterials and assigns the texture files by hand. We only need
 * geometry, skeleton and the single animation clip.
 *
 * FBXLoader eagerly constructs <img> elements for embedded textures, so a
 * minimal DOM stub has to exist before `three` is imported. Hence the dynamic
 * imports below.
 */
import fs from 'node:fs';

const stub = () => {
    const el = {
        addEventListener() {}, removeEventListener() {}, setAttribute() {},
        style: {}, width: 0, height: 0,
        getContext: () => null,
    };
    let _src = '';
    Object.defineProperty(el, 'src', { get: () => _src, set: (v) => { _src = v; } });
    return el;
};
globalThis.self ??= globalThis;
globalThis.document ??= {
    createElementNS: () => stub(),
    createElement: () => stub(),
};
globalThis.URL.createObjectURL ??= () => 'blob:stub';
globalThis.URL.revokeObjectURL ??= () => {};

// GLTFExporter reads its binary output back through a FileReader, which Node
// does not expose globally. The async shape matters: the exporter assigns
// onloadend *after* calling read, so the callback must fire on a later tick.
globalThis.FileReader ??= class {
    constructor() { this.result = null; this.onloadend = null; this.onload = null; this.onerror = null; }
    readAsArrayBuffer(blob) {
        blob.arrayBuffer().then((ab) => {
            this.result = ab;
            this.onload?.({ target: this });
            this.onloadend?.({ target: this });
        }, (e) => this.onerror?.(e));
    }
    readAsDataURL(blob) {
        blob.arrayBuffer().then((ab) => {
            this.result = `data:${blob.type || 'application/octet-stream'};base64,` + Buffer.from(ab).toString('base64');
            this.onload?.({ target: this });
            this.onloadend?.({ target: this });
        }, (e) => this.onerror?.(e));
    }
};

const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js');
const { GLTFExporter } = await import('three/examples/jsm/exporters/GLTFExporter.js');

const IN = 'public/models/phoenix/fly.fbx';
const OUT = 'public/models/phoenix/phoenix.glb';

const buf = fs.readFileSync(IN);
const group = new FBXLoader().parse(
    buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), ''
);

console.log('animations:', group.animations.length);
group.animations.forEach(a =>
    console.log(`  clip "${a.name}"  dur ${a.duration.toFixed(2)}s  tracks ${a.tracks.length}`));

let meshes = 0, bones = 0;
group.traverse(o => { if (o.isMesh) meshes++; if (o.isBone) bones++; });
console.log('meshes:', meshes, ' bones:', bones);

// The FBX ships a stray AmbientLight the exporter can't represent. Drop all
// non-geometry scene furniture before export.
for (const child of [...group.children]) {
    if (child.isLight || child.isCamera) {
        console.log('removing', child.type);
        group.remove(child);
    }
}

// Drop texture refs so the exporter never reaches for canvas/image encoding.
const TEX = ['map','emissiveMap','normalMap','specularMap','aoMap','roughnessMap','metalnessMap','alphaMap'];
group.traverse(o => {
    if (!o.isMesh) return;
    (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
        if (m) TEX.forEach(k => { if (m[k]) m[k] = null; });
    });
});

new GLTFExporter().parse(
    group,
    (result) => {
        fs.writeFileSync(OUT, Buffer.from(result));
        const mb = (n) => (n / 1048576).toFixed(2);
        console.log(`\nFBX  ${mb(fs.statSync(IN).size)} MB  ->  GLB  ${mb(fs.statSync(OUT).size)} MB`);
    },
    (err) => { console.error('EXPORT FAILED:', err); process.exit(1); },
    { binary: true, animations: group.animations, onlyVisible: false }
);
