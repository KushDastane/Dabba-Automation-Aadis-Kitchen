import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiClock, FiUser } from "react-icons/fi";
import { PiBowlFoodLight } from "react-icons/pi";
import { PiCreditCard } from "react-icons/pi";


const navItems = [
  { label: "Home", path: "/", icon: FiHome },
  { label: "Order", path: "/order", icon: PiBowlFoodLight },
  { label: "History", path: "/history", icon: FiClock },
  { label: "Khata", path: "/khata", icon: PiCreditCard },
  { label: "Profile", path: "/profile", icon: FiUser },
];

export default function StudentBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-3 left-0 right-0 z-50">
      <div className="mx-auto max-w-md px-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl px-3 py-3 flex justify-between shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.965 }}
                className="relative flex-1 flex flex-col items-center justify-center"
              >
                {/* ICON — LIQUID MOTION */}
                <motion.div
                  animate={{
                    y: active ? [-0.5, -2, -1.6] : [-1.6, -0.8, 0],
                    color: active ? "#1f2937" : "#9ca3af",
                    opacity: active ? 1 : 0.85,
                  }}
                  transition={{
                    duration: active ? 0.32 : 0.38,
                    ease: [0.16, 1, 0.3, 1], // ultra-liquid easeOutExpo-ish
                  }}
                >
                  <Icon size={22} strokeWidth={active ? 2.2 : 2} />
                </motion.div>

                {/* LABEL */}
                <AnimatePresence>
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{
                        duration: 0.2,
                        ease: [0.4, 0.0, 0.2, 1],
                      }}
                      className="text-[11px] mt-0.5 font-medium text-gray-800"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* UNDERLINE */}
                {active && (
                  <motion.div
                    layoutId="nav-underline"
                    transition={{
                      type: "tween",
                      duration: 0.25,
                      ease: [0.4, 0.0, 0.2, 1],
                    }}
                    className="absolute -bottom-1.5 w-5 h-[2.5px] rounded-full bg-yellow-400"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
