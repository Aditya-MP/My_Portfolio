import { lazy, Suspense, useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useStoryProgress } from '../hooks/useStoryProgress';
import { useArrival } from '../hooks/useArrival';
import { SECTION_IDS } from '../lib/story';
import ErrorBoundary from './ui/ErrorBoundary';

// three / drei / postprocessing sit behind this boundary and are fetched only
// after the page has painted, keeping ~1 MB of WebGL off the critical path.
const PhoenixScene = lazy(() => import('./PhoenixScene'));

/**
 * The first ember.
 *
 * Deliberately not a spinner with "Loading 3D scene…" — that was a progress
 * indicator sitting in the middle of the awakening. The brief opens on darkness
 * and a single ember, so the wait IS the first beat rather than an apology for
 * it. Nothing here announces that anything is loading; if WebGL never arrives,
 * a visitor simply saw an ember and read the page.
 */
function FirstEmber() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember-400 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember-300 shadow-[0_0_14px_4px_rgba(249,106,27,0.45)]" />
            </span>
        </div>
    );
}

/**
 * The phoenix's stage: one fixed canvas behind the entire page.
 *
 * ONE canvas, never one per section — multiple WebGL contexts is the standard
 * way these builds fall over. The DOM keeps scrolling normally on top; the
 * scene only ever reads scroll progress.
 *
 * pointer-events-none is what lets it span the whole page without swallowing
 * clicks. usePhoenixLife therefore reads the pointer from window rather than
 * from R3F, which would otherwise never see a pointermove.
 */
export default function PhoenixStage() {
    const reduce = useReducedMotion();
    const progress = useStoryProgress(SECTION_IDS);
    const { progress: arrivalRef } = useArrival();
    const [loaded, setLoaded] = useState(false);
    const [visible, setVisible] = useState(true);

    // Don't burn GPU on a tab nobody is looking at.
    useEffect(() => {
        const onVis = () => setVisible(!document.hidden);
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, []);

    return (
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
            {!loaded && <FirstEmber />}
            {visible && (
                <ErrorBoundary label="3D scene" silent>
                    <Suspense fallback={null}>
                        <PhoenixScene
                            progress={progress}
                            arrivalRef={arrivalRef}
                            reduce={reduce}
                            onLoaded={() => setLoaded(true)}
                        />
                    </Suspense>
                </ErrorBoundary>
            )}
        </div>
    );
}
