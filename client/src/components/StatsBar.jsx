import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────
// Animated Counter Component (optimized)
// ─────────────────────────────────────────────────────────────────
const AnimatedCounter = ({ target, duration = 2, suffix = '', delay = 0 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: countRef,
    offset: ['start end', 'center center'],
  });

  // Trigger animation when section reaches center of viewport
  useEffect(() => {
    let startTime = null;
    let countupStarted = false;

    const unsubscribe = scrollYProgress.onChange((latest) => {
      // Start counting when progress is > 0.1 (section is in view)
      if (latest > 0.1 && !countupStarted) {
        countupStarted = true;
        startTime = Date.now();

        const animate = () => {
          if (!startTime) return;
          const elapsed = (Date.now() - startTime) / 1000;
          const progress = Math.min(elapsed / duration, 1);

          // Easing function for smoother animation
          const easeOutQuad = (t) => t * (2 - t);
          const easedProgress = easeOutQuad(progress);

          setCount(Math.floor(target * easedProgress));

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        // Add delay before starting
        const timeoutId = setTimeout(() => {
          startTime = Date.now();
          animate();
        }, delay * 1000);

        return () => clearTimeout(timeoutId);
      }
    });

    return () => unsubscribe?.();
  }, [target, duration, delay, scrollYProgress]);

  return (
    <div ref={countRef}>
      <span className="font-bold text-5xl md:text-6xl bg-gradient-to-r from-violet-400 via-teal-400 to-violet-400 bg-clip-text text-transparent">
        {count}
        {suffix}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Single Stat Card
// ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, suffix, description, index, delay }) => {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'center center'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 50, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 0.9, 1]);

  return (
    <motion.div
      ref={cardRef}
      style={{ opacity, y, scale }}
      whileHover={{ y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative group"
    >
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/30 to-teal-600/30 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />

      {/* Card content */}
      <div className="relative bg-gradient-to-br from-gray-900/80 to-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-800/50 group-hover:border-violet-500/30 transition-colors duration-300">
        {/* Icon */}
        <div className="text-5xl mb-4 filter drop-shadow-lg">{icon}</div>

        {/* Counter */}
        <div className="mb-4">
          <AnimatedCounter
            target={value}
            duration={2.5}
            suffix={suffix}
            delay={delay}
          />
        </div>

        {/* Label */}
        <h3 className="text-xl font-bold text-white mb-2">{label}</h3>

        {/* Description */}
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>

        {/* Animated bottom border */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1, delay: delay + 0.2 }}
          viewport={{ once: true }}
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-teal-500 rounded-b-2xl origin-left"
        />
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Stats Bar Component
// ─────────────────────────────────────────────────────────────────
export default function StatsBar() {
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

  const stats = [
    {
      icon: '📚',
      label: 'Interview Experiences',
      value: 200,
      suffix: '+',
      description:
        'Real stories from engineers who have gone through rigorous interviews at top tier companies.',
      delay: 0,
    },
    {
      icon: '🏢',
      label: 'Top Companies',
      value: 50,
      suffix: '+',
      description:
        'Coverage across FAANG, startups, and enterprises. Find preparation material for your target company.',
      delay: 0.2,
    },
    {
      icon: '🤖',
      label: 'AI Models',
      value: 4,
      suffix: '',
      description:
        'distilBERT, XGBoost, sentence-transformers, ChromaDB. State-of-the-art ML powering the archive.',
      delay: 0.4,
    },
    {
      icon: '👥',
      label: 'Students Helped',
      value: 100,
      suffix: '+',
      description:
        'Students preparing for their dream roles using real experiences and AI-powered insights.',
      delay: 0.6,
    },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen py-20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden"
    >
      {/* Background grain texture */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' result='noise' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Animated background orbs */}
      <motion.div
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-10 left-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 right-10 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"
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
          <span className="inline-block px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-sm font-medium mb-6">
            By The Numbers
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Placement Archive Impact
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            A thriving community of interview preparation,{' '}
            <span className="text-violet-400">powered by AI</span> and{' '}
            <span className="text-teal-400">driven by real stories</span>.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          style={prefersReducedMotion ? {} : { opacity, y }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              description={stat.description}
              index={index}
              delay={stat.delay}
            />
          ))}
        </motion.div>

        {/* Bottom testimonial section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Stat fact 1 */}
              <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm hover:border-violet-500/30 transition-colors">
                <div className="text-5xl font-bold text-violet-400 mb-2">85%</div>
                <p className="text-gray-300 font-medium mb-2">Success Rate</p>
                <p className="text-sm text-gray-400">
                  Students report increased confidence after reviewing relevant
                  experiences
                </p>
              </div>

              {/* Stat fact 2 */}
              <div className="p-6 rounded-xl bg-gray-900/50 border border-gray-800/50 backdrop-blur-sm hover:border-teal-500/30 transition-colors">
                <div className="text-5xl font-bold text-teal-400 mb-2">2s</div>
                <p className="text-gray-300 font-medium mb-2">Processing Time</p>
                <p className="text-sm text-gray-400">
                  From submission to searchable archive — powered by fast ML
                  models
                </p>
              </div>
            </div>

            {/* Trust statement */}
            <div className="mt-8 text-center">
              <p className="text-gray-400 text-sm">
                Trusted by <span className="text-white font-semibold">100+ students</span> preparing
                for interviews at{' '}
                <span className="text-violet-400 font-semibold">top companies</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-block p-8 md:p-10 rounded-2xl bg-gradient-to-br from-gray-900/60 to-gray-800/40 border border-violet-500/30 backdrop-blur-sm max-w-lg">
            <h3 className="text-2xl font-bold text-white mb-4">
              Join the Community
            </h3>
            <p className="text-gray-400 mb-6">
              Start exploring interview experiences today and ace your next
              interview.
            </p>
            <div className="flex gap-3 justify-center">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(124, 58, 237, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg"
              >
                Start Exploring
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(13, 148, 136, 0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 bg-transparent border border-teal-500/50 text-teal-400 rounded-lg font-semibold hover:border-teal-400 hover:bg-teal-500/10 transition-all duration-300"
              >
                Learn More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
    </section>
  );
}
