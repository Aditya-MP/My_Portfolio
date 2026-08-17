import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { beatAt } from '../lib/story';
import { MOTION } from '../lib/phoenixMotion';

/**
 * Procedural secondary motion layered on top of the phoenix's single baked clip.
 *
 * The model ships exactly one animation ("Take 001", a flap loop), so every
 * behaviour beyond flapping has to be posed at runtime. This drives:
 *
 *   · head + neck turning to follow the pointer, with idle drift when it isn't moving
 *   · 48 feather bones lagging behind the body, sweeping against motion
 *   · a small gaze-driven roll on the root
 *
 * BONES ONLY. Position, heading, path banking and the wingbeat bob belong to
 * usePhoenixFlight — two hooks writing the same transform would fight.
 *
 * All bone edits are applied as WORLD-space rotations. The rig's local bone
 * axes are unknown and vary per chain, so rotating about local axes would need
 * per-bone guesswork; conjugating a world rotation into each bone's parent
 * space is axis-agnostic and behaves the same everywhere in the skeleton.
 *
 * Priority stays 0 — see the note at the useFrame call.
 */

const _pq = new THREE.Quaternion();
const _pqi = new THREE.Quaternion();
const _conj = new THREE.Quaternion();
const _R = new THREE.Quaternion();
const _e = new THREE.Euler();

/** Rotate `bone` by world-space rotation R, whatever its local axes are. */
function addWorldRotation(bone, R) {
    // A single non-finite value here corrupts the bone's matrix, which
    // propagates through skinning to every vertex it influences.
    if (!Number.isFinite(R.x + R.y + R.z + R.w)) return;

    if (!bone.parent) {
        bone.quaternion.premultiply(R);
        return;
    }
    bone.parent.getWorldQuaternion(_pq);
    // Matrix4.decompose divides by scale, so a zero-scaled ancestor yields a
    // NaN quaternion — and `NaN < 1e-8` is false, so test finiteness first.
    const len = _pq.lengthSq();
    if (!Number.isFinite(len) || len < 1e-8) return;
    _pqi.copy(_pq).invert();
    // localQ' = (parentWorld⁻¹ · R · parentWorld) · localQ
    _conj.copy(_pqi).multiply(R).multiply(_pq);
    bone.quaternion.premultiply(_conj);
}

const damp = (current, target, lambda, dt) =>
    current + (target - current) * (1 - Math.exp(-lambda * dt));

export function usePhoenixLife({
    scene,
    progress,
    enabled = true,
    lookYaw = MOTION.lookYaw,
    lookPitch = MOTION.lookPitch,
    bank = 0.10,        // gaze-driven roll; the flight path owns the main banking
    featherSweep = MOTION.featherSweep,
} = {}) {
    /* Pointer is read from the window, not from R3F's state.pointer.
       The stage canvas is pointer-events:none so it can sit behind the whole
       page without eating clicks — which also means R3F never receives
       pointermove and its own pointer would stay frozen at the origin. */
    const pointer = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const onMove = (e) => {
            pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    const bones = useMemo(() => {
        if (!scene) return null;
        const by = {};
        const feathers = [];
        scene.traverse((o) => {
            if (!o.isBone) return;
            by[o.name] = o;
            if (o.name.startsWith('B_Hair') || o.name.startsWith('B_Tail')) feathers.push(o);
        });

        // Deeper bones move more: the tip of a plume trails further than its base.
        const depthOf = (b) => {
            let d = 0, p = b.parent;
            while (p && (p.name?.startsWith('B_Hair') || p.name?.startsWith('B_Tail'))) { d++; p = p.parent; }
            return d;
        };

        /* Wings are a branching tree, not a chain: Wing_1 forks into _2 and _3,
           and Wing_9 hangs off the pelvis entirely. Depth is therefore counted
           relative to the wing hierarchy so a rotation compounds correctly out
           to whichever tip it belongs to. */
        const wingDepth = (b) => {
            let d = 0, p = b.parent;
            while (p && /_Wing_/.test(p.name || '')) { d++; p = p.parent; }
            return d;
        };
        const wings = [];
        scene.traverse((o) => {
            if (o.isBone && /_Wing_/.test(o.name)) {
                wings.push({ bone: o, depth: wingDepth(o), side: o.name.includes('Left') ? 1 : -1 });
            }
        });

        return {
            chain: ['b_Neck_0', 'b_Neck_1', 'b_Neck_2', 'b_Head'].map((n) => by[n]).filter(Boolean),
            root: by.b_Root ?? null,
            jaw: by.B_Jaw ?? null,
            wings: wings.sort((a, b) => a.depth - b.depth),
            // Sorted parent-first so a parent's edit is already in place when a child reads it.
            feathers: feathers
                .map((b) => ({ bone: b, depth: depthOf(b) }))
                .sort((a, b) => a.depth - b.depth),
        };
    }, [scene]);

    const s = useRef({
        yaw: 0, pitch: 0, roll: 0,
        driftYaw: 0, driftPitch: 0, nextDrift: 0,
        prevYaw: 0, sweep: 0, wing: 0, jaw: 0,
    });

    useFrame(({ clock }, delta) => {
        if (!enabled || !bones?.chain.length) return;

        /* dt is clamped at BOTH ends and never zero.
           R3F emits delta === 0 whenever the frameloop restarts — and Hero
           toggles frameloop on scroll via IntersectionObserver, so this fires
           in normal use. A zero dt made the yaw-rate divide 0/0 → NaN, and
           because NaN * 0 is still NaN the damp() below propagated it forever:
           every feather quaternion went NaN, the skinned mesh's vertices went
           NaN, and the whole render turned into a white smear that never
           recovered. Clamping here is the fix; the guards below are belt-and-braces. */
        const dt = Math.min(Math.max(delta, 1 / 240), 0.05);
        const st = s.current;
        const t = clock.elapsedTime;

        /* ---- where is it looking ------------------------------------- */
        // Idle drift: re-target every few seconds so it still looks alive
        // when the pointer is parked.
        if (t > st.nextDrift) {
            st.driftYaw = (Math.random() - 0.5) * 0.7;
            st.driftPitch = (Math.random() - 0.5) * 0.4;
            st.nextDrift = t + 2.5 + Math.random() * 3.5;
        }

        const u = progress?.get?.();
        const beat = Number.isFinite(u) ? beatAt(u) : null;
        // How attentive the bird is depends on where we are in the story:
        // fully aware during ABOUT, distracted mid-dive.
        const attention = beat ? beat.look : 1;

        const targetYaw = (pointer.current.x * lookYaw) * attention + st.driftYaw * 0.35;
        const targetPitch = (-pointer.current.y * lookPitch) * attention + st.driftPitch * 0.3;

        st.yaw = damp(st.yaw, targetYaw, MOTION.lookDamp, dt);
        st.pitch = damp(st.pitch, targetPitch, MOTION.lookDamp, dt);

        /* ---- head + neck --------------------------------------------- */
        // Split across the chain so the bend distributes instead of snapping
        // at one joint. Weights rise toward the head: necks contribute less each.
        const w = [0.18, 0.22, 0.26, 0.34];
        bones.chain.forEach((bone, i) => {
            _e.set(st.pitch * w[i], st.yaw * w[i], 0, 'YXZ');
            _R.setFromEuler(_e);
            addWorldRotation(bone, _R);
        });

        /* ---- bank into the look -------------------------------------- */
        // Birds roll toward where they're heading. Driving roll from gaze keeps
        // this working even while the bird is stationary.
        if (bones.root) {
            st.roll = damp(st.roll, -st.yaw * (bank / lookYaw), 3, dt);
            _e.set(0, 0, st.roll, 'YXZ');
            _R.setFromEuler(_e);
            addWorldRotation(bones.root, _R);
        }

        /* ---- feather lag --------------------------------------------- */
        // Sweep is driven by how fast the head is turning, so the plumes trail
        // the movement rather than being pinned to it.
        const yawRate = (st.yaw - st.prevYaw) / dt;
        st.prevYaw = st.yaw;
        const sweepTarget = Number.isFinite(yawRate)
            ? THREE.MathUtils.clamp(yawRate * 0.35, -1, 1)
            : 0;
        st.sweep = damp(st.sweep, sweepTarget, MOTION.featherDamp, dt);
        // Never let a poisoned value survive into the bone loop.
        if (!Number.isFinite(st.sweep)) st.sweep = 0;

        bones.feathers.forEach(({ bone, depth }, i) => {
            const scale = featherSweep * (0.35 + depth * 0.3);
            const flutter = Math.sin(t * 1.7 + i * 0.55) * 0.35;
            _e.set(flutter * scale, (-st.sweep + flutter * 0.4) * scale, 0, 'YXZ');
            _R.setFromEuler(_e);
            addWorldRotation(bone, _R);
        });

        /* ---- wing shape ---------------------------------------------- */
        /* Sweep about world Y, mirrored per side: the wingspan lies on Z, so a
           +Y rotation carries the left tip toward -X (back) and the right tip
           toward +X (forward) — hence the sign flip. Positive tucks for the
           dive, negative spreads for the climb. */
        if (beat && bones.wings.length) {
            st.wing = damp(st.wing, beat.wing, 2.5, dt);
            if (Number.isFinite(st.wing)) {
                bones.wings.forEach(({ bone, depth, side }) => {
                    const amt = st.wing * MOTION.wingTuck * (0.4 + depth * 0.25) * side;
                    _e.set(0, amt, 0, 'YXZ');
                    _R.setFromEuler(_e);
                    addWorldRotation(bone, _R);
                });
            }
        }

        /* ---- jaw ------------------------------------------------------ */
        // Opens downward (negative Z pitch for a bird facing +X), with a slow
        // breath on top so it never sits perfectly still.
        if (beat && bones.jaw) {
            const target = beat.jaw * (0.75 + 0.25 * Math.sin(t * 1.3));
            st.jaw = damp(st.jaw, target, 3, dt);
            if (Number.isFinite(st.jaw)) {
                _e.set(0, 0, -st.jaw * 0.22, 'YXZ');
                _R.setFromEuler(_e);
                addWorldRotation(bones.jaw, _R);
            }
        }

        /* The wingbeat bob lives in usePhoenixFlight — whole-body transform is
           that hook's job. Two hooks writing position.y would fight. */
    },
    /* MUST stay 0.
       R3F disables its automatic render the moment ANY useFrame registers a
       priority > 0 — at that point something else is expected to render
       manually. Using 0.5 here meant the EffectComposer was the only renderer,
       so any window where it wasn't mounted (the deferred Post mount, or
       ?nobloom) left the scene never drawn and the canvas showing uncleared
       garbage — a white screen that raced the composer's mount.
       Ordering after drei's mixer is achieved instead by subscription order:
       this hook is called after useAnimations in Phoenix.jsx, and R3F's sort
       is stable, so equal priorities keep insertion order. */
    0);
}
