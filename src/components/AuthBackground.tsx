import { motion } from "framer-motion";

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 15 + 10,
  delay: Math.random() * 5,
  opacity: Math.random() * 0.3 + 0.05,
}));

export function AuthBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 dot-grid" />

      {/* Glowing blobs */}
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] rounded-full bg-primary/[0.14] blur-[180px]"
      />
      <motion.div
        animate={{ x: [0, -30, 25, 0], y: [0, 25, -35, 0], scale: [1, 0.9, 1.1, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent-cyan/[0.07] blur-[160px]"
      />
      <motion.div
        animate={{ x: [0, 50, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[50%] left-[60%] w-[400px] h-[400px] rounded-full bg-accent-gold/[0.04] blur-[140px]"
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -60, -120],
            x: [0, Math.random() * 40 - 20],
            opacity: [p.opacity, p.opacity * 1.5, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}

      {/* Animated wave SVGs */}
      <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden opacity-[0.06]">
        <motion.svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-[200%] h-full"
          animate={{ x: [0, -720] }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          preserveAspectRatio="none"
        >
          <path
            fill="hsl(var(--primary))"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,202.7C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,320L0,320Z"
          />
        </motion.svg>
        <motion.svg
          viewBox="0 0 1440 320"
          className="absolute bottom-0 w-[200%] h-full opacity-50"
          animate={{ x: [-720, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          preserveAspectRatio="none"
        >
          <path
            fill="hsl(var(--accent-cyan))"
            d="M0,288L48,272C96,256,192,224,288,213.3C384,203,480,213,576,229.3C672,245,768,267,864,261.3C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L0,320Z"
          />
        </motion.svg>
      </div>
    </div>
  );
}
