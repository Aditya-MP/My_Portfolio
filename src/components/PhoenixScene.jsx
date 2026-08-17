import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Stars, AdaptiveDpr, AdaptiveEvents, Environment, Lightformer } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import Phoenix from './Phoenix';
import EmberTrail from './EmberTrail';
import { LIGHTS, BLOOM } from '../lib/phoenixLook';

/**
 * The whole WebGL scene. Kept in its own module so it can be code-split — every
 * heavy import (three, drei, postprocessing, the loaders) is reachable only
 * from here, so the page paints without waiting on WebGL.
 *
 * There are no OrbitControls: this canvas is a background spanning the entire
 * page, and a background you can drag is a background that eats scrolls.
 *
 * Lighting and surface constants live in lib/phoenixLook.js — they are one
 * coupled system and must be tuned together.
 */

/**
 * Post-processing, deferred until the WebGL context is provably alive.
 * postprocessing's addPass() reads getContext().getContextAttributes().alpha,
 * and getContextAttributes() returns null on a disposed context.
 *
 * Also owns the awakening flare: a brief bloom surge the instant the phoenix
 * substantially resolves out of the dark, decaying back to the baseline rig.
 * This is the "epic reveal" beat — the moment the intro reads as a title
 * card lighting up, not just a bird fading into a page. It fires once, is
 * driven by real elapsed time rather than the eased arrival curve (so it
 * lands the same regardless of ?arrival= overrides), and is skipped entirely
 * under reduced motion — a light surge is exactly the kind of thing that
 * spec asks to suppress.
 */
function Post({ arrivalRef, reduce }) {
    const gl = useThree((s) => s.gl);
    const [ready, setReady] = useState(false);
    const bloomRef = useRef(null);
    // Callback ref, not an object ref. @react-three/postprocessing's wrapEffect
    // memoises its args on JSON.stringify(props), and an object ref left
    // unstripped in props means that stringify eventually runs against the
    // live BloomEffect instance once mounted — which contains circular
    // internal references (its own resolution object references itself) and
    // throws. A function ref serialises to nothing under JSON.stringify, so
    // it never trips that memo.
    const setBloomRef = useRef((node) => { bloomRef.current = node; }).current;
    const flare = useRef({ armed: !reduce, t: 0 });

    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            const ctx = gl.getContext?.();
            if (ctx && ctx.getContextAttributes?.()) setReady(true);
        });
        return () => {
            cancelAnimationFrame(raf);
            setReady(false);
        };
    }, [gl]);

    useFrame((_, delta) => {
        const b = bloomRef.current;
        if (!b) return;

        if (reduce) {
            b.intensity = BLOOM.intensity;
            return;
        }

        const f = flare.current;
        const a = arrivalRef?.current ?? 1;

        // Trigger once the bird is more than half resolved into view —
        // arrival's easing is heavily front-loaded, so this lands close to
        // where it visually reads as "arrived" rather than at the tail of
        // the (much longer) settle.
        if (f.armed && a > 0.5) {
            f.armed = false;
            f.t = 0.0001;
        }
        if (f.t > 0) f.t += delta;

        // Bell curve over ~1.6s: fast rise, slower settle. Capped well under
        // what would blow the bird out — see the headroom note in
        // phoenixLook.js.
        const surge = f.t > 0
            ? Math.max(0, Math.sin(Math.min(1, f.t / 1.6) * Math.PI)) * 0.85
            : 0;

        b.intensity = BLOOM.intensity + surge;
    });

    if (!ready) return null;

    return (
        <EffectComposer disableNormalPass>
            <Bloom
                ref={setBloomRef}
                luminanceThreshold={BLOOM.luminanceThreshold}
                intensity={BLOOM.intensity}
                levels={BLOOM.levels}
                mipmapBlur={false}
            />
        </EffectComposer>
    );
}

/**
 * Dev switches — append to the URL to isolate a subsystem without editing code.
 *
 *   ?nolife    turn off procedural bone motion
 *   ?noflight  park the bird instead of flying the path
 *   ?classic   original half-metallic shading + brighter rig
 *   ?env=0.4   override image-based light intensity
 *   ?nobloom   drop post-processing
 *   ?noenv     drop the environment map
 *   ?nostars   drop the starfield
 */
const flag = (name) =>
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has(name);

export default function PhoenixScene({ progress, arrivalRef, reduce, onLoaded }) {
    // The flight hook publishes the bird's live position here; the ember trail
    // reads it to spawn sparks. A shared Vector3 avoids re-rendering either.
    const phoenixPos = useRef(new THREE.Vector3());

    /* Mobile gets a genuinely reduced scene, not the same scene smaller.
       Fill rate is the constraint on a phone, so the two things that cost the
       most per pixel go first: device pixel ratio and the full-screen bloom
       pass. Same story, a fraction of the work. */
    const tier = useMemo(() => {
        const small = typeof window !== 'undefined' && window.innerWidth < 768;
        return {
            small,
            dpr: small ? [1, 1] : [1, 1.5],
            embers: small ? 55 : 160,
            stars: small ? 700 : 2200,
            bloom: !small,
        };
    }, []);

    return (
        <Canvas
            camera={{ position: [0, 0, 26], fov: 50 }}
            dpr={tier.dpr}
            performance={{ min: 0.5 }}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />

            <ambientLight intensity={LIGHTS.ambient} />
            <directionalLight position={[5, 10, 5]} intensity={LIGHTS.key} color={LIGHTS.keyColor} />
            <pointLight position={[-5, -5, -5]} intensity={LIGHTS.emberBack} color="#DB520B" />
            <pointLight position={[3, 3, 3]} intensity={LIGHTS.emberKey} color="#FF8340" />
            <pointLight position={[0, -3, 5]} intensity={LIGHTS.emberFill} color="#F96A1B" />

            {/* Procedural environment instead of preset="sunset".
                That preset downloads a 1.3 MB HDRI from a CDN — measured at 62%
                of the entire page's transfer, larger than the model, every cover
                and every font combined. This builds the same image-based light
                out of a handful of emissive rectangles: nothing to download, no
                third-party request, and it can actually be art-directed —
                warm key, ember underlight, one cool rim so the plumage isn't
                monochrome. Baked once (frames={1}) at 64px, which is ample for
                a blurry reflection.
                environmentIntensity still matters: it is what stops the bird
                blowing out to white. */}
            {!flag('noenv') && (
                <Environment
                    resolution={64}
                    frames={1}
                    environmentIntensity={LIGHTS.envIntensity}
                >
                    <mesh scale={60}>
                        <sphereGeometry args={[1, 16, 16]} />
                        <meshBasicMaterial color="#130C08" side={THREE.BackSide} />
                    </mesh>
                    <Lightformer form="rect" intensity={3.2} color="#FFC08A"
                        position={[6, 5, -3]} scale={[10, 10, 1]} target={[0, 0, 0]} />
                    <Lightformer form="circle" intensity={1.6} color="#DB520B"
                        position={[-5, -4, 2]} scale={[9, 9, 1]} target={[0, 0, 0]} />
                    <Lightformer form="rect" intensity={0.7} color="#7488B5"
                        position={[-6, 3, -6]} scale={[7, 7, 1]} target={[0, 0, 0]} />
                </Environment>
            )}

            {!flag('nostars') && (
                <Stars radius={120} depth={60} count={tier.stars} factor={4} saturation={0} fade
                    speed={reduce ? 0 : 0.6} />
            )}

            <Suspense fallback={null}>
                <Phoenix
                    progress={progress}
                    positionRef={phoenixPos}
                    arrivalRef={arrivalRef}
                    onLoaded={onLoaded}
                    life={!flag('nolife') && !reduce}
                    flight={!flag('noflight') && !reduce}
                />
            </Suspense>

            {!flag('noembers') && !reduce && (
                <EmberTrail sourceRef={phoenixPos} progress={progress} count={tier.embers} />
            )}

            {!flag('nobloom') && tier.bloom && <Post arrivalRef={arrivalRef} reduce={reduce} />}
        </Canvas>
    );
}
