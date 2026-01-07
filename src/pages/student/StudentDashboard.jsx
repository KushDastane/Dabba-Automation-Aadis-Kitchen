import { useEffect, useState } from "react";
import { useAuthUser } from "../../hooks/useAuthUser";
import PageHeader from "../../components/layout/PageHeader";
import OrderStatusCard from "../../components/cards/OrderStatusCard";
import BalanceCard from "../../components/cards/BalanceCard";

import { getStudentBalance } from "../../services/balanceService";
import { getTodayStudentOrder } from "../../services/orderService";

export default function StudentDashboard() {
  const { authUser, profile } = useAuthUser();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [orderStatus, setOrderStatus] = useState(null);

  useEffect(() => {
    if (!authUser) return;

    const loadDashboard = async () => {
      setLoading(true);

      try {
        const bal = await getStudentBalance(authUser.uid);
        setBalance(bal);

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
    <div>
      <PageHeader name={profile?.name} />

      <OrderStatusCard meal="Today" status={orderStatus} />

      <BalanceCard balance={balance} />

      <button className="w-full bg-black text-white py-3 rounded-xl mt-2">
        Place Today’s Order
      </button>
    </div>
  );
}
