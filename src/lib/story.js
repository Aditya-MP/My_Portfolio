/**
 * The narrative spine — deliberately free of any three.js import.
 *
 * PhoenixStage needs the section list to track scroll, but it must not drag
 * three into the main bundle to get it. Keeping this module pure keeps the
 * WebGL code entirely behind the lazy boundary (measured: importing the curve
 * here instead put ~380 KB back on the critical path).
 *
 * SIX BEATS: silence → discovery → movement → acceleration → ascension → rest.
 */

/**
 *   speed  wingbeat rate multiplier
 *   look   how strongly the head tracks the cursor (0–1)
 *   bank   how hard it rolls into turns
 *   ember  sparks shed per second
 *   wing   wing sweep: negative spreads, 0 is neutral, positive tucks
 *   jaw    beak opening, 0–1
 *
 * `wing` is what makes the beats differ in SHAPE rather than only in speed and
 * altitude — a dive with the same silhouette as a glide reads as the same bird
 * moving faster, not as a different intent.
 */
export const BEATS = [
    { id: 'home', beat: 'ARRIVAL', speed: 0.60, look: 0.25, bank: 0.7, ember: 14, wing: -0.10, jaw: 0.00 },
    { id: 'about', beat: 'AWARENESS', speed: 0.45, look: 1.00, bank: 0.5, ember: 10, wing: 0.05, jaw: 0.12 },
    { id: 'projects', beat: 'DESCENT', speed: 1.40, look: 0.30, bank: 1.3, ember: 55, wing: 0.85, jaw: 0.05 },
    { id: 'achievements', beat: 'ASCENSION', speed: 1.00, look: 0.50, bank: 1.0, ember: 44, wing: -0.30, jaw: 0.38 },
    { id: 'contact', beat: 'REST', speed: 0.35, look: 0.85, bank: 0.3, ember: 6, wing: 0.35, jaw: 0.18 },
];

export const SECTION_IDS = BEATS.map((b) => b.id);

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Blend beat parameters across a section boundary so nothing snaps. */
export function beatAt(u) {
    const p = clamp01(u) * (BEATS.length - 1);
    const i = Math.min(BEATS.length - 2, Math.floor(p));
    const f = clamp01(p - i);
    const s = f * f * (3 - 2 * f); // smoothstep
    const a = BEATS[i];
    const b = BEATS[i + 1];
    return {
        speed: a.speed + (b.speed - a.speed) * s,
        look: a.look + (b.look - a.look) * s,
        bank: a.bank + (b.bank - a.bank) * s,
        ember: a.ember + (b.ember - a.ember) * s,
        wing: a.wing + (b.wing - a.wing) * s,
        jaw: a.jaw + (b.jaw - a.jaw) * s,
    };
}
