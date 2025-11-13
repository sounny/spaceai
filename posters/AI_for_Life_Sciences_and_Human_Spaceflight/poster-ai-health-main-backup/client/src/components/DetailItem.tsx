import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Scale, Users, AlertCircle, Clock, BarChart, Cpu, LucideIcon, Handshake } from "lucide-react";

interface DetailItemProps {
  title: string;
  description: string;
  icon: string;
  index: number;
  bulletPoints?: React.ReactNode[];
  closureText?: React.ReactNode;
}

const iconMap: Record<string, LucideIcon> = {
  Scale: Scale,
  Users: Users,
  AlertCircle: AlertCircle,
  Clock: Clock,
  BarChart: BarChart,
  Cpu: Cpu,
  Handshake: Handshake,
};

export default function DetailItem({ title, description, icon, index,  bulletPoints, closureText }: DetailItemProps) {
  const IconComponent = iconMap[icon] || AlertCircle;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
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
      <Card className="overflow-visible h-full hover-elevate active-elevate-2 transition-all backdrop-blur-md bg-white/5 border border-cyan-500/30 hover:border-cyan-400/60 pt-20 hover:shadow-2xl hover:shadow-cyan-500/40" data-testid={`card-detail-${title.toLowerCase().replace(/\s+/g, '-')}`}>
        <div className="p-6">
          <h4 
            className="text-xl font-semibold mb-3 text-white text-center"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
            data-testid={`text-detail-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {title}
          </h4>
          <p className="text-sm text-cyan-200 text-center" data-testid={`text-detail-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {description}
          </p>
        </div>
        {bulletPoints && bulletPoints.length > 0 && (
          <ul className="mt-4 space-y-2 list-disc list-inside text-cyan-100">
            {bulletPoints.map((bp, i) => (
              <li key={i}>{bp}</li>
            ))}
          </ul>
        )}

        {closureText && (
          <p className="mt-4 text-cyan-200/90">
            {closureText}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
