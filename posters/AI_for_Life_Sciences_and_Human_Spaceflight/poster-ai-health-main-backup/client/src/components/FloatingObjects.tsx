import { motion } from "framer-motion";
import earthImage from "@assets/generated_images/Earth_from_space_view_27c5fa91.png";

export default function FloatingObjects() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-5 overflow-hidden">
      <motion.div
        className="absolute top-20 right-10 w-24 h-24 opacity-30"
        animate={{
          y: [0, -30, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <img src={earthImage} alt="" className="w-full h-full object-contain" />
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-10 w-32 h-32 opacity-20"
        animate={{
          y: [0, 20, 0],
          rotate: [0, -15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500/40 to-blue-500/40 blur-xl" />
      </motion.div>

      <motion.div
        className="absolute top-1/2 left-1/4 w-20 h-20 opacity-25"
        animate={{
          y: [0, -25, 0],
          x: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-500/30 to-cyan-500/30 blur-lg" />
      </motion.div>
    </div>
  );
}
