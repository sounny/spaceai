import { motion } from "framer-motion";

interface Particle {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
}

export default function SpaceBackground() {
  const particles: Particle[] = Array.from({ length: 500 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2.5 + 0.5,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-b from-[#001454] via-[#0f2d2d] to-[#0a1f1f]">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          style={{
            left: particle.left,
            top: particle.top,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.8, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
