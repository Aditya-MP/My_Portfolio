import * as THREE from 'three';

/**
 * The phoenix's route through the page.
 *
 * Five sections, six waypoints, therefore five curve segments — and the
 * arithmetic makes section boundaries land exactly on waypoints.
 *
 * CatmullRomCurve3.getPoint(u) maps u to `u * (points.length - 1)`, so with six
 * points a section occupying u ∈ [i/5, (i+1)/5] gets precisely segment i. That
 * is why story progress is (sectionIndex + localProgress) / 5, and why this
 * uses getPoint() and never getPointAt() — arc-length reparameterisation would
 * break the alignment and the bird would dive in the wrong section.
 *
 * Beat parameters live in ./story.js, which imports no three at all so the
 * scroll tracker can read the section list without pulling WebGL into the
 * main bundle.
 */

/** The model faces +X — measured from the rig (head minus pelvis), not assumed. */
export const MODEL_FORWARD = new THREE.Vector3(1, 0, 0);

/**
 * Minus the mesh's bounding-box centre, in model units. Applied to an inner
 * group so the bird sits ON its group origin; without it every waypoint would
 * be off by ~5.5 units left and 5.2 up once scaled.
 */
export const MODEL_CENTER = [273.8, -262.5, -0.6];

const WAYPOINTS = [
    /* Waypoint 0 is a real hero composition, not a distant staging point.
       The entrance is handled by the arrival offset in usePhoenixFlight, so a
       visitor sitting at scroll 0 should already see the bird properly placed
       rather than a speck 40 units away. */
    [14, 7, -10],  // 0 · HERO — arrives here
    [11, 6, -7],   // 1 · HERO — settles closer as you begin to scroll
    /* z=-6 put this only 32 units from camera, where the bird rendered large
       enough to sit on top of the Projects heading and lede. Pushed back and
       further left: still the closest approach of the flight, but it now
       frames the copy instead of covering it. */
    [-13, 1, -13], // 2 · ABOUT — closest approach, to the left
    [11, -8, -14], // 3 · PROJECTS — dives right and down
    [-8, 10, -18], // 4 · ACHIEVEMENTS — climbs left and up
    [1, 2, -10],   // 5 · CONTACT — settles near centre
];

export const curve = new THREE.CatmullRomCurve3(
    WAYPOINTS.map((p) => new THREE.Vector3(...p)),
    false,
    'catmullrom',
    0.4, // low tension: long gliding arcs rather than tight corners
);
