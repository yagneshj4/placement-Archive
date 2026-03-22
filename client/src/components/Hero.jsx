import { useRef, useEffect, useState, useCallback, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Points, PointMaterial, MeshDistortMaterial, Sphere } from '@react-three/drei'
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import * as THREE from 'three'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// ─── Constants ──────────────────────────────────────────────────────────────
const ACCENT_VIOLET = '#7C3AED'
const ACCENT_TEAL = '#0D9488'
const ACCENT_GOLD = '#F59E0B'
const BG_DEEP = '#0A0A0F'
const BG_MID = '#0F0F1A'

const TYPEWRITER_PHRASES = [
  'Find interview experiences',
  'Ask the archive',
  'Close your skill gaps',
  'Predict your difficulty',
  'Ace your placement',
]

// ─── Noise / Grain texture (SVG data URI) ───────────────────────────────────
const GRAIN_STYLE = {
  position: 'fixed',
  inset: 0,
  zIndex: 0,
  pointerEvents: 'none',
  opacity: 0.035,
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'repeat',
  backgroundSize: '200px 200px',
}

// ─── 3D: Particle field ──────────────────────────────────────────────────────
function ParticleField({ mouse }) {
  const ref = useRef()
  const count = 1800

  // Build positions once
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 22
      arr[i * 3 + 1] = (Math.random() - 0.5) * 14
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()

    // Gentle drift + mouse repulsion
    ref.current.rotation.y = t * 0.04 + mouse.current.x * 0.15
    ref.current.rotation.x = t * 0.02 + mouse.current.y * 0.08

    // Breathe scale
    const s = 1 + Math.sin(t * 0.5) * 0.02
    ref.current.scale.setScalar(s)
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#7C3AED"
        size={0.045}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  )
}

// ─── 3D: Neural network nodes ────────────────────────────────────────────────
function NeuralNode({ position, color, speed, phase }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.getElapsedTime()
    ref.current.position.y = position[1] + Math.sin(t * speed + phase) * 0.25
    const pulse = 0.85 + Math.sin(t * speed * 2 + phase) * 0.15
    ref.current.scale.setScalar(pulse)
    ref.current.material.opacity = 0.6 + Math.sin(t * speed + phase) * 0.3
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.08, 12, 12]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.2}
        transparent
        opacity={0.8}
      />
    </mesh>
  )
}

// ─── 3D: Connection lines between nodes ─────────────────────────────────────
function NeuralEdge({ from, to, color }) {
  const ref = useRef()

  const points = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end   = new THREE.Vector3(...to)
    return [start, end]
  }, [from, to])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.material.opacity = 0.08 + Math.abs(Math.sin(clock.getElapsedTime() * 0.8)) * 0.15
  })

  return (
    <line ref={ref} geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={0.12} />
    </line>
  )
}

// ─── 3D: Neural network graph ────────────────────────────────────────────────
function NeuralNetwork({ mouse }) {
  const groupRef = useRef()

  const nodes = useMemo(() => [
    { pos: [-3.5, 0.5, -2],    color: ACCENT_VIOLET, speed: 0.6, phase: 0 },
    { pos: [-1.8, -1.2, -1.5], color: ACCENT_TEAL,   speed: 0.8, phase: 1.2 },
    { pos: [-0.5, 1.8, -2.5],  color: ACCENT_VIOLET, speed: 0.5, phase: 2.1 },
    { pos: [1.2, 0.3, -1.8],   color: ACCENT_GOLD,   speed: 0.7, phase: 0.7 },
    { pos: [2.8, 1.5, -2.2],   color: ACCENT_TEAL,   speed: 0.9, phase: 1.8 },
    { pos: [3.5, -0.8, -1.5],  color: ACCENT_VIOLET, speed: 0.6, phase: 3.0 },
    { pos: [0.5, -2.0, -2.0],  color: ACCENT_GOLD,   speed: 0.75, phase: 0.4 },
    { pos: [-2.5, -2.2, -2.5], color: ACCENT_TEAL,   speed: 0.55, phase: 2.5 },
    { pos: [0, 0, -3],         color: ACCENT_VIOLET, speed: 0.4,  phase: 1.0 },
  ], [])

  const edges = useMemo(() => [
    [0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 6],
    [4, 5], [1, 7], [7, 6], [6, 3], [8, 3], [8, 1],
    [8, 4], [2, 8], [0, 8],
  ], [])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.y = t * 0.06 + mouse.current.x * 0.12
    groupRef.current.rotation.x = mouse.current.y * 0.06
  })

  return (
    <group ref={groupRef}>
      {nodes.map((n, i) => (
        <NeuralNode key={i} position={n.pos} color={n.color} speed={n.speed} phase={n.phase} />
      ))}
      {edges.map(([a, b], i) => (
        <NeuralEdge
          key={i}
          from={nodes[a].pos}
          to={nodes[b].pos}
          color={i % 2 === 0 ? ACCENT_VIOLET : ACCENT_TEAL}
        />
      ))}
    </group>
  )
}

// ─── 3D: Central ambient sphere ──────────────────────────────────────────────
function AmbientSphere() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.z = clock.getElapsedTime() * 0.12
  })
  return (
    <mesh ref={ref} position={[0, 0, -4]}>
      <sphereGeometry args={[1.4, 64, 64]} />
      <MeshDistortMaterial
        color="#1a0a3d"
        emissive="#3b1a8a"
        emissiveIntensity={0.3}
        distort={0.35}
        speed={1.2}
        roughness={0.8}
        transparent
        opacity={0.45}
      />
    </mesh>
  )
}

// ─── 3D: Scene wrapper ───────────────────────────────────────────────────────
function Scene({ mouse }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 3]}  color="#7C3AED" intensity={1.8} />
      <pointLight position={[-5, -3, 2]} color="#0D9488" intensity={1.2} />
      <pointLight position={[0, 8, -4]} color="#F59E0B" intensity={0.6} />
      <AmbientSphere />
      <NeuralNetwork mouse={mouse} />
      <ParticleField mouse={mouse} />
    </>
  )
}

// ─── Magnetic button ─────────────────────────────────────────────────────────
function MagneticButton({ children, onClick, primary = false, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 350, damping: 28 })
  const springY = useSpring(y, { stiffness: 350, damping: 28 })

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const threshold = 80
    if (dist < threshold) {
      const pull = (threshold - dist) / threshold
      x.set(dx * pull * 0.4)
      y.set(dy * pull * 0.4)
    }
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  if (primary) {
    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        onMouseLeave={handleMouseLeave}
        style={{ x: springX, y: springY }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.97 }}
        className={`relative group overflow-hidden rounded-xl px-7 py-3.5 text-sm font-semibold text-white tracking-wide cursor-pointer select-none ${className}`}
      >
        {/* Gradient background */}
        <span
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${ACCENT_VIOLET}, #5b21b6)`,
          }}
        />
        {/* Shimmer on hover */}
        <motion.span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%)',
          }}
        />
        {/* Glow */}
        <span
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-80 transition-opacity duration-300 blur-md"
          style={{ background: `${ACCENT_VIOLET}55` }}
        />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    )
  }

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
        border: '1px solid rgba(124, 58, 237, 0.4)',
        color: 'rgba(255,255,255,0.85)',
        background: 'rgba(124, 58, 237, 0.07)',
        backdropFilter: 'blur(12px)',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`relative group rounded-xl px-7 py-3.5 text-sm font-semibold tracking-wide cursor-pointer select-none ${className}`}
    >
      <motion.span
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: 'rgba(124, 58, 237, 0.12)' }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  )
}

// ─── Typewriter effect ───────────────────────────────────────────────────────
function Typewriter() {
  const [phraseIdx, setPhraseIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const phrase = TYPEWRITER_PHRASES[phraseIdx]

    if (!isDeleting && displayed === phrase) {
      // Pause then start deleting
      timeoutRef.current = setTimeout(() => setIsDeleting(true), 2200)
      return
    }

    if (isDeleting && displayed === '') {
      setIsDeleting(false)
      setPhraseIdx(i => (i + 1) % TYPEWRITER_PHRASES.length)
      return
    }

    const delay = isDeleting ? 30 : 45
    timeoutRef.current = setTimeout(() => {
      setDisplayed(prev =>
        isDeleting ? prev.slice(0, -1) : phrase.slice(0, prev.length + 1)
      )
    }, delay)

    return () => clearTimeout(timeoutRef.current)
  }, [displayed, isDeleting, phraseIdx])

  return (
    <span className="inline-flex items-center flex-wrap gap-1">
      <span
        style={{
          display: 'inline-block',
          background: `linear-gradient(90deg, ${ACCENT_VIOLET}, ${ACCENT_TEAL})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          color: ACCENT_VIOLET, // Fallback for browsers that don't support text gradients
          minHeight: '1.2em',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {displayed || '\u00A0'}
      </span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.55, ease: 'easeInOut' }}
        style={{ 
          color: ACCENT_VIOLET, 
          marginLeft: '2px',
          display: 'inline-block',
        }}
      >
        |
      </motion.span>
    </span>
  )
}

// ─── Scroll indicator ────────────────────────────────────────────────────────
function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2.2, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
        Scroll
      </span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        style={{
          width: 22,
          height: 36,
          border: '1.5px solid rgba(124,58,237,0.4)',
          borderRadius: 12,
          display: 'flex',
          justifyContent: 'center',
          paddingTop: 6,
        }}
      >
        <motion.div
          animate={{ y: [0, 10, 0], opacity: [1, 0, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          style={{
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: ACCENT_VIOLET,
          }}
        />
      </motion.div>
    </motion.div>
  )
}

// ─── Badge chips above headline ──────────────────────────────────────────────
function HeroBadge({ label, color }) {
  return (
    <span
      style={{
        border: `1px solid ${color}44`,
        color: color,
        background: `${color}12`,
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        padding: '3px 10px',
        borderRadius: 999,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  )
}

// ─── Canvas loading fallback ─────────────────────────────────────────────────
function CanvasFallback() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `radial-gradient(ellipse at center, #1a0a3d 0%, ${BG_DEEP} 70%)`,
      }}
    />
  )
}

// ─── Stats strip ─────────────────────────────────────────────────────────────
const STATS = [
  { value: '250+', label: 'Experiences' },
  { value: '60+',  label: 'Companies' },
  { value: '4',    label: 'AI Models' },
  { value: '100+', label: 'Students' },
]

function StatStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.6, duration: 0.7 }}
      className="flex items-center gap-6 md:gap-10 mt-12 flex-wrap justify-center md:justify-start"
    >
      {STATS.map((s, i) => (
        <div key={s.label} className="flex flex-col items-center md:items-start">
          <span
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              background: i % 2 === 0
                ? `linear-gradient(135deg, white, rgba(255,255,255,0.6))`
                : `linear-gradient(135deg, ${ACCENT_TEAL}, ${ACCENT_VIOLET})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {s.value}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.38)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em' }}>
            {s.label}
          </span>
        </div>
      ))}

      {/* Dividers */}
      {STATS.map((_, i) =>
        i < STATS.length - 1 ? (
          <div
            key={`div-${i}`}
            className="hidden md:block"
            style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }}
          />
        ) : null
      )}
    </motion.div>
  )
}

// ─── Reduce motion check ─────────────────────────────────────────────────────
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = (e) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const reducedMotion = useReducedMotion()
  const mouse = useRef({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)

  // Check mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Track mouse for 3D
  useEffect(() => {
    const onMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  const goToSearch = () => navigate(user ? '/search' : '/auth')
  const goToQA     = () => navigate(user ? '/qa'     : '/auth')

  // Stagger variants
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12 } },
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
  }

  return (
    <section
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: `radial-gradient(ellipse 80% 60% at 50% -10%, #1e0a4e 0%, ${BG_DEEP} 60%)`,
        fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
      }}
    >
      {/* — Grain texture overlay — */}
      <div style={GRAIN_STYLE} aria-hidden />

      {/* — Subtle radial glow — */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 55% 45% at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 20%, rgba(13,148,136,0.06) 0%, transparent 60%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* — 3D Canvas — */}
      {!reducedMotion && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            opacity: isMobile ? 0.5 : 1,
          }}
        >
          <Suspense fallback={<CanvasFallback />}>
            <Canvas
              dpr={[1, isMobile ? 1 : 1.2]}
              camera={{ position: [0, 0, 6], fov: 55 }}
              gl={{ antialias: true, alpha: true }}
              style={{ background: 'transparent' }}
              performance={{ min: 0.5 }}
            >
              <Scene mouse={mouse} />
            </Canvas>
          </Suspense>
        </div>
      )}

      {/* — Mobile static gradient glow (when 3D is simplified) — */}
      {(reducedMotion || isMobile) && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -60%)',
            background: `radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      {/* — Content — */}
      <div
        style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ maxWidth: 680 }}
        >
          {/* — Badges — */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2 mb-6">
            <HeroBadge label="AI-Powered" color={ACCENT_VIOLET} />
            <HeroBadge label="RAG + Gemini" color={ACCENT_TEAL} />
            <HeroBadge label="XGBoost Difficulty" color={ACCENT_GOLD} />
          </motion.div>

          {/* — Headline — */}
          <motion.h1
            variants={itemVariants}
            style={{
              fontSize: 'clamp(2.6rem, 5.5vw, 4.2rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: 'rgba(255,255,255,0.95)',
              marginBottom: '0.5rem',
            }}
          >
            The placement archive
            <br />
            <span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.5)', fontSize: '90%' }}>
              that lets you
            </span>
          </motion.h1>

          {/* — Typewriter — */}
          <motion.div
            variants={itemVariants}
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              marginBottom: '1.5rem',
              minHeight: '1.3em',
            }}
          >
            {reducedMotion ? (
              <span
                style={{
                  background: `linear-gradient(90deg, ${ACCENT_VIOLET}, ${ACCENT_TEAL})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Find interview experiences
              </span>
            ) : (
              <Typewriter />
            )}
          </motion.div>

          {/* — Sub-copy — */}
          <motion.p
            variants={itemVariants}
            style={{
              fontSize: '1.05rem',
              color: 'rgba(255,255,255,0.48)',
              lineHeight: 1.75,
              maxWidth: 520,
              marginBottom: '2.5rem',
              fontWeight: 400,
            }}
          >
            Real interview experiences from VRSEC students — auto-tagged by AI,
            semantically searchable, with a RAG chatbot grounded in your peers' stories.
            Know exactly where your gaps are before the placement season begins.
          </motion.p>

          {/* — CTAs — */}
          <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
            <MagneticButton primary onClick={goToQA}>
              {/* Spark icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Ask the Archive
            </MagneticButton>

            <MagneticButton onClick={goToSearch}>
              {/* Search icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              Browse Experiences
            </MagneticButton>
          </motion.div>

          {/* — Stats — */}
          <StatStrip />
        </motion.div>
      </div>

      {/* — Scroll indicator — */}
      {!reducedMotion && <ScrollIndicator />}

      {/* — Bottom fade — */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 180,
          background: `linear-gradient(to bottom, transparent, ${BG_DEEP})`,
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />
    </section>
  )
}
