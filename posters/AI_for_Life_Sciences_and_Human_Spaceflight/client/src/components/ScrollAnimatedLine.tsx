import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollAnimatedLine() {
  // Ancho/alto de viewport reactivos (se actualizan con resize/zoom)
  const [vw, setVw] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1920
  );
  const [vh, setVh] = useState(
    typeof window !== "undefined" ? window.innerHeight : 1080
  );

  useEffect(() => {
    const onResize = () => {
      setVw(window.innerWidth);
      setVh(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { scrollYProgress } = useScroll();

  // Centro horizontal real y amplitud de la curva
  const centerX = vw / 2;
  const flowWidth = Math.min(600, vw * 0.4); // abre/cierra la S respecto del centro

  // Y fijos (según tu layout/scroll actual)
  const startY = 1100;
  const midY = 1700;
  const endY = 2300;

  // X centrados y SIMÉTRICOS respecto del centro
  const midX = centerX;
  const startX = centerX - flowWidth * 0.5;
  const endX = centerX + flowWidth * 0.5;

  // Curva S suave y simétrica
  const pathD = `
    M ${startX} ${startY}
    C ${startX + flowWidth * 0.3} ${startY + 200},
      ${midX - flowWidth * 0.3} ${midY - 200},
      ${midX} ${midY}
    C ${midX + flowWidth * 0.3} ${midY + 200},
      ${endX - flowWidth * 0.3} ${endY - 200},
      ${endX} ${endY}
  `;

  // Animación del "dibujo" con el scroll
  const pathLengthValue = useTransform(scrollYProgress, [0.15, 0.45, 0.7], [0, 0.5, 1]);

  // Longitud real del path para el dash
  const [pathLength, setPathLength] = useState(0);
  useEffect(() => {
    const path = document.querySelector<SVGPathElement>("#animated-scroll-path");
    if (path) setPathLength(path.getTotalLength());
  }, [vw, vh, pathD]);

  const dashOffset = useTransform(pathLengthValue, (v) => pathLength * (1 - v));

  // ViewBox responsive para que el SVG escale correctamente
  const svgHeight = Math.max(vh, endY + 200);

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${vw} ${svgHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.2)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 1)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0.2)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          id="animated-scroll-path"
          d={pathD}
          stroke="url(#line-gradient)"
          strokeWidth="4"
          fill="none"
          filter="url(#glow)"
          strokeLinecap="round"
          strokeDasharray={pathLength}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
    </div>
  );
}
