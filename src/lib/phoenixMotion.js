/**
 * How the phoenix moves. Every feel-constant lives here.
 *
 * All damping uses lambda in an exponential decay: higher = snappier, lower =
 * floatier. Roughly, the value reaches 95% of its target in 3/lambda seconds.
 * So lambda 2 ≈ 1.5s to settle, lambda 6 ≈ 0.5s.
 *
 * Override any of these live with a URL param for tuning, e.g.
 *   ?follow=4  ?bank=1.4  ?look=0.7  ?feather=0.08
 *
 * Everything is hot-reloadable — edit, save, watch.
 */

const num = (name, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const v = parseFloat(new URLSearchParams(window.location.search).get(name));
    return Number.isFinite(v) ? v : fallback;
};

export const MOTION = {
    /* ---- following its own route -------------------------------------- */
    /** How hard the bird chases usePhoenixAutopilot's target point on the
     *  curve. Was 2.2, which read as laggy — the bird arrived long after the
     *  target moved on. 3.4 keeps the sense of flying-to-a-place without the
     *  rubber band. */
    follow: num('follow', 3.4),

    /** How fast it turns to face its direction of travel.
     *  Too high looks robotic; too low and it flies sideways through corners. */
    heading: num('heading', 5.0),

    /* ---- banking ---------------------------------------------------- */
    /** Multiplier on path curvature before clamping. Raise to make turns
     *  read harder. Was 6 with a 0.55 ceiling, which was nearly invisible. */
    bankGain: num('bankgain', 9.0),
    /** Maximum roll in radians (0.75 ≈ 43°). */
    bankMax: num('bank', 0.75),
    /** How quickly roll settles. Low values give the anticipation birds have. */
    bankDamp: num('bankdamp', 2.8),

    /* ---- head tracking ---------------------------------------------- */
    /** Max head yaw / pitch in radians. */
    lookYaw: num('look', 0.55),
    lookPitch: num('lookpitch', 0.30),
    /** Responsiveness of the gaze. Higher feels alert, lower feels dreamy.
     *  Above ~8 it starts to look twitchy rather than alive. */
    lookDamp: num('lookdamp', 5.5),

    /* ---- feathers ---------------------------------------------------- */
    /** Per-bone sweep in radians; compounds down each chain (max depth 6). */
    featherSweep: num('feather', 0.06),
    /** How fast the trail catches up. Lower = heavier, more drag. */
    featherDamp: num('featherdamp', 5.0),

    /* ---- wings ------------------------------------------------------- */
    /** Per-bone tuck in radians, compounded along the 10-bone wing chain. */
    wingTuck: num('wing', 0.055),

    /* ---- arrival ------------------------------------------------------ */
    /** Seconds for the awakening sequence before scroll takes over. */
    arrivalDuration: num('arrival', 4.2),

    /* ---- autonomous wander -------------------------------------------- */
    /** Units of drift layered on top of usePhoenixAutopilot's target, once
     *  arrival has finished. The autopilot already frees the bird from
     *  scroll; this is what stops it reading as a train on rails even against
     *  its OWN route — the exact position it occupies along the curve keeps
     *  breathing on its own too. Set to 0 to pin it back to the bare path,
     *  e.g. for a screenshot. */
    /* Lowered from 1.6: stacked on top of the loop's own depth changes, that
       much drift stopped reading as "alive" and started reading as the bird
       losing the plot and sliding off somewhere. 0.9 keeps the path from
       feeling like a rail without fighting it. */
    wanderAmp: num('wander', 0.9),
};
