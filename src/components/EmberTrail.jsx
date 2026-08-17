import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { beatAt } from '../lib/story';

/**
 * Sparks shed from the bird as it flies.
 *
 * One <points> draw call for the whole trail — a fixed pool of particles that
 * are recycled rather than allocated, so nothing hits the GC mid-flight. The
 * shader draws a soft round falloff procedurally, which avoids shipping a
 * sprite texture for what is ultimately a blurry dot.
 *
 * Spawn rate comes from the current beat: a handful during ARRIVAL and REST,
 * a shower through the DESCENT. Falling sparks from a living firebird, not
 * fireworks — density stays low on purpose.
 */

const VERT = /* glsl */ `
    attribute float aLife;   // 1 at birth -> 0 at death
    attribute float aSize;
    varying float vLife;
    void main() {
        vLife = aLife;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (260.0 / max(0.001, -mv.z));
        gl_Position = projectionMatrix * mv;
    }
`;

const FRAG = /* glsl */ `
    uniform vec3 uHot;
    uniform vec3 uCool;
    varying float vLife;
    void main() {
        vec2 d = gl_PointCoord - 0.5;
        float r = length(d);
        if (r > 0.5) discard;
        // soft round falloff, no texture needed
        float falloff = smoothstep(0.5, 0.0, r);
        // sparks cool as they age
        vec3 col = mix(uCool, uHot, vLife);
        gl_FragColor = vec4(col, falloff * vLife * 0.85);
    }
`;

export default function EmberTrail({ sourceRef, progress, count = 160 }) {
    const geomRef = useRef(null);

    const pool = useMemo(() => ({
        position: new Float32Array(count * 3),
        life: new Float32Array(count),
        size: new Float32Array(count),
        vel: new Float32Array(count * 3),
        maxLife: new Float32Array(count),
        cursor: 0,
        carry: 0, // fractional spawns carried between frames
    }), [count]);

    const uniforms = useMemo(() => ({
        uHot: { value: new THREE.Color('#FFC06B') },
        uCool: { value: new THREE.Color('#B03D08') },
    }), []);

    /* The pool is mutated in place every frame, by design: recycling a fixed
       set of typed arrays is the whole point of a particle system, and
       reallocating 160 particles per frame would churn the GC continuously.
       The lint rule can't distinguish the frame loop from render, where this
       restriction would be correct. */
    /* eslint-disable react-hooks/immutability */
    useFrame((state, delta) => {
        const geom = geomRef.current;
        const src = sourceRef?.current;
        if (!geom || !src) return;

        const dt = Math.min(Math.max(delta, 1 / 240), 0.05);
        const u = progress?.get?.();
        const rate = Number.isFinite(u) ? beatAt(u).ember : 10;

        /* ---- spawn ---------------------------------------------------- */
        pool.carry += rate * dt;
        let spawns = Math.floor(pool.carry);
        pool.carry -= spawns;
        // A stall must not dump the whole pool in one frame.
        spawns = Math.min(spawns, 8);

        for (let s = 0; s < spawns; s++) {
            const i = pool.cursor;
            pool.cursor = (pool.cursor + 1) % count;
            const i3 = i * 3;

            // Born just behind the bird, scattered a little.
            pool.position[i3] = src.x + (Math.random() - 0.5) * 1.6;
            pool.position[i3 + 1] = src.y + (Math.random() - 0.5) * 1.2;
            pool.position[i3 + 2] = src.z + (Math.random() - 0.5) * 1.6;

            pool.vel[i3] = (Math.random() - 0.5) * 0.7;
            pool.vel[i3 + 1] = 0.35 + Math.random() * 0.8; // embers rise
            pool.vel[i3 + 2] = (Math.random() - 0.5) * 0.7;

            pool.maxLife[i] = 1.6 + Math.random() * 2.2;
            pool.life[i] = pool.maxLife[i];
            pool.size[i] = 0.9 + Math.random() * 2.2;
        }

        /* ---- integrate ------------------------------------------------ */
        const t = state.clock.elapsedTime;
        for (let i = 0; i < count; i++) {
            if (pool.life[i] <= 0) {
                pool.size[i] = 0; // dead particles draw nothing
                continue;
            }
            const i3 = i * 3;
            pool.life[i] -= dt;

            // Buoyancy plus a slow wander, so they drift rather than track straight.
            pool.vel[i3 + 1] += 0.25 * dt;
            pool.position[i3] += (pool.vel[i3] + Math.sin(t * 0.7 + i) * 0.18) * dt;
            pool.position[i3 + 1] += pool.vel[i3 + 1] * dt;
            pool.position[i3 + 2] += pool.vel[i3 + 2] * dt;
        }

        /* ---- upload --------------------------------------------------- */
        const lifeAttr = geom.getAttribute('aLife');
        for (let i = 0; i < count; i++) {
            const m = pool.maxLife[i];
            lifeAttr.array[i] = m > 0 ? Math.max(0, pool.life[i] / m) : 0;
        }
        geom.getAttribute('position').needsUpdate = true;
        geom.getAttribute('aSize').needsUpdate = true;
        lifeAttr.needsUpdate = true;
    }, 0);
    /* eslint-enable react-hooks/immutability */

    return (
        <points frustumCulled={false}>
            <bufferGeometry ref={geomRef}>
                <bufferAttribute attach="attributes-position" args={[pool.position, 3]} />
                <bufferAttribute attach="attributes-aLife" args={[pool.life, 1]} />
                <bufferAttribute attach="attributes-aSize" args={[pool.size, 1]} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={VERT}
                fragmentShader={FRAG}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
