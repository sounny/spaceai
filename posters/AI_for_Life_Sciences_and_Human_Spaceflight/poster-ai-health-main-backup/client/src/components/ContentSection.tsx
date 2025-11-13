import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface ContentSectionProps {
  title: string;
  content: React.ReactNode;
}

export default function ContentSection({ title, content }: ContentSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center py-32 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-accent via-accent to-transparent rounded-full" />
          
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-3xl md:text-[40px] font-bold mb-8 text-white"
            style={{ fontFamily: "Arial, sans-serif" }}
            data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-title`}
          >
            {title}
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-[20px] text-white leading-relaxed" 
            data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-content`}
          >
            {content}
          </motion.p>
        </div>
      </div>
    </section>
  );
}
