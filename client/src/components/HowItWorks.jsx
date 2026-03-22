import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Preload } from '@react-three/drei';

// ─────────────────────────────────────────────────────────────────
// 3D Arrow Connector
// ─────────────────────────────────────────────────────────────────
const Arrow3D = ({ position, rotation }) => {
  const groupRef = useRef(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y += Math.sin(state.clock.getElapsedTime() * 2) * 0.001;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Arrow shaft */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 2, 8]} />
        <meshStandardMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Arrow head */}
      <mesh position={[0, 1.2, 0]}>
        <coneGeometry args={[0.25, 0.6, 8]} />
        <meshStandardMaterial
          color="#0D9488"
          emissive="#0D9488"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Pulsing glow effect */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 2, 8]} />
        <meshStandardMaterial
          color="#7C3AED"
          transparent
          opacity={0.2}
          emissive="#7C3AED"
          emissiveIntensity={1}
        />
      </mesh>
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────
// 3D Animated Orb (step indicator)
// ─────────────────────────────────────────────────────────────────
const AnimatedOrb = ({ color, emissiveIntensity }) => {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
      meshRef.current.scale.x = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      meshRef.current.scale.y = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
      meshRef.current.scale.z = 1 + Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1, 4]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        metalness={0.6}
        roughness={0.3}
        wireframe={false}
      />
      <pointLight intensity={2} distance={8} color={color} />
    </mesh>
  );
};

// ─────────────────────────────────────────────────────────────────
// Vertical Pipeline Step
// ─────────────────────────────────────────────────────────────────
const PipelineStep = ({ step, index, isActive }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'center center'],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);
  const x = useTransform(scrollYProgress, [0, 1], [-100, 0]);
  const z = useTransform(scrollYProgress, [0, 1], [-500, 0]);

  const stepVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        delay: index * 0.2,
      },
    },
  };

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        variants={stepVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="flex flex-col items-center"
      >
        {/* 3D Canvas for orb */}
        <div className="w-32 h-32 mb-6 rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border border-violet-500/30 shadow-lg shadow-violet-500/20">
          <Canvas dpr={[1, 1.2]} camera={{ position: [0, 0, 2.5], fov: 50 }} performance={{ min: 0.5 }}>
            <AnimatedOrb color={step.color} emissiveIntensity={0.8} />
            <Preload all />
          </Canvas>
        </div>

        {/* Step number and icon */}
        <div className="absolute top-0 right-0 w-10 h-10 rounded-full bg-violet-600/80 border border-violet-400 flex items-center justify-center text-white font-bold text-sm">
          {index + 1}
        </div>

        {/* Content card */}
        <div className="max-w-sm mx-auto">
          <h3 className="text-2xl font-bold text-white mb-3 text-center">
            {step.title}
          </h3>
          <p className="text-gray-400 text-center text-sm leading-relaxed mb-6">
            {step.description}
          </p>

          {/* Details list */}
          <div className="space-y-2 bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50">
            {step.details.map((detail, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-teal-400 font-bold flex-shrink-0">→</span>
                <span className="text-gray-300">{detail}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Vertical Connector Line
// ─────────────────────────────────────────────────────────────────
const ConnectorLine = ({ index, totalSteps }) => {
  const { scrollYProgress } = useScroll();
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (index === totalSteps - 1) return null;

  return (
    <motion.div
      style={{ scaleY, originY: 0 }}
      className="mx-auto my-0 w-1 h-24 bg-gradient-to-b from-violet-600 to-teal-500"
    />
  );
};

// ─────────────────────────────────────────────────────────────────
// Main How It Works Component
// ─────────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const steps = [
    {
      title: 'Submit Your Experience',
      icon: '📝',
      color: '#7C3AED',
      description: 'Share details about your interview: company, position, round type, questions asked, and how it went.',
      details: [
        'Fill out structured form (2 min)',
        'Company name and role',
        'Round type (coding, system design, etc)',
        'Key topics and questions',
      ],
    },
    {
      title: 'Automatic Tagging',
      icon: '🏷️',
      color: '#0D9488',
      description: 'Our distilBERT model analyzes your submission and auto-tags company tier, role level, and relevant topics.',
      details: [
        'distilBERT classification running',
        'Extract topics (arrays, DP, databases)',
        'Identify company tier (FAANG vs startup)',
        'Tag difficulty level (1-5)',
      ],
    },
    {
      title: 'Embedding & Vectorization',
      icon: '🧠',
      color: '#F59E0B',
      description: 'Convert your experience text to 384-dimensional embeddings using sentence-transformers for semantic search.',
      details: [
        '384-dim vector via all-MiniLM-L6-v2',
        'Store in ChromaDB vector database',
        'Make searchable by meaning, not keywords',
        'Fast similarity matching enabled',
      ],
    },
    {
      title: 'Index & Store',
      icon: '💾',
      color: '#7C3AED',
      description: 'Add your experience to our searchable archive. Now it\'s discoverable by students preparing for interviews.',
      details: [
        'Store text + metadata in MongoDB',
        'Add embedding vectors to ChromaDB',
        'Index for full-text search',
        'Live in the archive immediately',
      ],
    },
    {
      title: 'Search & Discover',
      icon: '🔍',
      color: '#0D9488',
      description: 'Students can now ask questions and find your experience via semantic search, RAG Q&A, or direct browse.',
      details: [
        'Semantic search by meaning',
        'RAG answers with your experience as context',
        'Filter by company, role, difficulty',
        'Get real insights from real engineers',
      ],
    },
  ];

  return (
    <section className="relative min-h-screen py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background grain */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium mb-6">
            The Pipeline
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto">
            From submission to discovery. Five steps that transform your interview story into searchable, actionable insights for thousands of students.
          </p>
        </motion.div>

        {/* Pipeline steps */}
        <div className="space-y-16 md:space-y-24">
          {steps.map((step, index) => (
            <div key={index}>
              <PipelineStep
                step={step}
                index={index}
                isActive={index < 3}
              />
              {index < steps.length - 1 && (
                <ConnectorLine index={index} totalSteps={steps.length} />
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-20"
        >
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-violet-500/20 backdrop-blur-sm max-w-lg">
            <h3 className="text-xl font-bold text-white mb-3">
              Ready to contribute your story?
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              Help thousands of students by sharing your interview experience. It takes 2 minutes.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/30"
            >
              Submit Your Experience
            </motion.button>
          </div>
        </motion.div>

        {/* Info cards at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          {[
            {
              label: 'Processing Time',
              value: '< 2 seconds',
              desc: 'From submission to archive',
            },
            {
              label: 'Models Used',
              value: '4 AI Models',
              desc: 'distilBERT, XGBoost, sentence-transformers, ChromaDB',
            },
            {
              label: 'Search Methods',
              value: '3 Ways',
              desc: 'Semantic, RAG Q&A, direct browse',
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-lg bg-gray-900/50 border border-gray-800/50 text-center backdrop-blur-sm"
            >
              <div className="text-sm text-gray-500 mb-2">{stat.label}</div>
              <div className="text-2xl font-bold text-violet-400 mb-2">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.desc}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </section>
  );
}
