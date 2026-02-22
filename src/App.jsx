import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Achievements from './components/Achievements';
import Contact from './components/Contact';
import Section from './components/Section';

function App() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white selection:bg-purple-500 selection:text-white">
      <Navbar />

      <main>
        <Hero />

        <Section id="about" className="bg-zinc-900/30">
          <About />
        </Section>

        <Section id="projects">
          <Projects />
        </Section>

        <Section id="achievements" className="bg-zinc-900/30">
          <Achievements />
        </Section>

        <Section id="contact">
          <Contact />
        </Section>
      </main>

      <footer className="py-8 text-center text-zinc-600 text-sm">
        <p>© {new Date().getFullYear()} Portfolio. Built with React & Three.js</p>
      </footer>
    </div>
  );
}

export default App;