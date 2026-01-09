import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiDollarSign, FiUsers, FiPackage } from "react-icons/fi";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import CookingSummary from "../../components/admin/CookingSummary";
import { getCookingSummaryForCurrentMeal } from "../../services/cookingSummaryService";
import { motion } from "framer-motion";
import RecentOrdersPreview from "../../components/admin/RecentOrders";
import MealStatusBanner from "../../components/admin/MealStatusBanner";

import { listenToAdminStats } from "../../services/adminDashboardService";
import { confirmOrder } from "../../services/orderService";
import { resetMenuIfNeeded } from "../../services/menuService";
import {
  getEffectiveMenuDateKey,
  getEffectiveMealSlot,
} from "../../services/menuService";

export default function AdminDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    resetMenuIfNeeded();
  }, []);

  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalOrders: 0,
    pendingPayments: 0,
    studentsToday: 0,
  });

  const [menuData, setMenuData] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [cookingSummary, setCookingSummary] = useState(null);

  const dateKey = useMemo(() => getEffectiveMenuDateKey(), [currentTime]);
  const slot = useMemo(() => getEffectiveMealSlot(), [currentTime]);

  const menuAvailable = useMemo(() => {
    if (!slot) return false;
    if (!menuData) return false;

    const slotMenu = menuData[slot];
    if (!slotMenu) return false;

    return (
      typeof slotMenu === "object" &&
      slotMenu.type &&
      (slotMenu.rotiSabzi || slotMenu.other)
    );
  }, [menuData, slot]);

  useEffect(() => {
    const unsubStats = listenToAdminStats(setStats);

    let unsubMenu;
    if (slot) {
      unsubMenu = onSnapshot(
        doc(db, "menus", dateKey),
        (snap) => {
          const menu = snap.exists() ? snap.data() : null;
          setMenuData(menu);
        },
        (error) => {
          console.error("Menu listener error:", error);
          setMenuData(null);
        }
      );
    }

    return () => {
      unsubStats();
      if (unsubMenu) unsubMenu();
    };
  }, [dateKey, slot]);
  useEffect(() => {
    if (!slot) return;

    getCookingSummaryForCurrentMeal()
      .then(setCookingSummary)
      .catch(console.error);
  }, [slot, dateKey]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-[#fffaf2] pb-6">
      {/* HEADER */}
      <div className="px-4 md:px-6 lg:px-10 pt-6 mb-6">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{today}</p>
        <h1 className="text-2xl font-semibold text-gray-900">
          Kitchen Operations
        </h1>
        <p className="text-sm text-gray-600">
          Monitor orders, payments and daily activity
        </p>
      </div>

      {/* FULL WIDTH STATUS BANNER */}
      <div className="mx-4 md:mx-6 lg:mx-10">
        <MealStatusBanner
          menuAvailable={menuAvailable}
          stats={stats}
          slot={slot}
        />
        <div className="mx-4 md:mx-6 lg:mx-2 mt-6">
          <CookingSummary summary={cookingSummary} menu={menuData?.[slot]} />
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="mx-4 md:mx-6 lg:mx-10 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT STATS */}
        <div className="lg:col-span-4 space-y-5">
          <StatCard
            icon={FiClock}
            label="Pending Orders"
            value={stats.pendingOrders}
            variant={stats.pendingOrders > 0 ? "danger" : "normal"}
          />

          <StatCard
            icon={FiDollarSign}
            label="Pending Payments"
            value={stats.pendingPayments}
            variant={stats.pendingPayments > 0 ? "warning" : "normal"}
          />

          <StatCard
            icon={FiPackage}
            label="Total Orders Today"
            value={stats.totalOrders}
            variant="success"
          />

          <StatCard
            icon={FiUsers}
            label="Students Ordered"
            value={stats.studentsToday}
            variant="info"
          />
        </div>

        {/* RIGHT – LIVE ORDERS */}
        <div className="lg:col-span-8">
          <div className="h-full rounded-[32px] bg-[#faf9f6] p-6 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.25)] flex flex-col">
            {/* HEADER */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-400 shadow-md">
                  <FiPackage className="text-xl text-black" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Live Orders
                  </h3>
                  <p className="text-xs text-gray-500">
                    Orders awaiting confirmation
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/orders")}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500
                     hover:from-yellow-500 hover:to-yellow-600 transition
                     text-black text-sm font-semibold shadow-md"
              >
                View All Orders
              </button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 p-4">
              <RecentOrdersPreview onConfirm={confirmOrder} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* STAT CARD */
function StatCard({ icon: Icon, label, value, variant = "normal" }) {
  const variants = {
    normal: "from-gray-100 to-gray-200",
    danger: "from-red-300 to-rose-400",
    warning: "from-amber-300 to-yellow-400",
    success: "from-emerald-300 to-green-400",
    info: "from-sky-300 to-blue-400",
  };

  const gradient = variants[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6, scale: 1.03 }}
      className={`group relative rounded-3xl shadow-lg
                  bg-gradient-to-br ${gradient}`}
    >
      {/* INNER WHITE SURFACE */}
      <div
        className="relative m-[2px] rounded-[22px] bg-white p-5
                   transition-colors duration-300
                   group-hover:bg-white/80"
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center
                        bg-gradient-to-br ${gradient} shadow-md`}
          >
            <Icon className="text-xl text-black" />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600">{label}</p>

            <motion.p
              key={value}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="text-3xl font-bold text-gray-900"
            >
              {value}
            </motion.p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

