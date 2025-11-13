import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Heart, Brain, Shield, Telescope, LucideIcon } from "lucide-react";

interface GridItemData {
  title: string;
  icon: string;
}

interface GridSectionProps {
  title: string;
  introduction: string;
  items: GridItemData[];
}

const iconMap: Record<string, LucideIcon> = {
  Heart: Heart,
  Brain: Brain,
  Shield: Shield,
  Telescope: Telescope
};

export default function GridSection({ title, introduction, items }: GridSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-6 text-center text-white"
          style={{ fontFamily: "Space Grotesk, sans-serif" }}
          data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-title`}
        >
          {title}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg text-cyan-100 mb-16 text-center max-w-3xl mx-auto"
          data-testid={`text-${title.toLowerCase().replace(/\s+/g, '-')}-intro`}
        >
          {introduction}
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon] || Heart;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative pt-16"
              >
                {/* Icon positioned outside/above the card */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-900 flex items-center justify-center border-4 border-cyan-400/50 shadow-xl shadow-cyan-500/50 transition-shadow">
                    <IconComponent className="w-14 h-14 text-white" strokeWidth={1.5} />
                  </div>
                </div>
                
                {/* Card content */}
                <Card className="overflow-visible h-full hover-elevate active-elevate-2 transition-all backdrop-blur-md bg-white/5 border border-cyan-500/30 hover:border-cyan-400/60 pt-20 hover:shadow-2xl hover:shadow-cyan-500/40" data-testid={`card-grid-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="p-6">
                    <h4 
                      className="text-xl font-semibold text-white text-center"
                      style={{ fontFamily: "Space Grotesk, sans-serif" }}
                      data-testid={`text-grid-title-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.title}
                    </h4>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
