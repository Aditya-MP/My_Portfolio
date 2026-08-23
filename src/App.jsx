import { ArrowUp, Github, Linkedin, Mail } from 'lucide-react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Section from './components/Section';
import AmbientToggle from './components/ui/AmbientToggle';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PhoenixStage from './components/PhoenixStage';
import MysticWorld from './components/MysticWorld';
import WandCursor from './components/ui/WandCursor';
import { profile } from './profile';

function App() {
  return (
    /* No background on this wrapper: body paints the ground, MysticWorld (the
       castle) and PhoenixStage (the WebGL canvas) both sit at z-0 — in that
       DOM order, so the canvas's transparent clear colour lets the skyline
       show through — and the content stacks above both at z-10. An opaque
       wrapper here would hide the phoenix and the keep completely. */
    <div className="relative min-h-screen text-ink-100">
      <a
        href="#about"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]
                   focus:px-5 focus:py-3 focus:rounded-xl focus:bg-ember-500 focus:text-ink-950 focus:font-bold"
      >
        Skip to content
      </a>

      <MysticWorld />
      <PhoenixStage />
      <WandCursor />

      <Navbar />
      <AmbientToggle />

      {/* Each section is isolated: a crash in one shows its error in place
          instead of unmounting the tree and leaving a black page.

          Section backgrounds are translucent rather than solid — the cards
          inside already carry their own contrast, so the bird stays visible in
          the gutters instead of being walled off behind an opaque panel. */}
      <main className="relative z-10">
        <ErrorBoundary label="Hero"><Hero /></ErrorBoundary>

        <Section id="about" className="bg-ink-950/65 border-y border-white/[0.05]">
          <ErrorBoundary label="About"><About /></ErrorBoundary>
        </Section>

        <Section id="projects" bare>
          <ErrorBoundary label="Projects"><Projects /></ErrorBoundary>
        </Section>

        <Section id="achievements" className="bg-ink-950/65 border-y border-white/[0.05]">
          <ErrorBoundary label="Achievements"><Achievements /></ErrorBoundary>
        </Section>

        <Section id="contact">
          <ErrorBoundary label="Contact"><Contact /></ErrorBoundary>
        </Section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.06] bg-ink-950">
        <div className="container-page py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="font-heading text-title-3 text-ink-100">{profile.name}</p>
            <p className="text-body-sm text-ink-500 mt-1">
              © {new Date().getFullYear()} · Built with React, Three.js &amp; Tailwind
            </p>
          </div>

          <div className="flex items-center gap-3">
            {[
              { Icon: Github, href: profile.github, label: 'GitHub' },
              { Icon: Linkedin, href: profile.linkedin, label: 'LinkedIn' },
              { Icon: Mail, href: `mailto:${profile.email}`, label: 'Email' },
            ].map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('mailto:') ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-label={label}
                className="btn-icon w-11 h-11"
              >
                <Icon size={17} aria-hidden="true" />
              </a>
            ))}
            <a href="#home" aria-label="Back to top" className="btn-icon w-11 h-11">
              <ArrowUp size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
