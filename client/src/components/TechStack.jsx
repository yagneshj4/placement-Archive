import React, { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Preload, OrbitControls } from '@react-three/drei';

// ─────────────────────────────────────────────────────────────────
// 3D Rotating Sphere with Glow
// ─────────────────────────────────────────────────────────────────
const CentralSphere = () => {
  const meshRef = useRef(null);
  const glowRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
    if (glowRef.current) {
      glowRef.current.scale.x = 1 + Math.sin(state.clock.getElapsedTime()) * 0.15;
      glowRef.current.scale.y = 1 + Math.sin(state.clock.getElapsedTime()) * 0.15;
      glowRef.current.scale.z = 1 + Math.sin(state.clock.getElapsedTime()) * 0.15;
    }
  });

  return (
    <group>
      {/* Main sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 5]} />
        <meshPhongMaterial
          color="#7C3AED"
          emissive="#7C3AED"
          emissiveIntensity={0.4}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <icosahedronGeometry args={[1.3, 5]} />
        <meshStandardMaterial
          color="#0D9488"
          emissive="#0D9488"
          emissiveIntensity={0.3}
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>

      {/* Point light for inner glow */}
      <pointLight intensity={3} distance={8} color="#7C3AED" />
      <pointLight intensity={2} distance={6} color="#0D9488" />
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────
// Orbiting Tech Icon
// ─────────────────────────────────────────────────────────────────
const OrbittingTech = ({ position, tech, orbitRadius, speed }) => {
  const groupRef = useRef(null);
  const iconRef = useRef(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Orbital motion
      const time = state.clock.getElapsedTime() * speed;
      const x = Math.cos(time) * orbitRadius;
      const z = Math.sin(time) * orbitRadius;
      groupRef.current.position.x = x;
      groupRef.current.position.z = z;
    }

    if (iconRef.current) {
      // Self rotation
      iconRef.current.rotation.x += 0.01;
      iconRef.current.rotation.y += 0.015;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Icon mesh */}
      <mesh ref={iconRef}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial
          color={tech.color}
          emissive={tech.color}
          emissiveIntensity={0.5}
          metalness={0.5}
          roughness={0.4}
        />
      </mesh>

      {/* Glow around icon */}
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshStandardMaterial
          color={tech.color}
          transparent={true}
          opacity={0.15}
          emissive={tech.color}
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Point light */}
      <pointLight intensity={1.5} distance={5} color={tech.color} />
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────
// Orbital System Scene
// ─────────────────────────────────────────────────────────────────
const OrbitalSystem = ({ techs }) => {
  return (
    <group>
      {/* Orbit ring indicators (subtle) */}
      {[3, 5, 7].map((radius, i) => (
        <lineSegments key={`orbit-${i}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={64}
              array={new Float32Array(
                Array.from({ length: 64 }, (_, i) => {
                  const angle = (i / 64) * Math.PI * 2;
                  return [
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius,
                  ];
                }).flat()
              )}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#7C3AED"
            transparent
            opacity={0.1}
            linewidth={1}
          />
        </lineSegments>
      ))}

      {/* Central sphere */}
      <CentralSphere />

      {/* Orbiting technologies */}
      {techs.map((tech, index) => (
        <OrbittingTech
          key={index}
          position={[0, 0, 0]}
          tech={tech}
          orbitRadius={tech.orbitRadius}
          speed={tech.speed}
        />
      ))}
    </group>
  );
};

// ─────────────────────────────────────────────────────────────────
// Tech Stack Card (Bottom)
// ─────────────────────────────────────────────────────────────────
const TechCard = ({ category, technologies, icon, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="p-6 rounded-lg bg-gray-900/50 border border-gray-800/50 hover:border-violet-500/30 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-bold text-white">{category}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech, i) => (
          <span
            key={i}
            className="px-3 py-1 text-xs rounded-full bg-violet-600/20 text-violet-300 border border-violet-600/30 font-medium"
          >
            {tech}
          </span>
        ))}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Tech Stack Component
// ─────────────────────────────────────────────────────────────────
export default function TechStack() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'center center'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 50, 0]);

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  // Tech stack data with orbital parameters
  const techs = [
    // Inner orbit (fastest)
    { name: 'React', color: '#61DAFB', orbitRadius: 3, speed: 1.2 },
    { name: 'Node.js', color: '#68A063', orbitRadius: 3, speed: 1.2 },
    { name: 'Three.js', color: '#04D4FF', orbitRadius: 3, speed: 1.2 },

    // Middle orbit
    { name: 'MongoDB', color: '#00ED64', orbitRadius: 5, speed: 0.8 },
    { name: 'PostgreSQL', color: '#336791', orbitRadius: 5, speed: 0.8 },
    { name: 'ChromaDB', color: '#FF006E', orbitRadius: 5, speed: 0.8 },

    // Outer orbit (slowest)
    { name: 'PyTorch', color: '#EE4C2C', orbitRadius: 7, speed: 0.5 },
    { name: 'FastAPI', color: '#009485', orbitRadius: 7, speed: 0.5 },
    { name: 'Framer Motion', color: '#0055FF', orbitRadius: 7, speed: 0.5 },
  ];

  const techCategories = [
    {
      category: 'Frontend',
      icon: '🎨',
      technologies: ['React', 'Tailwind CSS', 'Framer Motion', 'Three.js', 'Vite'],
      delay: 0,
    },
    {
      category: 'Backend',
      icon: '⚙️',
      technologies: ['Node.js', 'Express', 'FastAPI', 'Python', 'Authorization'],
      delay: 0.1,
    },
    {
      category: 'Databases',
      icon: '💾',
      technologies: ['MongoDB', 'PostgreSQL', 'ChromaDB', 'Redis', 'Elasticsearch'],
      delay: 0.2,
    },
    {
      category: 'ML & AI',
      icon: '🤖',
      technologies: ['PyTorch', 'scikit-learn', 'XGBoost', 'sentence-transformers', 'SHAP'],
      delay: 0.3,
    },
    {
      category: 'DevOps & Tools',
      icon: '🛠️',
      technologies: ['Docker', 'GitHub', 'Jest', 'Pytest', 'Nginx'],
      delay: 0.4,
    },
    {
      category: 'Cloud & Deployment',
      icon: '☁️',
      technologies: ['AWS (optional)', 'Neon', 'Vercel', 'REST APIs', 'Rate Limiting'],
      delay: 0.5,
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-20 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden"
    >
      {/* Background grain */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm font-medium mb-6">
            Built With
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tech Stack
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Cutting-edge technologies powering Placement Archive. From{' '}
            <span className="text-violet-400">distributed systems</span> to{' '}
            <span className="text-teal-400">advanced ML</span>, we use the best tools for the job.
          </p>
        </motion.div>

        {/* 3D Orbital System */}
        <motion.div
          style={opacity && y && !prefersReducedMotion ? { opacity, y } : {}}
          className="w-full h-96 md:h-[500px] rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800/50 backdrop-blur-xl mb-20 shadow-2xl"
        >
          <Canvas
            dpr={[1, 1.2]}
            camera={{ position: [0, 4, 8], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
            performance={{ min: 0.5 }}
          >
            <OrbitalSystem techs={techs} />
            {!prefersReducedMotion && <OrbitControls enableZoom={false} />}
            <Preload all />
          </Canvas>
        </motion.div>

        {/* Tech Stack Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16 p-6 rounded-lg bg-gray-900/30 border border-gray-800/30 backdrop-blur-sm"
        >
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="text-lg">🌐</span> Technology Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-9 gap-4">
            {techs.map((tech, i) => (
              <div key={i} className="text-center">
                <div
                  className="w-10 h-10 rounded-lg mx-auto mb-2 border-2"
                  style={{
                    backgroundColor: `${tech.color}20`,
                    borderColor: tech.color,
                  }}
                />
                <p className="text-xs font-medium text-white">{tech.name}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Technology Categories Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">
            By Category
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techCategories.map((category, index) => (
              <TechCard key={index} {...category} />
            ))}
          </div>
        </motion.div>

        {/* Architecture Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16"
        >
          {/* Architecture Diagram Info */}
          <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800/50">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🏗️</span>
              <h3 className="text-xl font-bold text-white">Architecture</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Microservices-ready backend with FastAPI + Node.js',
                'Real-time data sync with MongoDB + PostgreSQL',
                'Vector search powered by ChromaDB',
                'ML pipelines with PyTorch + XGBoost',
                'Responsive frontend with React + Three.js 3D',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-teal-400 font-bold flex-shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Performance Metrics */}
          <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800/50">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">⚡</span>
              <h3 className="text-xl font-bold text-white">Performance</h3>
            </div>
            <ul className="space-y-3">
              {[
                'Sub-100ms API response times with caching',
                '<2 second experience processing pipeline',
                '384-dimensional embeddings for semantic search',
                '85.5% accuracy on difficulty prediction',
                'Optimized Canvas rendering with 60 FPS target',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-violet-400 font-bold flex-shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-block p-8 md:p-10 rounded-2xl bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-gold-500/20 backdrop-blur-sm max-w-lg">
            <h3 className="text-2xl font-bold text-white mb-4">
              Open Source & Transparent
            </h3>
            <p className="text-gray-400 mb-6">
              All technologies are production-proven, well-documented, and actively maintained by their communities.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(245, 158, 11, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-gold-600 to-gold-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
            >
              View GitHub
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-teal-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
}
