import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import galaxyBg from "@assets/generated_images/Spiral_galaxy_starfield_78afc79e.png";

interface ConclusionsSectionProps {
  content: string;
}

export default function ConclusionsSection({ content }: ConclusionsSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      <div className="container mx-auto max-w-4xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h2 
            className="text-4xl md:text-5xl font-bold mb-8 text-white"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
            data-testid="text-conclusions-title"
          >
            Conclusions
          </h2>
          
          <p className="text-xl text-cyan-100 leading-relaxed mb-12" data-testid="text-conclusions-content">
            {content}
          </p>

          <motion.div
            className="inline-block px-8 py-3 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-semibold hover-elevate active-elevate-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            The Journey Continues
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
