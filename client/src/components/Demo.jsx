import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────
// Typing Effect Hook (optimized with requestAnimationFrame)
// ─────────────────────────────────────────────────────────────────
const useTypeWriter = (text, speed = 20, shouldStart = true) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    if (!shouldStart) {
      setDisplayedText('');
      indexRef.current = 0;
      return;
    }

    let timeoutId;
    if (indexRef.current < text.length) {
      timeoutId = setTimeout(() => {
        setDisplayedText((prev) => prev + text[indexRef.current]);
        indexRef.current += 1;
      }, speed);
    }

    return () => clearTimeout(timeoutId);
  }, [text, speed, shouldStart]);

  return displayedText;
};

// ─────────────────────────────────────────────────────────────────
// Citation Card
// ─────────────────────────────────────────────────────────────────
const CitationCard = ({ company, role, roundType, difficulty, excerpt, index }) => {
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + index * 0.15, duration: 0.5 }}
      whileHover={{ x: 5, boxShadow: '0 0 20px rgba(13, 148, 136, 0.3)' }}
      className="block p-4 rounded-lg bg-gray-900/60 border border-gray-800/50 hover:border-teal-500/50 transition-all duration-300 group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Source icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-teal-600/30 to-teal-600/10 flex items-center justify-center border border-teal-600/30 group-hover:bg-teal-600/20 transition-colors">
          <span className="text-lg">📌</span>
        </div>

        {/* Citation content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-semibold text-white text-sm">{company}</span>
            <span className="text-xs text-gray-500">•</span>
            <span className="text-xs text-gray-400">{role}</span>
            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-teal-600/20 text-teal-300 border border-teal-600/30">
              {roundType}
            </span>
          </div>

          {/* Difficulty badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">Difficulty:</span>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i < difficulty ? 'bg-orange-400' : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Excerpt */}
          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {excerpt}
          </p>

          {/* Link indicator */}
          <div className="mt-2 flex items-center gap-1 text-teal-400 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            View experience →
          </div>
        </div>
      </div>
    </motion.a>
  );
};

// ─────────────────────────────────────────────────────────────────
// Chat Message Bubble
// ─────────────────────────────────────────────────────────────────
const ChatMessage = ({ role, content, isTyping = false }) => {
  const displayedContent = isTyping ? useTypeWriter(content, 25, true) : content;

  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gradient-to-br from-violet-600 to-violet-700 text-white rounded-br-none'
            : 'bg-gray-800/80 text-gray-100 border border-gray-700/50 rounded-bl-none'
        }`}
      >
        <p className="text-sm leading-relaxed break-words">{displayedContent}</p>
        {isTyping && displayedContent === content && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="inline-block ml-1 text-lg"
          >
            ▊
          </motion.span>
        )}
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────────
// Main Demo Section Component
// ─────────────────────────────────────────────────────────────────
export default function Demo() {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start center', 'center center'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.5, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 50, 0]);

  // Trigger animation when section comes into view
  useEffect(() => {
    const unsubscribe = scrollYProgress.onChange((latest) => {
      if (latest > 0.2) {
        setIsVisible(true);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const sampleQuestion =
    'What should I prepare for an Amazon System Design interview for Leadership Principles?';

  const sampleAnswer =
    'For Amazon system design interviews, focus heavily on their Leadership Principles, especially "Customer Obsession" and "Bias for Action." Design scalable systems that emphasize availability and resilience. Practice designing for high throughput with thoughtful trade-offs. Amazon interviewers expect you to discuss monitoring, logging, and how your design enables customer obsession through data. Key areas: distributed systems, databases (both SQL and NoSQL), caching strategies, and trade-offs between consistency and availability.';

  const citations = [
    {
      company: 'Amazon',
      role: 'Senior SDE',
      roundType: 'System Design',
      difficulty: 4,
      excerpt:
        'System design round focused on designing a highly scalable messaging service. Interviewer emphasized trade-offs between consistency and availability.',
    },
    {
      company: 'Amazon',
      role: 'SDE II',
      roundType: 'System Design',
      difficulty: 3,
      excerpt:
        'Asked to design a recommendation engine. Important to discuss caching strategies and handling millions of concurrent users.',
    },
    {
      company: 'Amazon',
      role: 'Senior SDE',
      roundType: 'Behavioral',
      difficulty: 2,
      excerpt:
        'Deep dive into leadership principles. They care about customer obsession and bias for action in every answer you give.',
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
      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-sm font-medium mb-6">
            Interactive Demo
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ask AI, Get Insights
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Ask questions about interviews and get answers backed by real experiences from your peers, powered by RAG and semantic search.
          </p>
        </motion.div>

        {/* Demo Interface */}
        <motion.div
          style={opacity && y ? { opacity, y } : {}}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {/* Left side - Chat interface */}
          <div className="md:col-span-2">
            <div className="relative rounded-2xl overflow-hidden bg-gray-900/50 border border-gray-800/50 backdrop-blur-xl shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-violet-600/10 to-teal-600/10 border-b border-gray-800/50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-sm font-medium text-white">
                    Ask AI Assistant
                  </span>
                </div>
              </div>

              {/* Chat history */}
              <div className="h-96 max-h-96 overflow-y-auto px-6 py-6 space-y-4 scrollbar-hide">
                {/* Empty state message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="text-center text-gray-500 text-sm py-8"
                >
                  <p className="mb-2">💡 Example question below</p>
                </motion.div>

                {/* User question */}
                <ChatMessage
                  role="user"
                  content={sampleQuestion}
                  isTyping={false}
                />

                {/* AI response with typing effect */}
                {isVisible && (
                  <ChatMessage
                    role="assistant"
                    content={sampleAnswer}
                    isTyping={true}
                  />
                )}
              </div>

              {/* Input area */}
              <div className="bg-gray-900/80 border-t border-gray-800/50 px-6 py-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Ask about interviews, companies, or prep strategies..."
                    disabled
                    className="flex-1 bg-gray-800/50 border border-gray-700/50 rounded-lg px-4 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none"
                  />
                  <button
                    disabled
                    className="px-4 py-2 bg-violet-600/80 text-white rounded-lg font-medium text-sm hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Ask
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  ✨ Powered by RAG, semantic search, and{' '}
                  <span className="text-violet-400">200+ real experiences</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Citations */}
          <div className="md:col-span-1">
            <div>
              <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-lg font-bold text-white mb-4 flex items-center gap-2"
              >
                <span>🔍</span> Sources & Citations
              </motion.h3>

              {/* Citation cards */}
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                {citations.map((citation, index) => (
                  <CitationCard
                    key={index}
                    {...citation}
                    index={index}
                  />
                ))}
              </div>

              {/* More citations indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : {}}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-4 text-center text-sm text-gray-500 italic"
              >
                ... and 50+ more relevant experiences
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20"
        >
          {[
            {
              icon: '⚡',
              title: 'Real-Time Answers',
              desc: 'Get answers based on actual interview experiences from peers',
            },
            {
              icon: '🎯',
              title: 'Semantic Search',
              desc: 'Find relevant experiences by meaning, not just keywords',
            },
            {
              icon: '📚',
              title: 'Citations & Sources',
              desc: 'Every answer backed by real experiences you can explore',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-xl bg-gray-900/50 border border-gray-800/50 hover:border-violet-500/30 transition-colors"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-teal-500/20 backdrop-blur-sm max-w-lg">
            <h3 className="text-2xl font-bold text-white mb-4">
              Start Asking Now
            </h3>
            <p className="text-gray-400 mb-6">
              Get personalized insights backed by real interview data. No signup required to explore.
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(13, 148, 136, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-teal-500/30"
            >
              Try Demo
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
