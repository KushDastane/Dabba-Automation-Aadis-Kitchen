import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiClock, FiDollarSign, FiUsers, FiPackage } from "react-icons/fi";

import RecentOrdersPreview from "../../components/admin/RecentOrders";
import MealStatusBanner from "../../components/admin/MealStatusBanner";

import { listenToAdminStats } from "../../services/adminDashboardService";
import { confirmOrder } from "../../services/orderService";
import { getTodayMenu } from "../../services/menuService";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalOrders: 0,
    pendingPayments: 0,
    studentsToday: 0,
  });

  const [menuAvailable, setMenuAvailable] = useState(false);

  useEffect(() => {
    const unsub = listenToAdminStats(setStats);
    getTodayMenu().then((menu) => setMenuAvailable(!!menu));
    return () => unsub();
  }, []);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="min-h-screen bg-[#fffaf2]">
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
        <MealStatusBanner menuAvailable={menuAvailable} stats={stats} />
      </div>

      {/* MAIN GRID */}
      <div className="mx-4 md:mx-6 lg:mx-10 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* LEFT */}
        <div className="lg:col-span-4 space-y-4">
          <StatCard
            icon={FiClock}
            label="Pending Orders"
            value={stats.pendingOrders}
            danger={stats.pendingOrders > 0}
          />
          <StatCard
            icon={FiDollarSign}
            label="Pending Payments"
            value={stats.pendingPayments}
            warning={stats.pendingPayments > 0}
          />
          <StatCard
            icon={FiPackage}
            label="Total Orders Today"
            value={stats.totalOrders}
          />
          <StatCard
            icon={FiUsers}
            label="Students Ordered"
            value={stats.studentsToday}
          />
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-gray-900">
                  Live Orders
                </h3>
                <p className="text-xs text-gray-500">
                  Orders awaiting confirmation
                </p>
              </div>

              <button
                onClick={() => navigate("/orders")}
                className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-500 transition text-black text-sm font-semibold"
              >
                View All Orders
              </button>
            </div>

            <div className="flex-1">
              <RecentOrdersPreview onConfirm={confirmOrder} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* STAT CARD */
function StatCard({ icon: Icon, label, value, danger, warning }) {
  return (
    <div
      className={`rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm border
      ${
        danger
          ? "bg-red-50 border-red-200"
          : warning
          ? "bg-yellow-50 border-yellow-200"
          : "bg-white border-black/5"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
          ${
            danger
              ? "bg-red-100 text-red-700"
              : warning
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          <Icon size={18} />
        </div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </div>

      <p
        className={`text-2xl font-semibold ${
          danger
            ? "text-red-700"
            : warning
            ? "text-yellow-800"
            : "text-gray-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
