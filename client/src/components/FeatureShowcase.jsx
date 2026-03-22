import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { Preload } from '@react-three/drei';

// ─────────────────────────────────────────────────────────────────
// 3D Tilting Card Background
// ─────────────────────────────────────────────────────────────────
const TiltingCardMesh = ({ rotation }) => {
  const meshRef = useRef(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = rotation.x * 0.5;
      meshRef.current.rotation.y = rotation.y * 0.5;
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <boxGeometry args={[8, 5, 0.5]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={0.15}
          metalness={0.4}
          roughness={0.6}
        />
      </mesh>

      {/* Floating particles around card */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 5, Math.sin(angle) * 5, 2]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial
              color="#0D9488"
              emissive="#0D9488"
              emissiveIntensity={0.8}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────
// Individual Feature Card Component
// ─────────────────────────────────────────────────────────────────
const FeatureCard = ({ feature, index }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const rotateX = (e.clientY - centerY) / 10;
    const rotateY = (e.clientX - centerX) / 10;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 100 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.7,
        ease: 'easeOut',
      },
    }),
    hover: {
      y: -8,
      transition: { duration: 0.3 },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      viewport={{ once: true, margin: '-100px' }}
      style={{
        perspective: '1000px',
        transform: !prefersReducedMotion
          ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
          : 'none',
      }}
      className="flex-shrink-0 w-96"
    >
      <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-violet-500/20 backdrop-blur-xl group">
        {/* 3D Canvas Background */}
        {!prefersReducedMotion && (
          <div ref={canvasRef} className="absolute inset-0 opacity-40">
            <Canvas dpr={[1, 1.2]} camera={{ position: [0, 0, 10] }} performance={{ min: 0.5 }}>
              <TiltingCardMesh rotation={tilt} />
              <Preload all />
            </Canvas>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 h-full p-8 flex flex-col justify-between">
          {/* Icon and title */}
          <div>
            <div className="w-12 h-12 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center mb-6 group-hover:bg-violet-500/30 transition-colors duration-300">
              <span className="text-2xl">{feature.icon}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
          </div>

          {/* Features list */}
          <div className="space-y-3">
            {feature.highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-teal-400 font-bold mt-0.5">✓</span>
                <span className="text-gray-300">{highlight}</span>
              </div>
            ))}
          </div>

          {/* Learn more link */}
          <motion.a
            href="#"
            whileHover={{ x: 4 }}
            className="inline-flex items-center gap-2 text-violet-400 font-medium mt-6 hover:text-violet-300 transition-colors"
          >
            Learn more
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.a>
        </div>

        {/* Animated border on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-violet-500/40 pointer-events-none"
          whileHover={{
            borderColor: 'rgba(124, 58, 237, 0.8)',
            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
          }}
        />
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Scroll Progress Indicator
// ─────────────────────────────────────────────────────────────────
const ScrollProgress = ({ scrollProgress }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-1 bg-gray-700 rounded-full"
            animate={{
              width: scrollProgress >= (i / 6) ? 24 : 12,
              backgroundColor:
                scrollProgress >= (i / 6) ? '#7C3AED' : '#374151',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
      <span className="text-xs text-gray-500 ml-2">
        Scroll to explore
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Feature Showcase Component
// ─────────────────────────────────────────────────────────────────
export default function FeatureShowcase() {
  const containerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const features = [
    {
      title: 'RAG Q&A Engine',
      icon: '🤖',
      description:
        'Ask real questions about interviews. Get answers from the crowdsourced experience database with cited sources.',
      highlights: [
        'Semantic similarity search across 200+ experiences',
        'AI-generated summaries with source attribution',
        'Real quotes from real engineers',
        'Updated weekly with new submissions',
      ],
    },
    {
      title: 'Semantic Search',
      icon: '🔍',
      description:
        'Find experiences by meaning, not just keywords. Search for "behavioral questions at startups" and get relevant results.',
      highlights: [
        '384-dimensional embeddings via sentence-transformers',
        'Hybrid keyword + semantic matching',
        'Filter by company, role, round type, difficulty',
        'Instant relevance ranking with similarity scores',
      ],
    },
    {
      title: 'Auto-Tagging',
      icon: '🏷️',
      description:
        'Submit your experience. We automatically categorize company, role, round type, and topics using distilBERT.',
      highlights: [
        'Auto-detect 7 round types (coding, system design, etc)',
        'Extract relevant topics (arrays, DP, databases)',
        'Identify company tier and role level',
        'Takes 2 seconds to process your submission',
      ],
    },
    {
      title: 'Difficulty Predictor',
      icon: '📊',
      description:
        'Predict interview difficulty before you apply. XGBoost model trained on 200+ real interviews with SHAP explainability.',
      highlights: [
        'Predicts difficulty 1-5 with confidence scores',
        'SHAP feature importance explains the prediction',
        'Consider company, role, round type, and topics',
        'Accuracy: 85.5% on validation set',
      ],
    },
    {
      title: 'Gap Dashboard',
      icon: '📈',
      description:
        'Track your weak areas. See which topics, companies, and round types you need to prepare for most.',
      highlights: [
        'Heatmap of skill gaps by topic and company',
        'Recommended questions based on your weaknesses',
        'Progress tracking across 30+ topics',
        'Weekly digest of personalized prep recommendations',
      ],
    },
    {
      title: 'Weekly Digest',
      icon: '📧',
      description:
        'Get a personalized prep email every Sunday. New experiences, trending companies, and your custom action items.',
      highlights: [
        '3 new experiences in your target companies',
        'Top trending questions this week',
        'Your personalized skill gaps & action items',
        'Unsubscribe anytime, no spam guarantee',
      ],
    },
  ];

  const handleScroll = () => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth - container.clientWidth;
    const progress = scrollLeft / scrollWidth;

    setScrollProgress(Math.min(progress, 1));
  };

  return (
    <section className="relative min-h-screen py-20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
      {/* Background grain */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-full">
        {/* Header */}
        <div className="px-6 md:px-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="inline-block px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm font-medium mb-6">
              Powered by AI
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Six AI Models Working Together
            </h2>
            <p className="text-lg text-gray-400">
              Semantic search, auto-tagging, difficulty prediction, and personalized prep. Every feature is built on real ML models trained on interview data.
            </p>
          </motion.div>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex gap-4 md:gap-6 px-4 md:px-12 overflow-x-auto scroll-smooth pb-8"
            style={{ scrollBehavior: 'smooth' }}
          >
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>

          {/* Scroll shadows */}
          <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-40" />
          <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-40" />
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center mt-12">
          <ScrollProgress scrollProgress={scrollProgress} />
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <p className="text-gray-400 mb-6">
            Ready to prepare smarter?
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30"
          >
            Start Now
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </section>
  );
}
