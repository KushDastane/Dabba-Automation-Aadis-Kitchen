import React from "react";
import { motion } from "framer-motion";
import { FiPlusCircle, FiTrendingUp } from "react-icons/fi";
import { FaBowlRice, FaBowlFood } from "react-icons/fa6";

/* PNG ICONS (public folder) */
const halfIcon = "/icon/half.png";
const fullIcon = "/icon/full.png";
const rotiIcon = "/icon/roti.png";
const dalIcon = "/icon/dal.png";

export default function CookingSummary({ summary, menu }) {
  console.log("CookingSummary props:", { summary, menu });
  const menuCards = [];

  if (summary && menu?.type === "ROTI_SABZI") {
    menuCards.push(
      {
        label: "Half Dabba",
        value: summary.halfDabba || 0,
        icon: halfIcon,
        gradient: "from-yellow-300 to-yellow-400",
      },
      {
        label: "Full Dabba",
        value: summary.fullDabba || 0,
        icon: fullIcon,
        gradient: "from-yellow-400 to-orange-400",
      }
    );
  }

  // Show OTHER items if they exist (regardless of menu type)
  if (summary && summary.otherItems) {
    console.log("otherItems found:", summary.otherItems);
    Object.entries(summary.otherItems).forEach(([itemName, qty]) => {
      if (qty > 0) {
        console.log("Adding OTHER card:", itemName, qty);
        menuCards.push({
          label: itemName,
          value: qty,
          icon: FiPlusCircle,
          gradient: "from-purple-300 to-pink-400",
        });
      }
    });
  }

  const normalizedExtras = {};
  if (summary) {
    Object.entries(summary.extraItems || {}).forEach(([name, qty]) => {
      const key = name.trim().toLowerCase();
      normalizedExtras[key] = (normalizedExtras[key] || 0) + qty;
    });
  }

  return (
    <div className="rounded-[32px] md:bg-[#faf9f6] md:p-6 md:shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)]">
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

      {!summary ? (
        <SummarySkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {menuCards.map((c) => (
            <SummaryCard key={c.label} {...c} />
          ))}

          {menu?.type === "ROTI_SABZI" && (
            <>
              <SummaryCard
                label="Total Rotis (Extra incl.)"
                value={summary.roti || 0}
                icon={rotiIcon}
                gradient="from-amber-300 to-yellow-500"
              />
              <SummaryCard
                label="Sabzi"
                value={summary.sabzi || 0}
                icon={FaBowlFood}
                gradient="from-green-300 to-emerald-400"
              />
              <SummaryCard
                label="Rice"
                value={summary.rice || 0}
                icon={FaBowlRice}
                gradient="from-sky-300 to-blue-400"
              />
              <SummaryCard
                label="Dal"
                value={summary.dal || 0}
                icon={dalIcon}
                gradient="from-orange-300 to-yellow-500"
              />
            </>
          )}

          {Object.entries(normalizedExtras).map(([key, qty]) => (
            <SummaryCard
              key={key}
              label={`Extra ${key}`}
              value={qty}
              icon={FiPlusCircle}
              gradient="from-pink-300 to-rose-400"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   SKELETON
========================= */

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[120px] rounded-3xl bg-gray-200/60 animate-pulse"
        />
      ))}
    </div>
  );
}

/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({ label, value, icon, gradient }) {
  const isImage = typeof icon === "string";

  return (
    <motion.div
      initial={false}
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="relative overflow-hidden rounded-3xl bg-white shadow-lg group"
    >
      <div
        className={`pointer-events-none absolute inset-0 opacity-0 
        group-hover:opacity-100 transition-opacity duration-300
        bg-gradient-to-br ${gradient}`}
      />

      <div className="relative p-5">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center
          bg-gradient-to-br ${gradient} shadow-md mb-3`}
        >
          {isImage ? (
            <img src={icon} alt={label} className="w-6 h-6 object-contain" />
          ) : (
            React.createElement(icon, {
              className: "text-xl text-black",
            })
          )}
        </div>

        <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>

        <motion.p
          key={value}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 0.25 }}
          className="text-3xl font-bold text-gray-900"
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
}
