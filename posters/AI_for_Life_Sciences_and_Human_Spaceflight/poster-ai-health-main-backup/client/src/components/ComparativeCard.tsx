import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronDown, Bot, Sparkles } from "lucide-react";

interface ComparativeCardProps {
  title: string;
  description: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  isExpandable?: boolean;
  icon?: string;
  shortDescription?: string;
  expandedDescription?: string;
  bulletPoints?: string[];
  closureText?: string;
}

export default function ComparativeCard({ 
  title, 
  description, 
  isExpanded, 
  onToggle,
  isExpandable = true,
  icon,
  shortDescription,
  expandedDescription,
  bulletPoints,
  closureText
}: ComparativeCardProps) {
  const IconComponent = icon === "Bot" ? Bot : icon === "Sparkles" ? Sparkles : null;
  
  const displayDescription = !isExpanded && shortDescription ? shortDescription : description;
  
  return (
    <Card 
      className={`p-8 backdrop-blur-md bg-white/5 border border-cyan-500/30 transition-all duration-300 ${
        isExpandable ? 'cursor-pointer hover-elevate active-elevate-2 hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20' : 'hover-elevate hover:border-cyan-400/60 hover:shadow-lg hover:shadow-cyan-500/20'
      }`}
      onClick={isExpandable ? onToggle : undefined}
      data-testid={`card-comparative-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {IconComponent && !isExpanded && (
              <IconComponent className="w-8 h-8 text-cyan-400" 
              data-testid={`icon-${title.toLowerCase().replace(/\s+/g, '-')}`} />
            )}
            <h3 
              className="text-2xl font-semibold text-white md:text[24px]"
              style={{ fontFamily: "Arial, sans-serif" }}
              data-testid={`text-comparative-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {title}
            </h3>
          </div>
          
          {!isExpanded ? (
            <p className="text-cyan-200" data-testid={`text-comparative-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
              {displayDescription}
            </p>
          ) : (
            <div className="space-y-4">
              {expandedDescription && (
                <p className="text-cyan-200">{expandedDescription}</p>
              )}
              {bulletPoints && bulletPoints.length > 0 && (
                <ul className="list-disc list-inside space-y-2 text-cyan-200 ml-4 md:text[24px]">
                  {bulletPoints.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
                </ul>
              )}
              {closureText && (
                <p className="text-cyan-200">{closureText}</p>
              )}
              {!bulletPoints && (
                <p className="text-cyan-200" data-testid={`text-comparative-description-${title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {displayDescription}
                </p>
              )}
            </div>
          )}
        </div>
        {isExpandable && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-cyan-400" />
          </motion.div>
        )}
      </div>
    </Card>
  );
}
