import { motion } from "framer-motion";
import {
  FiBox,
  FiCoffee,
  FiPlusCircle,
  FiGrid,
  FiTrendingUp,
} from "react-icons/fi";

export default function CookingSummary({ summary, menu }) {
  if (!summary) return null;

  /* =========================
     MAIN MENU CARDS
  ========================= */
  const menuCards = [];

  if (menu?.type === "ROTI_SABZI") {
    menuCards.push(
      {
        label: "Half Dabba",
        value: summary.halfDabba || 0,
        icon: FiBox,
        gradient: "from-yellow-300 to-yellow-400",
      },
      {
        label: "Full Dabba",
        value: summary.fullDabba || 0,
        icon: FiBox,
        gradient: "from-yellow-400 to-orange-400",
      }
    );
  }

  if (menu?.type === "OTHER") {
    menuCards.push({
      label: menu.other.name,
      value: summary.otherItems?.[menu.other.name] || 0,
      icon: FiCoffee,
      gradient: "from-yellow-300 to-yellow-400",
    });
  }

  /* =========================
     NORMALIZE EXTRA ITEMS
  ========================= */
  const normalizedExtras = {};
  Object.entries(summary.extraItems || {}).forEach(([name, qty]) => {
    const key = name.trim().toLowerCase();
    normalizedExtras[key] = (normalizedExtras[key] || 0) + qty;
  });

  /* =========================
     OTHER ITEMS (IF NOT OTHER MENU)
  ========================= */
  const otherItems =
    menu?.type === "OTHER"
      ? []
      : Object.entries(summary.otherItems || {}).map(([name, qty]) => ({
          label: name,
          value: qty,
          icon: FiGrid,
          gradient: "from-emerald-300 to-green-400",
        }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-[32px] bg-[#faf9f6] p-6 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]"
    >
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-md">
          <FiTrendingUp className="text-xl text-black" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Cooking Summary
          </h3>
          <p className="text-xs text-gray-500">Confirmed Orders</p>
        </div>
      </div>
      {/* GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {menuCards.map((c, i) => (
          <SummaryCard key={c.label} {...c} delay={i * 0.05} />
        ))}

        {menu?.type === "ROTI_SABZI" && (
          <>
            <SummaryCard
              label="Rotis"
              value={summary.roti || 0}
              icon={FiGrid}
              gradient="from-amber-300 to-yellow-500"
            />
            <SummaryCard
              label="Sabzi"
              value={summary.sabzi || 0}
              icon={FiGrid}
              gradient="from-green-300 to-emerald-400"
            />
            <SummaryCard
              label="Dal"
              value={summary.dal || 0}
              icon={FiGrid}
              gradient="from-orange-300 to-yellow-500"
            />
            <SummaryCard
              label="Rice"
              value={summary.rice || 0}
              icon={FiGrid}
              gradient="from-sky-300 to-blue-400"
            />
          </>
        )}

        {otherItems.map((c, i) => (
          <SummaryCard key={c.label} {...c} delay={i * 0.05} />
        ))}

        {Object.entries(normalizedExtras).map(([key, qty], i) => (
          <SummaryCard
            key={key}
            label={`Extra ${key}`}
            value={qty}
            icon={FiPlusCircle}
            gradient="from-pink-300 to-rose-400"
            delay={i * 0.05}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({ label, value, icon: Icon, gradient, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 220 }}
      whileHover={{ y: -6, scale: 1.03 }}
      className="relative overflow-hidden rounded-3xl bg-white shadow-lg group"
    >
      {/* HOVER GLOW */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition
                    bg-gradient-to-br ${gradient}`}
      />

      {/* CONTENT */}
      <div className="relative p-5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br ${gradient} shadow-md mb-3`}
        >
          <Icon className="text-xl text-black" />
        </div>

        <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>

        <motion.p
          key={value}
          initial={{ scale: 0.85 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="text-3xl font-bold text-gray-900"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
}
