import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import proposalBg from "@assets/generated_images/Purple_cosmic_gradient_background_eec28ed4.png";

interface ProposalSectionProps {
  content: string;
}

export default function ProposalSection({ content }: ProposalSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-48 px-6 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8 }}
        >
          <Card className="p-16 backdrop-blur-md bg-cyan-900/60 border-2 border-cyan-400 hover-elevate transition-all shadow-[0_0_30px_rgba(168,85,247,0.6),0_0_60px_rgba(168,85,247,0.4),inset_0_0_20px_rgba(168,85,247,0.2)]">
            <div className="relative">
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-cyan-500/40 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-cyan-400/40 rounded-full blur-2xl animate-pulse" />
              <div className="absolute top-1/2 left-0 w-2 h-24 bg-gradient-to-b from-transparent via-cyan-400 to-transparent rounded-full" />
              <div className="absolute top-1/2 right-0 w-2 h-24 bg-gradient-to-b from-transparent via-cyan-400 to-transparent rounded-full" />
              
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold mb-8 text-black text-center"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
                data-testid="text-proposal-title"
              >
                Hippocratic Oath
              </motion.h2>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="w-24 h-1 mx-auto mb-8 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              />
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-xl text-cyan-50 leading-relaxed text-center" 
                data-testid="text-proposal-content"
              >
                {content}
              </motion.p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
