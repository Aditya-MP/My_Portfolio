import * as THREE from 'three';

/**
 * The phoenix's route — a closed loop it patrols forever under
 * usePhoenixAutopilot, u increasing without limit and wrapping smoothly from
 * the last waypoint back into the first.
 *
 * FIRST ATTEMPT AT THIS (worth recording so it doesn't get re-tried): closing
 * the loop through the OLD six section-composition waypoints — reused as-is
 * from when this was an open, scroll-driven path — produced a visibly broken
 * flight. The reason is geometric, not a code bug: waypoints 0 and 1 were a
 * tight pair only ~4 units apart, hand-placed for a one-time arrival flourish
 * at the START of an open curve, where three.js gives the endpoint its own
 * tangent formula. Wire a closed loop through them instead and every interior
 * point's tangent becomes P[next] − P[prev] — which for that pair, with
 * waypoint 0 sitting far out on its own (x=14 while the rest of the loop
 * spans roughly x ∈ [-13, 11]), works out to two adjacent points whose
 * tangents point almost exactly opposite each other. The curve is still
 * mathematically continuous, but it whips through a ~170° near-reversal in a
 * ~4-unit stretch — which is what actually read as the bird "flying inverse,
 * no physics": not a heading-flip bug this time, a genuinely kinked path.
 *
 * The fix is a loop actually designed as a loop: six points sampled at even
 * 60° steps around a tilted 3D ellipse (see the generation below). Evenly
 * spaced samples of a smooth periodic curve can't produce a sharp corner
 * anywhere, including at the seam — there's no "outlier" point for a closed
 * Catmull-Rom to lurch toward or away from.
 *
 * Beat parameters live in ./story.js, which imports no three at all so
 * MysticWorld's scroll tracker can read the section list without pulling
 * WebGL into the main bundle. The beat sequence (arrival → awareness →
 * descent → ascension → rest) no longer has to spatially line up with any
 * particular point on this loop — usePhoenixAutopilot drives both off the
 * same clock, but the loop's shape and the beat's mood are independent now
 * that neither is pinned to scroll or to DOM sections.
 */

/** The model faces +X — measured from the rig (head minus pelvis), not assumed. */
export const MODEL_FORWARD = new THREE.Vector3(1, 0, 0);

/**
 * Minus the mesh's bounding-box centre, in model units. Applied to an inner
 * group so the bird sits ON its group origin; without it every waypoint would
 * be off by ~5.5 units left and 5.2 up once scaled.
 */
export const MODEL_CENTER = [273.8, -262.5, -0.6];

/**
 * A "flyby," not a flat ellipse. The first closed loop (a tidy ellipse, even
 * angular spacing) was smooth and fixed the flip bug, but every point on an
 * ellipse moves TANGENTIALLY to the camera — even at its closest approach,
 * the velocity there is sideways, because that's what closest-approach means
 * on an orbit. It never once reads as heading AT the viewer, only past them.
 *
 * These six points are hand-placed instead of generated, shaped like a
 * boomerang in the x/z plane: in from the right, through a NEAR pass centred
 * and close at z≈-5, back out to the left, then behind and low to swing
 * around onto the right-hand approach again.
 *
 * SIZED TO THE SCREEN. An earlier version of this shape ran x=±11, y=-1..5,
 * which kept the bird hovering around the middle of the frame — it read as
 * circling one spot rather than owning the view. These figures reach 82% of
 * the half-width and 73% of the half-height at the camera's framing, so the
 * loop sweeps corner to corner while still keeping the bird clear of the
 * edges at every point (a path that touches 100% would clip it in and out of
 * frame every lap).
 *
 * Depth is held to a 1.52 ratio (31 → 47 units from the camera at z=26): far
 * enough that the NEAR pass genuinely grows toward the viewer, close enough
 * that the far side never shrinks to a speck. An early attempt at z=-28 did,
 * and read as the bird wandering off.
 *
 * Verified with a standalone script before committing: control-segment
 * lengths 11.9–18.5 (ratio 1.55 — no repeat of the ~4-vs-25 imbalance that
 * broke the first closed loop), max tangent turn between adjacent samples
 * 1.8° anywhere including the seam, and the steepest climb/dive is 49.8°.
 * That last figure is the one to watch when editing these: the heading basis
 * in usePhoenixFlight resolves roll against world-up, which degenerates only
 * if the path ever points straight up or down, so the pitch must stay clearly
 * short of 90°.
 */
const WAYPOINTS = [
    [25, 8, -15],   // far right, high — the loop-around resets onto here
    [15, 1, -9],    // closing in from the right, descending
    [0, -9, -5],    // NEAR — the pass: centred, low, closest to the viewer
    [-15, 1, -9],   // peeling away left, climbing back out
    [-25, 8, -15],  // far left, high
    [-16, 14, -20], // behind left, higher and further
    [0, 16, -21],   // top of the arc, furthest back
    [16, 14, -20],  // behind right, descending toward the reset
];

export const curve = new THREE.CatmullRomCurve3(
    WAYPOINTS.map((p) => new THREE.Vector3(...p)),
    true, // closed — see the module doc for why this matters
    'catmullrom',
    0.4, // low tension: long gliding arcs rather than tight corners
);
