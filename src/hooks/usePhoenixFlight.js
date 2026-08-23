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
const _wander = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _zAxis = new THREE.Vector3();
const _basis = new THREE.Matrix4();
const _qHeading = new THREE.Quaternion();
const _qRoll = new THREE.Quaternion();

/** Reference for "which way is up" when orienting the bird — see the heading
 *  block below for why an explicit up vector is load-bearing. */
const WORLD_UP = new THREE.Vector3(0, 1, 0);
/** Only used if the bird is flying exactly vertically, where WORLD_UP is
 *  parallel to the tangent and their cross product collapses to zero. */
const FALLBACK_UP = new THREE.Vector3(0, 0, 1);

const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);
/** u wraps at 1 now that the curve is closed (see flightPath.js). */
const wrap1 = (v) => ((v % 1) + 1) % 1;

/** Where the bird parks when motion is suppressed — the hero beat. */
const REST_U = 0.16;

/**
 * Three sums-of-sines per axis, at incommensurate frequencies — cheap fake
 * Perlin noise, smooth and never-repeating on any timescale a visitor sits
 * through. This is layered ON TOP of the path position, never fed back into
 * `u`, so it can't drag the bird off its story beats: usePhoenixAutopilot
 * still decides WHERE in the story it is, this only decides how it occupies
 * that moment.
 */
function wander(t, out) {
    out.x = Math.sin(t * 0.21) * 1.0 + Math.sin(t * 0.53 + 1.3) * 0.45;
    out.y = Math.sin(t * 0.17 + 2.1) * 0.8 + Math.sin(t * 0.44 + 0.4) * 0.4;
    out.z = Math.sin(t * 0.13 + 4.2) * 0.7 + Math.sin(t * 0.31 + 3.0) * 0.3;
    return out;
}

/**
 * Upright orientation for a bird travelling along `tangent`, written into
 * `out`.
 *
 * Built from an explicit basis rather than THREE's setFromUnitVectors, which
 * returns the minimal-arc rotation from the model's forward axis to the
 * tangent. That is one arbitrary pick out of a whole family of rotations that
 * all point the nose correctly, because nothing in it constrains ROLL —
 * "nose along the tangent" is satisfied equally by an upright bird and an
 * inverted one. Across a loop that climbs, dives and turns, the minimal-arc
 * answer quietly rolls the bird onto its side and through upside-down. That
 * was the "flying inverse / broke physics" behaviour, and reshaping the curve
 * never fixed it — it only changed which wrong orientations came out.
 *
 * Pinning an up vector removes the ambiguity: forward comes from the path, up
 * comes from the world, the third axis follows. The bird is then upright BY
 * CONSTRUCTION everywhere on the loop, and the only roll it ever carries is
 * the bank deliberately applied by the caller.
 */
function headingFor(tangent, out) {
    // right = worldUp × forward; degenerate only if forward is vertical.
    _right.crossVectors(WORLD_UP, tangent);
    if (_right.lengthSq() < 1e-6) _right.crossVectors(FALLBACK_UP, tangent);
    _right.normalize();
    _up.crossVectors(tangent, _right).normalize();

    /* Columns map the MODEL's axes onto world axes. The model faces +X
       (MODEL_FORWARD) with +Y up, so X→forward and Y→up; the Z column is
       cross(forward, up), which works out to -right for a right-handed basis. */
    _zAxis.copy(_right).negate();
    _basis.makeBasis(tangent, _up, _zAxis);
    return out.setFromRotationMatrix(_basis);
}

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
            // Same upright basis as the live path below — a parked bird has no
            // reason to be the one pose that can come out rolled.
            g.quaternion.copy(headingFor(_tan, _qHeading));
            if (positionRef?.current) positionRef.current.copy(_pos);
            return;
        }

        const target = progress?.get?.();
        if (!Number.isFinite(target)) return;

        // Ease toward the target rather than snapping — the bird should feel
        // like it is flying to a place, not teleporting to one. Chased as the
        // shortest arc AROUND THE LOOP (not the shortest distance in raw
        // parameter space): target wraps from ~1 back to ~0 every lap, and
        // without this correction that reads as "jump backward across the
        // entire circuit" instead of the one small forward step across the
        // seam that it actually is.
        let arc = target - st.current.u;
        arc -= Math.round(arc);
        st.current.u = wrap1(st.current.u + arc * (1 - Math.exp(-MOTION.follow * dt)));
        const u = st.current.u;

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
        } else if (MOTION.wanderAmp > 0) {
            // Only once the arrival stage has fully released the bird — the
            // scripted entrance stays clean, wandering starts after.
            // Attentive beats (AWARENESS, REST) wander more than a focused
            // DESCENT: the drift reads as the bird's own mood, not noise.
            const amp = MOTION.wanderAmp * (0.35 + 0.65 * beat.look);
            wander(state.clock.elapsedTime, _wander);
            _pos.x += _wander.x * amp;
            _pos.y += _wander.y * amp;
            _pos.z += _wander.z * amp;
        }

        if (Number.isFinite(_pos.x + _pos.y + _pos.z)) {
            g.position.copy(_pos);
            // Published for the ember trail, which spawns sparks at the bird.
            if (positionRef?.current) positionRef.current.copy(_pos);
        }

        /* ---- heading ------------------------------------------------- */
        curve.getTangent(u, _tan).normalize();
        headingFor(_tan, _qHeading);

        /* ---- banking ------------------------------------------------- */
        // Curvature from a look-ahead sample, not a frame-to-frame delta, so
        // the roll is identical at 30fps and 144fps. Birds bank into a turn
        // slightly before it, which the look-ahead gives for free. Wrapped,
        // not clamped: the loop's seam is a real curve segment like any
        // other, and clamping would flatten the bank right where it needs to
        // read the turn back into the first waypoint.
        curve.getTangent(wrap1(u + 0.03), _ahead).normalize();
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
