import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ComparativeCard from "./ComparativeCard";
import DetailItem from "./DetailItem";

interface DetailData {
  title: string;
  description: React.ReactNode;
  icon: string;
  bulletPoints?: React.ReactNode[];
  closureText?: React.ReactNode;
}


interface ComparativeSectionProps {
  title: string;
  comparatives: {
    title: string;
    description: React.ReactNode;
    details?: DetailData[];
    isExpandable?: boolean;
    icon?: string;
    shortDescription?: React.ReactNode;
    expandedDescription?: React.ReactNode;
    bulletPoints?: React.ReactNode[];
    closureText?: React.ReactNode;
  }[];
}

export default function ComparativeSection({ title, comparatives }: ComparativeSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const expandedComparative = expandedIndex !== null ? comparatives[expandedIndex] : null;

  return (
    <section className="relative min-h-screen py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <h2 
          className="text-4xl font-bold mb-16 text-center text-white md:text[40px]"
          style={{ fontFamily: "Arial, sans-serif" }}
          data-testid={`text-section-title-${title.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {title}
        </h2>

        <AnimatePresence mode="wait">
          {expandedIndex === null ? (
            <motion.div 
              key="grid-view"
              className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {comparatives.map((comparative, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ComparativeCard
                    title={comparative.title}
                    description={comparative.description}
                    isExpanded={false}
                    onToggle={() => handleToggle(index)}
                    isExpandable={true}
                    icon={comparative.icon}
                    shortDescription={comparative.shortDescription}
                    expandedDescription={comparative.expandedDescription}
                    bulletPoints={comparative.bulletPoints}
                    closureText={comparative.closureText}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key={`expanded-${expandedIndex}`}
              className="mb-8"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              <ComparativeCard
                title={comparatives[expandedIndex].title}
                description={comparatives[expandedIndex].description}
                isExpanded={true}
                onToggle={() => handleToggle(expandedIndex)}
                isExpandable={true}
                icon={comparatives[expandedIndex].icon}
                shortDescription={comparatives[expandedIndex].shortDescription}
                expandedDescription={comparatives[expandedIndex].expandedDescription}
                bulletPoints={comparatives[expandedIndex].bulletPoints}
                closureText={comparatives[expandedIndex].closureText}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {expandedComparative && expandedComparative.details && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {expandedComparative.details.map((detail, detailIndex) => (
                  <DetailItem
                    key={detailIndex}
                    title={detail.title}
                    description={detail.description}
                    icon={detail.icon}
                    index={detailIndex}
                    bulletPoints={detail.bulletPoints}
                    closureText={detail.closureText}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
