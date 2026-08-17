/**
 * Phoenix look — lighting and surface, kept together on purpose.
 *
 * These two are ONE system. A metallic surface mostly reflects the environment;
 * a diffuse one sums every light in the scene. Changing metalness without
 * retuning the lights is what blew the render past white.
 *
 * Two presets. REALISTIC is the default — dielectric feather shading with the
 * rig rebalanced to match. CLASSIC is the original half-metallic look, kept as
 * a one-URL fallback.
 *
 *   default          → REALISTIC
 *   localhost/?classic → CLASSIC
 *
 * Everything here is hot-reloadable: edit, save, watch.
 */

const CLASSIC = {
    lights: {
        ambient: 1.2,
        key: 2.5,
        keyColor: '#ffffff',
        emberBack: 1.5,
        emberKey: 2.0,
        emberFill: 1.0,
        /* Image-based light from the sunset HDRI. This was the white screen:
           at drei's default of 1.0 a sunset environment is enormously bright,
           and since it lights every surface it washed the whole bird out.
           Measured mean screen luma: 168 at 1.0 vs 44 with the environment off. */
        envIntensity: 0.25,
    },
    material: {
        metalness: 0.5,
        roughness: 0.1,
        emissiveIntensity: 0.8,
        envMapIntensity: 1.0,
        emissiveColor: 0xcc9966,
    },
    bloom: { luminanceThreshold: 0.9, intensity: 0.5, levels: 3 },
};

const REALISTIC = {
    lights: {
        /* Raised back up after the sunset HDRI was replaced with a procedural
           environment. The old 0.61x figure compensated for lower metalness on
           the assumption that image-based light was still carrying part of the
           load; the procedural env is far dimmer (measured: sweeping its
           intensity 0.25 -> 3.0 moved mean screen luma by one point), so the
           direct rig has to do the work instead. Warm key for candlelight. */
        ambient: 1.15,
        key: 2.40,
        keyColor: '#FFE9D2',
        emberBack: 1.45,
        emberKey: 1.95,
        emberFill: 0.95,
        envIntensity: 1.2,
    },
    material: {
        // Feathers are keratin — dielectric. CLASSIC's 0.5/0.1 is polished
        // metal, which is why the plumage reads as plastic.
        metalness: 0.18,
        roughness: 0.45,
        // Additive; independent of the light rig, so it stays at CLASSIC's
        // value — the firebird glow was never the thing that needed changing.
        emissiveIntensity: 0.8,
        envMapIntensity: 0.8,
        emissiveColor: 0xcc9966,
    },
    bloom: { luminanceThreshold: 0.9, intensity: 0.45, levels: 3 },
};

const useClassic =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('classic');

const preset = useClassic ? CLASSIC : REALISTIC;

/** `?env=0.4` overrides the IBL intensity for quick tuning. */
const envOverride =
    typeof window !== 'undefined'
        ? parseFloat(new URLSearchParams(window.location.search).get('env'))
        : NaN;

/** `?lights=1.4` scales the whole direct rig, for sweeping brightness. */
const lightScale = (() => {
    if (typeof window === 'undefined') return 1;
    const v = parseFloat(new URLSearchParams(window.location.search).get('lights'));
    return Number.isFinite(v) && v > 0 ? v : 1;
})();

export const LIGHTS = {
    ...preset.lights,
    ambient: preset.lights.ambient * lightScale,
    key: preset.lights.key * lightScale,
    emberBack: preset.lights.emberBack * lightScale,
    emberKey: preset.lights.emberKey * lightScale,
    emberFill: preset.lights.emberFill * lightScale,
    ...(Number.isFinite(envOverride) ? { envIntensity: envOverride } : {}),
};
export const MATERIAL = preset.material;
export const BLOOM = preset.bloom;

/** If it ever blows out to white, turn these down in order:
 *  BLOOM.intensity → MATERIAL.emissiveIntensity → LIGHTS.ambient → LIGHTS.key */
