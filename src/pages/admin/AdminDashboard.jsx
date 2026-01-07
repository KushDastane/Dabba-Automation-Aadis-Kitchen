import { useEffect, useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import MealStatusBanner from "../../components/admin/MealStatusBanner";
import AdminStatCard from "../../components/admin/AdminStatCard";
import RecentOrdersPreview from "../../components/admin/RecentOrders";
import AdminQuickActions from "../../components/admin/AdminQuickActions";

import { listenToAdminStats } from "../../services/adminDashboardService";
import { confirmOrder } from "../../services/orderService";
import { getTodayMenu } from "../../services/menuService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalOrders: 0,
    pendingPayments: 0,
    studentsToday: 0,
  });

  const [menuAvailable, setMenuAvailable] = useState(false);

  useEffect(() => {
    const unsub = listenToAdminStats(setStats);

    getTodayMenu().then((menu) => {
      setMenuAvailable(!!menu);
    });

    return () => unsub();
  }, []);

  return (
    <div className="pb-24">
      <PageHeader name="Admin Dashboard" />

      <MealStatusBanner menuAvailable={menuAvailable} />

      <div className="grid grid-cols-2 gap-3">
        <AdminStatCard
          label="Pending Orders"
          value={stats.pendingOrders}
          highlight
        />
        <AdminStatCard label="Total Orders Today" value={stats.totalOrders} />
        <AdminStatCard label="Pending Payments" value={stats.pendingPayments} />
        <AdminStatCard label="Students Ordered" value={stats.studentsToday} />
      </div>

      <RecentOrdersPreview onConfirm={confirmOrder} />

      <AdminQuickActions />
    </div>
  );
}
