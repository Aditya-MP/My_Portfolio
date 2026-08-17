import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { curve, MODEL_FORWARD } from '../lib/flightPath';
import { beatAt } from '../lib/story';
import { MOTION } from '../lib/phoenixMotion';

/**
 * Moves the whole bird along the flight path.
 *
 * Owns the group transform — position, heading, roll — and the wingbeat bob.
 * usePhoenixLife owns bones only; keeping the split clean avoids two hooks
 * fighting over position.y, which is what a shared bob would cause.
 *
 * Priority stays 0. Any useFrame with priority > 0 switches off R3F's automatic
 * render and hands responsibility to whoever renders manually — which produced
 * a blank canvas whenever the EffectComposer wasn't mounted.
 */

const _pos = new THREE.Vector3();
const _tan = new THREE.Vector3();
const _ahead = new THREE.Vector3();
const _qHeading = new THREE.Quaternion();
const _qRoll = new THREE.Quaternion();

const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** Where the bird parks when motion is suppressed — the hero beat. */
const REST_U = 0.16;

export function usePhoenixFlight({ groupRef, progress, actionRef, positionRef, arrivalRef, enabled = true }) {
    const st = useRef({ u: REST_U, roll: 0, started: false });

    useFrame((state, delta) => {
        const g = groupRef.current;
        if (!g) return;

        const dt = clamp(delta, 1 / 240, 0.05);

        if (!enabled) {
            curve.getPoint(REST_U, _pos);
            g.position.copy(_pos);
            curve.getTangent(REST_U, _tan).normalize();
            g.quaternion.setFromUnitVectors(MODEL_FORWARD, _tan);
            if (positionRef?.current) positionRef.current.copy(_pos);
            return;
        }

        const target = progress?.get?.();
        if (!Number.isFinite(target)) return;

        // Ease toward the target rather than snapping: the bird should feel
        // like it is flying to a place, not being dragged by the scrollbar.
        st.current.u = damp(st.current.u, target, MOTION.follow, dt);
        const u = clamp(st.current.u, 0, 1);

        /* The arrival is a positional OFFSET, not a scaling of u.
           Scaling was the obvious move and it is wrong: at the top of the page
           the scroll target is already ~0, so `target * arrival` is zero either
           way and nothing staged. Displacing the bird far up-right and deep
           into the dark, then releasing it, works from any scroll position —
           including a visitor who lands mid-page from a shared link. */
        const arrival = arrivalRef ? clamp(arrivalRef.current ?? 1, 0, 1) : 1;
        const away = 1 - arrival;
        const beat = beatAt(u);

        /* ---- position ------------------------------------------------ */
        curve.getPoint(u, _pos);

        // Rise on the downstroke: read the clip's own phase so the bob and the
        // wings stay locked instead of drifting against each other.
        const action = actionRef?.current;
        const dur = action?.getClip?.()?.duration;
        const phase = dur && Number.isFinite(action.time)
            ? ((action.time % dur) / dur) * Math.PI * 2
            : state.clock.elapsedTime * 0.8;
        _pos.y += Math.sin(phase) * 0.35;

        // Out of the dark: 40 units right, 22 up, 70 back at t=0.
        if (away > 0.001) {
            _pos.x += away * 40;
            _pos.y += away * 22;
            _pos.z -= away * 70;
        }

        if (Number.isFinite(_pos.x + _pos.y + _pos.z)) {
            g.position.copy(_pos);
            // Published for the ember trail, which spawns sparks at the bird.
            if (positionRef?.current) positionRef.current.copy(_pos);
        }

        /* ---- heading ------------------------------------------------- */
        curve.getTangent(u, _tan).normalize();
        _qHeading.setFromUnitVectors(MODEL_FORWARD, _tan);

        /* ---- banking ------------------------------------------------- */
        // Curvature from a look-ahead sample, not a frame-to-frame delta, so
        // the roll is identical at 30fps and 144fps. Birds bank into a turn
        // slightly before it, which the look-ahead gives for free.
        curve.getTangent(clamp(u + 0.03, 0, 1), _ahead).normalize();
        const turn = _tan.z * _ahead.x - _tan.x * _ahead.z; // y of (tan × ahead)
        const targetRoll = clamp(turn * MOTION.bankGain, -1, 1) * MOTION.bankMax * beat.bank;
        st.current.roll = damp(st.current.roll, targetRoll, MOTION.bankDamp, dt);

        if (Number.isFinite(st.current.roll)) {
            _qRoll.setFromAxisAngle(_tan, st.current.roll);
            _qHeading.premultiply(_qRoll);
        }

        g.quaternion.slerp(_qHeading, 1 - Math.exp(-MOTION.heading * dt));

        /* ---- wingbeat rate ------------------------------------------- */
        // Slow and wide during arrival and rest, urgent through the descent.
        // The rule can't tell this runs in the frame loop rather than during
        // render; driving an AnimationAction is imperative by design.
        // eslint-disable-next-line react-hooks/immutability
        if (action) action.timeScale = beat.speed;
    }, 0);
}
