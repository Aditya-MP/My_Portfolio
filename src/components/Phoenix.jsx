import { useLoader } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import * as THREE from 'three';
import { usePhoenixLife } from '../hooks/usePhoenixLife';
import { usePhoenixFlight } from '../hooks/usePhoenixFlight';
import { MATERIAL } from '../lib/phoenixLook';
import { MODEL_CENTER } from '../lib/flightPath';

const MODEL = '/models/phoenix/phoenix.opt.glb';
const TEX = [
    '/models/phoenix/Tex_Ride_FengHuang_01a_D_A.tga.webp',
    '/models/phoenix/Tex_Ride_FengHuang_01a_E.tga.webp',
    '/models/phoenix/Tex_Ride_FengHuang_01b_D_A.tga.webp',
    '/models/phoenix/Tex_Ride_FengHuang_01b_E.tga.webp',
];

// meshopt-compressed GLB: draco off, meshopt on. drei bundles the decoder.
useGLTF.preload(MODEL, false, true);

export default function Phoenix({
    // Measured: the bird occupied ~12% of the frame at 0.016 and read as a
    // background detail rather than the guide. 0.021 gives it presence without
    // crowding the copy.
    scale = 0.021,
    onLoaded,
    progress,          // MotionValue 0-1: story position along the flight path
    positionRef,       // Vector3 the flight hook publishes to, for the ember trail
    arrivalRef,        // 0-1 awakening progress; see useArrival
    life = true,       // procedural bone motion; disable with ?nolife
    flight = true,     // path following; disable with ?noflight
}) {
    const group = useRef();
    const applied = useRef(false);
    const reducedMotion = useReducedMotion();

    const [colorA, emissA, colorB, emissB] = useLoader(THREE.TextureLoader, TEX);

    /* The GLB carries geometry, the 88-bone skeleton and the single "Take 001"
       clip. Textures were deliberately left out of the file and are wired up
       here, so the two source materials must stay distinguishable by name. */
    const { scene, animations } = useGLTF(MODEL, false, true);
    const { actions, names } = useAnimations(animations, group);

    /* Colour space is a property of how we consume these textures, not of the
       loader's cached object — derive corrected clones rather than mutating
       what the hook returned. */
    const maps = useMemo(() => {
        /* No flipY override: the FBX→glTF round-trip was verified byte-identical
           on TEXCOORD_0, so these textures keep TextureLoader's default. */
        const srgb = (t) => {
            const c = t.clone();
            c.colorSpace = THREE.SRGBColorSpace;
            c.needsUpdate = true;
            return c;
        };
        return { colorA: srgb(colorA), colorB: srgb(colorB), emissA, emissB };
    }, [colorA, colorB, emissA, emissB]);

    useEffect(() => {
        if (applied.current) return;

        scene.traverse((child) => {
            if (!child.isMesh) return;

            const name = (child.material?.name || child.name || '').toLowerCase();
            const useB = name.includes('01b');

            /* ALPHA CUTOUT, NOT BLENDING — this is what stops chunks of the
               bird vanishing.

               The whole phoenix is ONE mesh of two primitives: body, wings and
               tail all live inside the same two draw calls. With
               `transparent: true` three.js puts them in the transparent queue,
               which sorts back-to-front PER OBJECT — and with only two objects
               spanning the entire bird, that sort can't order anything
               correctly. Inside a primitive triangles just render in buffer
               order, and since depthWrite stays on, a near-camera feather
               drawn early writes depth and depth-rejects the body drawn later.
               Whole sections disappear, and which sections depends on the
               viewing angle — which is exactly why it looked fine from some
               points of the flight and gutted from others.

               Alpha-testing in the OPAQUE pass removes the failure mode
               rather than tuning it: fragments below the threshold are
               discarded outright, everything else is depth-tested per
               fragment, and sorting never enters into it. Same technique
               engines use for foliage and hair cards, which is what these
               feather planes are.

               alphaTest is 0.5 (not the old 0.05): with blending gone, a low
               threshold keeps the texture's near-invisible fringe as opaque
               pixels and haloes every feather. DoubleSide stays — the
               feathers are flat cards and need both faces. */
            child.material = new THREE.MeshStandardMaterial({
                map: useB ? maps.colorB : maps.colorA,
                emissiveMap: useB ? maps.emissB : maps.emissA,
                emissive: new THREE.Color(MATERIAL.emissiveColor),
                emissiveIntensity: MATERIAL.emissiveIntensity,
                roughness: MATERIAL.roughness,
                metalness: MATERIAL.metalness,
                envMapIntensity: MATERIAL.envMapIntensity,
                transparent: false,
                alphaTest: 0.5,
                side: THREE.DoubleSide,
            });
            child.frustumCulled = false;
        });

        applied.current = true;
        onLoaded?.();
    }, [scene, maps, onLoaded]);

    // Held in a ref, not state: the running action is only ever read inside the
    // frame loop, and setState here would cascade a render every time it changed.
    const actionRef = useRef(null);

    useEffect(() => {
        if (!names.length) return;
        const a = actions[names[0]];
        if (!a) return;
        a.reset().fadeIn(0.5).play();
        a.setLoop(THREE.LoopRepeat, Infinity);
        actionRef.current = a;
        return () => {
            a.fadeOut(0.5);
            actionRef.current = null;
        };
    }, [actions, names]);

    /* Whole-body transform: where it is, where it points, how hard it banks. */
    usePhoenixFlight({
        groupRef: group,
        progress,
        actionRef,
        positionRef,
        arrivalRef,
        enabled: flight && !reducedMotion,
    });

    /* Bones only: head tracking, feather lag, gaze roll. */
    usePhoenixLife({
        scene,
        progress,
        enabled: life && !reducedMotion,
    });

    /* Two groups on purpose.
       The outer one is what the flight path drives. The inner one shifts the
       mesh by minus its own bounding-box centre (measured, in model units) so
       the bird sits ON its group origin — otherwise every waypoint would be
       offset by ~5.5 units left and 5.2 up and the path would not mean what it
       says. The offset is expressed pre-scale, so the outer scale applies to it. */
    return (
        <group ref={group} scale={scale}>
            <group position={MODEL_CENTER}>
                <primitive object={scene} />
            </group>
        </group>
    );
}
