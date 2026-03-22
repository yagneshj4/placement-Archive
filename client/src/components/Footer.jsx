import React from 'react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────
// Main Footer Component
// ─────────────────────────────────────────────────────────────────
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    {
      title: 'Product',
      items: [
        { name: 'Features', href: '#' },
        { name: 'How It Works', href: '#' },
        { name: 'Pricing', href: '#' },
      ],
    },
    {
      title: 'Company',
      items: [
        { name: 'About', href: '#' },
        { name: 'Blog', href: '#' },
        { name: 'Careers', href: '#' },
      ],
    },
    {
      title: 'Resources',
      items: [
        { name: 'Documentation', href: '#' },
        { name: 'API Docs', href: '#' },
        { name: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Legal',
      items: [
        { name: 'Privacy', href: '#' },
        { name: 'Terms', href: '#' },
        { name: 'Cookies', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: '𝕏', href: '#' },
    { name: 'GitHub', icon: '⚫', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' },
    { name: 'Discord', icon: '💬', href: '#' },
  ];

  return (
    <footer className="bg-slate-950 relative overflow-hidden">
      {/* Animated gradient border */}
      <motion.div
        initial={{ backgroundPosition: '0% center' }}
        animate={{ backgroundPosition: '200% center' }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="h-1 bg-gradient-to-r from-transparent via-violet-600 to-transparent"
        style={{
          backgroundSize: '200% 100%',
        }}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        {/* Top section - Logo and tagline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 pb-12 border-b border-gray-800/50"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">📚</span>
            </div>
            <h3 className="text-xl font-bold text-white">Placement Archive</h3>
          </div>
          <p className="text-gray-400 max-w-md">
            Learn from real interview experiences. Prepare smarter, interview better.
          </p>
        </motion.div>

        {/* Links section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {links.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-white mb-4 text-sm">{section.title}</h4>
              <ul className="space-y-2">
                {section.items.map((item, j) => (
                  <li key={j}>
                    <motion.a
                      href={item.href}
                      whileHover={{ x: 5 }}
                      className="text-sm text-gray-400 hover:text-violet-400 transition-colors"
                    >
                      {item.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom section - Social, copyright, tech */}
        <div className="pt-8 border-t border-gray-800/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center gap-4"
            >
              <span className="text-sm font-medium text-gray-400">Follow us</span>
              <div className="flex gap-3">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    whileHover={{ scale: 1.2, color: '#7C3AED' }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-gray-900/50 border border-gray-800/50 flex items-center justify-center text-gray-400 hover:border-violet-500/50 transition-colors"
                    title={social.name}
                  >
                    <span className="text-lg">{social.icon}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Copyright */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-center text-sm text-gray-500"
            >
              <p>© {currentYear} Placement Archive. All rights reserved.</p>
            </motion.div>

            {/* Tech stack note */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-right text-sm text-gray-500"
            >
              <p>
                Built with{' '}
                <span className="text-violet-400 font-medium">React</span>,{' '}
                <span className="text-teal-400 font-medium">Three.js</span> &{' '}
                <span className="text-gold-400 font-medium">AI</span>
              </p>
            </motion.div>
          </div>

          {/* Bottom links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600 pt-4 border-t border-gray-800/30">
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-gray-400 transition-colors">
                Status
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-400 transition-colors">
                Acknowledgments
              </a>
              <span>•</span>
              <a href="#" className="hover:text-gray-400 transition-colors">
                Sitemap
              </a>
            </div>
            <span>Made with ❤️ for interview prep</span>
          </div>
        </div>
      </div>

      {/* Subtle background gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-violet-950/10 to-transparent pointer-events-none" />
    </footer>
  );
}
