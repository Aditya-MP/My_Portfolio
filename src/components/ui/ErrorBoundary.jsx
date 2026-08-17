import { Component } from 'react';

/**
 * Renders a crash instead of swallowing it.
 *
 * Without this, an uncaught render error unmounts the whole React tree and the
 * page simply goes black against the near-black body background — which looks
 * identical to "content is invisible" and tells you nothing. This puts the
 * actual message on screen.
 */
export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null, info: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        this.setState({ info });
        // Keep the full trace in the console too.
        console.error(`[${this.props.label ?? 'app'}] crashed:`, error, info);
    }

    render() {
        const { error, info } = this.state;
        if (!error) return this.props.children;

        if (this.props.silent) {
            // Non-fatal to the page, but it must still say WHAT broke — a bare
            // "failed to load" is exactly as useless as a blank screen.
            return (
                <div className="absolute inset-0 flex items-start justify-center overflow-auto p-6">
                    <div className="mt-24 w-full max-w-2xl surface p-5 text-left">
                        <p className="eyebrow mb-3">{this.props.label ?? 'Scene'} failed</p>
                        <p className="text-body font-semibold text-ember-300 mb-3">
                            {error.name}: {error.message}
                        </p>
                        <pre className="max-h-64 overflow-auto rounded-lg bg-black/50 p-3 text-body-sm text-ink-400 whitespace-pre-wrap">
{error.stack}
                        </pre>
                    </div>
                </div>
            );
        }

        return (
            <div
                role="alert"
                className="fixed inset-0 z-[999] overflow-auto bg-ink-950 p-6 md:p-10"
            >
                <div className="mx-auto max-w-3xl surface p-6 md:p-8">
                    <p className="eyebrow mb-4">Runtime error · {this.props.label ?? 'app'}</p>
                    <h1 className="text-title-2 text-ink-50 mb-4">{error.name}: {error.message}</h1>
                    <pre className="overflow-x-auto rounded-xl bg-black/50 p-4 text-body-sm text-ink-300 whitespace-pre-wrap">
{error.stack}
                    </pre>
                    {info?.componentStack && (
                        <>
                            <p className="text-meta uppercase text-ink-500 mt-6 mb-2">Component stack</p>
                            <pre className="overflow-x-auto rounded-xl bg-black/50 p-4 text-body-sm text-ink-400 whitespace-pre-wrap">
{info.componentStack}
                            </pre>
                        </>
                    )}
                </div>
            </div>
        );
    }
}
