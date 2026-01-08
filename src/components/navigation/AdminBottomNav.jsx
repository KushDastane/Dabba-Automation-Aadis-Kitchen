import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiSettings } from "react-icons/fi";
import { BiFoodMenu } from "react-icons/bi";
import { PiCreditCard } from "react-icons/pi";
import { IoRestaurantOutline } from "react-icons/io5";

import { FaPeopleGroup } from "react-icons/fa6";
const navItems = [
  { label: "Home", path: "/", icon: FiHome },
  { label: "Orders", path: "/orders", icon: IoRestaurantOutline },
  { label: "Menu", path: "/menu", icon: BiFoodMenu },
  { label: "Payments", path: "/payments", icon: PiCreditCard },
  { label: "Settings", path: "/kitchen", icon: FiSettings },
  { label: "Students", path: "/students", icon: FaPeopleGroup },
];

export default function AdminBottomNav() {
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
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="relative flex-1 flex flex-col items-center justify-center"
              >
                {/* Icon – LIQUID */}
                <motion.div
                  animate={{
                    y: active ? [-0.5, -2, -1.6] : [-1.6, -0.8, 0],
                    color: active ? "#111827" : "#9ca3af",
                    opacity: active ? 1 : 0.85,
                  }}
                  transition={{
                    duration: active ? 0.32 : 0.38,
                    ease: [0.16, 1, 0.3, 1], // liquid inertia
                  }}
                >
                  <Icon size={22} strokeWidth={active ? 2.2 : 2} />
                </motion.div>

                {/* Label (active only) */}
                <AnimatePresence>
                  {active && (
                    <motion.span
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="text-[11px] mt-0.5 font-medium text-gray-900"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Underline indicator */}
                {active && (
                  <motion.div
                    layoutId="admin-nav-underline"
                    transition={{
                      type: "tween",
                      duration: 0.22,
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
