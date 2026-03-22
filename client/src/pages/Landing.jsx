import Hero from '../components/Hero';
import FeatureShowcase from '../components/FeatureShowcase';
import HowItWorks from '../components/HowItWorks';
import StatsBar from '../components/StatsBar';
import Demo from '../components/Demo';
import TechStack from '../components/TechStack';
import Footer from '../components/Footer';

/**
 * Public landing page — shown to unauthenticated visitors.
 * Authenticated users get redirected to /dashboard by App.jsx.
 *
 * Complete 7-section redesign with:
 * 1. Hero — 3D neural network particles, typewriter, magnetic buttons
 * 2. FeatureShowcase — 6 AI-powered feature cards, horizontal scroll
 * 3. HowItWorks — 5-step pipeline with 3D animated orbs
 * 4. StatsBar — Animated counters (200+, 50+, 4, 100+)
 * 5. Demo — Ask AI interface with typing animation & citations
 * 6. TechStack — 3D orbital system with technologies
 * 7. Footer — Links, social, copyright, tech stack note
 */
export default function Landing() {
  return (
    <div className="bg-slate-950 min-h-screen overflow-x-hidden">
      {/* Section 1: Hero with neural network particles & scroll indicator */}
      <Hero />

      {/* Section 2: Feature Showcase with 6 tilting 3D cards & horizontal scroll */}
      <FeatureShowcase />

      {/* Section 3: How It Works with 5-step pipeline & animated connectors */}
      <HowItWorks />

      {/* Section 4: Stats Bar with animated counters & impact metrics */}
      <StatsBar />

      {/* Section 5: Demo section with Ask AI interface, typing animation & citations */}
      <Demo />

      {/* Section 6: Tech Stack with 3D orbital system & category grid */}
      <TechStack />

      {/* Section 7: Footer with links, social, copyright & tech notes */}
      <Footer />
    </div>
  );
}
