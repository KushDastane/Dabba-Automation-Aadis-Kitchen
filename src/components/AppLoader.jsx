import { motion } from "framer-motion";
import { FaUtensils } from "react-icons/fa";

export default function AppLoader() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center gap-4">
        {/* Animated icon container */}
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-white shadow-lg"
          animate={{
            rotate: 360,
            scale: [1, 1.15, 1],
          }}
          transition={{
            rotate: {
              repeat: Infinity,
              duration: 2,
              ease: "linear",
            },
            scale: {
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut",
            },
          }}
        >
          <FaUtensils size={28} />
        </motion.div>

        {/* Animated text */}
        <motion.p
          className="text-sm font-medium text-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          Preparing your feast…
        </motion.p>
      </div>
    </div>
  );
}
