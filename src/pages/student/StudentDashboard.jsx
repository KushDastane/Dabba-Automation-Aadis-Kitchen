import { useEffect, useState } from "react";
import { useAuthUser } from "../../hooks/useAuthUser";
import PageHeader from "../../components/layout/PageHeader";
import OrderStatusCard from "../../components/cards/OrderStatusCard";
import BalanceCard from "../../components/cards/BalanceCard";
import { getCurrentMealSlot } from "../../services/menuService";
import { getStudentBalance } from "../../services/balanceService";
import { getTodayStudentOrder } from "../../services/orderService";

export default function StudentDashboard() {
  const { authUser, profile } = useAuthUser();

  const [loading, setLoading] = useState(true);
  const [ledgerSummary, setLedgerSummary] = useState(null);
  const [orderStatus, setOrderStatus] = useState("Not Placed");
  const mealSlot = getCurrentMealSlot();

  useEffect(() => {
    if (!authUser) return;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const summary = await getStudentBalance(authUser.uid);
        setLedgerSummary(summary);

        const todayOrder = await getTodayStudentOrder(authUser.uid);
        setOrderStatus(todayOrder?.status ?? "Not Placed");
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [authUser]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="pb-24">
      <PageHeader name={profile?.name} />

      <OrderStatusCard
        meal={mealSlot === "lunch" ? "Lunch" : "Dinner"}
        status={orderStatus}
      />

      <BalanceCard summary={ledgerSummary} />

      <button className="w-full bg-black text-white py-3 rounded-xl mt-3">
        Place Today’s Order
      </button>
    </div>
  );
}
