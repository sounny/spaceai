import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import logoImage from "@assets/AI Poster Logo (2)_1762704396121.png";
import { PiPlanetFill } from "react-icons/pi";
import { GiRingedPlanet } from "react-icons/gi";

interface IntroductionSectionProps {
  title?: string;
  content: React.ReactNode;
  logoIcon: React.ReactNode;
}

export default function IntroductionSection({ content, logoIcon }: IntroductionSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-start gap-8">
          {/* Text content - 3/4 width */}
          <div className="flex-[3] relative">
            <div className="absolute -right-4 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-accent to-transparent rounded-full" />
            
            <div className="text-right pr-8">
              <motion.h2 
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-3xl md:text-[40px] font-bold mb-8 text-white"
                style={{ fontFamily: "Arial, sans-serif" }}
                data-testid="text-introduction-title"
              >
                Introduction
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg text-white leading-relaxed md:text-[20px]" 
                data-testid="text-introduction-content"
              >
                {content}
              </motion.p>
            </div>
          </div>

          {/* Icon - 1/2 width */}
          <motion.div 
            className="flex-[1] flex items-center justify-center pt-26 md:pt-10 lg:pt-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 0.9, scale: 1.1 } : { opacity: 1, scale: 1.0 }}
            transition={{ duration: 1, delay: 0.9 }}
          >
            {/* Wrapper sin semántica de botón */}
            <div
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{ width: 120, height: 120 }} // tamaño base del área "hover"
            >
              {/* Capa 1: Ícono (solo en reposo) */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: isHovered ? 0 : 1, scale: isHovered ? 0.9 : 1 }}
                transition={{ duration: 0.25 }}
              >
                {/* Usá tu icono; de ejemplo, PiPlanetFill de react-icons */}
                {/* import { PiPlanetFill } from "react-icons/pi"; */}
                <GiRingedPlanet className="w-64 h-64 md:w-200 md:h-200 text-accent" aria-hidden="true" />

              </motion.div>

              {/* Capa 2: Círculo expansivo con texto (aparece en hover) */}
              <motion.div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden flex items-center justify-center p-3"
                initial={false}
                animate={{
                  width: isHovered ? 200 : 0,              // diámetro al expandir
                  height: isHovered ? 200 : 0,
                  borderRadius: isHovered ? 9999 : 0,
                  backgroundColor: isHovered ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0)",
                  borderWidth: isHovered ? 4 : 0,
                  borderColor: "hsl(var(--accent))",
                  boxShadow: isHovered
                    ? "0 0 40px rgba(104,245,213,0.6), 0 0 80px rgba(104,245,213,0.4)"
                    : "0 0 0 rgba(0,0,0,0)",
                }}
                transition={{ type: "spring", stiffness: 260, damping: 22 }}
                style={{ borderStyle: "solid" }}
              >
                <motion.p
                  className="text-center leading-snug text-[14px] md:text-[14px] px-4 max-w-[90%] break-words text-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.25, delay: isHovered ? 0.08 : 0 }}
                >
                  <em>
                    Communication delays from the Martian surface to Earth can reach 20+ minutes...
                  </em>
                </motion.p>
              </motion.div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
