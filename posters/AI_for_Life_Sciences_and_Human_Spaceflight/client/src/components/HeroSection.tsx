import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import heroBackgroundImage from "@assets/green background.png";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface TeamMember {
  name: string;
  background: string;
  contact: string;
  contribution: string;
}

interface HeroSectionProps {
  title: string;
  teamMembers: TeamMember[];
}

export default function HeroSection({ title, teamMembers }: HeroSectionProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const [l1, l2] = title.includes("|") ? title.split("|") : [title, ""];
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Purple planet horizon background with zoom-in animation */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroBackgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      
      {/* Gradient overlay with fade-in animation */}
      <motion.div 
        className="absolute inset-0 z-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1f1f]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />
      
      {/* Content: Logo, Title, Buttons */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-8 md:pb-12 px-6">
        <div className="container mx-auto text-center space-y-12">
          
          {/* Title */}
          <motion.h1
            className="mt-0  font-bold text-white max-w-6xl md:max-w-7xl leading-[1.05] tracking-tight mx-auto text-[40px] md:text-[60px]"
            style={{ fontFamily: "Arial, sans-serif" }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <span className="block">{l1}</span>
            {l2 && <span className="block">{l2}</span>}
          </motion.h1>

          {/* Team member buttons */}
          <motion.div
            className="mt-2 md:mt-4 lg:mt-6 flex flex-wrap gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {teamMembers.map((member, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedMember(member)}
                className="px-6 py-3 rounded-md bg-white/10 backdrop-blur-md border border-white/20 text-white cursor-pointer hover:bg-white/20 transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                data-testid={`button-team-member-${index}`}
              >
                {member.name}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Team member dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="bg-background/95 backdrop-blur-lg border-cyan-500/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold" style={{ color: '#001454' }} data-testid="text-member-name">
              {selectedMember?.name}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Contact information for {selectedMember?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#001454' }}>Contribution</h3>
              <p className="text-foreground" data-testid="text-member-contribution">{selectedMember?.contribution}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#001454' }}>Background</h3>
              <p className="text-foreground" data-testid="text-member-profession">{selectedMember?.background}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1" style={{ color: '#001454' }}>Contact</h3>
              <p className="text-foreground" data-testid="text-member-contact">{selectedMember?.contact}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <motion.button
        onClick={scrollToNext}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 hover:text-white transition-colors z-20"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        data-testid="button-scroll-down"
      >
        <ChevronDown className="w-8 h-8" />
      </motion.button>
    </section>
  );
}
