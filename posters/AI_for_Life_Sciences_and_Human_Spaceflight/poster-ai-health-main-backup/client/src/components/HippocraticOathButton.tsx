import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import logoImage from "@assets/AI Poster Logo (2)_1762704396121.png";

interface HippocraticOathButtonProps {
  content: React.ReactNode;
  onOpen?: () => void;   // called when modal opens
  onClose?: () => void;  // called when modal closes
}

export default function HippocraticOathButton({
  content,
  onOpen,
  onClose
}: HippocraticOathButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    onOpen?.();           // 🔊 play audio
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) onOpen?.(); // 🔊 play again if re-opened
    else onClose?.();     // ⏹️ pause/rewind on close
  };

  return (
    <>
      <section className="py-80 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <motion.button
              onClick={handleOpen}                     
              className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-accent shadow-[0_0_40px_rgba(104,245,213,0.6),0_0_80px_rgba(104,245,213,0.4)] hover-elevate active-elevate-2 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid="button-hippocratic-oath"
            >
              <motion.div
                className="absolute inset-0"
                animate={{
                  boxShadow: [
                    "0 0 40px rgba(104,245,213,0.6), 0 0 80px rgba(104,245,213,0.4)",
                    "0 0 60px rgba(104,245,213,0.8), 0 0 100px rgba(104,245,213,0.6)",
                    "0 0 40px rgba(104,245,213,0.6), 0 0 80px rgba(104,245,213,0.4)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <img
                src={logoImage}
                alt="Hippocratic Oath"
                className="w-full h-full rounded-full object-cover"
                data-testid="img-oath-logo"
              />
            </motion.button>
          </motion.div>
        </div>
      </section>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}> {/* ✅ wire change */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto backdrop-blur-md bg-primary/30 border-2 border-accent shadow-[0_0_30px_rgba(104,245,213,0.6),0_0_60px_rgba(104,245,213,0.4),inset_0_0_20px_rgba(104,245,213,0.2)]">
            <div className="relative p-8">
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-accent/40 rounded-full blur-2xl animate-pulse" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-accent/40 rounded-full blur-2xl animate-pulse" />
              <div className="absolute top-1/2 left-0 w-2 h-80 bg-gradient-to-b from-transparent via-accent to-transparent rounded-full" />
              <div className="absolute top-1/2 right-0 w-2 h-80 bg-gradient-to-b from-transparent via-accent to-transparent rounded-full" />

              <DialogHeader>
                <DialogTitle
                  className="text-4xl md:text-5xl font-bold mb-8 text-white text-center"
                  style={{ fontFamily: "Arial, sans-serif" }}
                  data-testid="text-oath-title"
                >
                  Hippocratic Oath
                </DialogTitle>
                <DialogDescription className="text-lg text-accent text-center mb-4">
                  For Medical AI Agents in Deep Space
                  <><br />
                  <br /></>
                </DialogDescription>
              </DialogHeader>

              <div className="w-35 h-1 mx-auto mb-8 bg-gradient-to-r from-transparent via-accent to-transparent" />

              <div className="relative z-10 text-base text-card leading-relaxed whitespace-pre-line">
                {content}
              </div>
            </div>
          </DialogContent>
        </motion.div>
      </Dialog>
    </>
  );
}
