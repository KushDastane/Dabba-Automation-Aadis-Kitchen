import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHome, FiSettings } from "react-icons/fi";
import { FaPeopleGroup } from "react-icons/fa6";
import { PiCreditCard } from "react-icons/pi";
import { IoRestaurantOutline } from "react-icons/io5";
import { BiFoodMenu } from "react-icons/bi";

const nav = [
  { label: "Dashboard", path: "/", icon: FiHome },
  { label: "Orders", path: "/orders", icon: IoRestaurantOutline },
  { label: "Menu", path: "/menu", icon: BiFoodMenu },
  { label: "Payments", path: "/payments", icon: PiCreditCard },
  { label: "Kitchen", path: "/kitchen", icon: FiSettings },
  { label: "Students", path: "/students", icon: FaPeopleGroup },
];

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <aside className="hidden md:flex w-72 min-h-screen bg-[#fffaf2] border-r border-black/5">
      <div className="w-full px-4 py-6 flex flex-col">
        {/* BRAND */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-11 h-11 rounded-xl bg-yellow-400 flex items-center justify-center text-black font-bold shadow-sm">
            AK
          </div>
          <div>
            <p className="text-lg font-semibold leading-none text-gray-900">
              Aadi’s Kitchen
            </p>
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        {/* NAV */}
        <div className="relative flex flex-col gap-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="relative"
              >
                {/* Active pill */}
                {active && (
                  <motion.div
                    layoutId="admin-active-pill"
                    transition={{
                      type: "tween",
                      duration: 0.3,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="absolute inset-0 rounded-2xl bg-yellow-400/90 shadow-sm"
                  />
                )}

                <div
                  className={`relative cursor-pointer z-10 flex items-center gap-3 px-4 py-3 rounded-2xl transition-colors ${
                    active
                      ? "text-black font-medium"
                      : "text-gray-600 hover:bg-yellow-100/60"
                  }`}
                >
                  {/* Icon */}
                  <motion.div
                    animate={{
                      x: active ? 2 : 0,
                      opacity: active ? 1 : 0.75,
                    }}
                    transition={{
                      duration: 0.25,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Icon size={18} strokeWidth={active ? 2.2 : 2} />
                  </motion.div>

                  {/* Label */}
                  <span className="text-sm">{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* FOOTER (optional, feels premium) */}
        <div className="mt-50 px-2 pt-6">
          <div className="rounded-2xl bg-white/70 backdrop-blur px-4 py-3 text-xs text-gray-500 shadow-sm">
            Logged in as{" "}
            <span className="font-medium text-gray-800">Admin</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
