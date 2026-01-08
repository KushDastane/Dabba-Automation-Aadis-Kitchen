import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiClock, FiArrowRight } from "react-icons/fi";

import { useAuthUser } from "../../hooks/useAuthUser";
import PageHeader from "../../components/layout/PageHeader";
import { getCurrentMealSlot } from "../../services/menuService";
import { getStudentBalance } from "../../services/balanceService";
import { getTodayStudentOrder } from "../../services/orderService";
import { getStudentLedger } from "../../services/ledgerService";
import { getKitchenConfig } from "../../services/kitchenService";
import { isAfterTime, isBeforeTime } from "../../utils/timeUtils";
import { getCurrentWeekDates } from "../../utils/weekUtils";

export default function StudentDashboard() {
  const { authUser, profile } = useAuthUser();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [todayOrder, setTodayOrder] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [kitchen, setKitchen] = useState(null);

  const mealSlot = getCurrentMealSlot(); // lunch | dinner

  useEffect(() => {
    if (!authUser) return;

    const load = async () => {
      setLoading(true);
      try {
        setBalance(await getStudentBalance(authUser.uid));
        setTodayOrder(await getTodayStudentOrder(authUser.uid));
        setLedger(await getStudentLedger(authUser.uid));
        setKitchen(await getKitchenConfig());
      } catch (e) {
        console.error("Dashboard load failed", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authUser]);

  if (loading) {
    return <p className="text-center mt-10">Loading dashboard…</p>;
  }

  /* =========================
     KITCHEN STATUS
  ========================= */
  let kitchenStatusText = "Kitchen Open";
  let kitchenStyle = "bg-green-100 text-green-800";

  if (kitchen?.holiday?.active) {
    kitchenStatusText = `Kitchen Holiday (${kitchen.holiday.from} → ${kitchen.holiday.to})`;
    kitchenStyle = "bg-yellow-100 text-yellow-800";
  } else if (isAfterTime("21:00") || isBeforeTime("07:00")) {
    kitchenStatusText = "Kitchen Closed · Opens at 7:00 AM";
    kitchenStyle = "bg-gray-200 text-gray-700";
  }

  /* =========================
     ORDER / CUTOFF LOGIC
  ========================= */
  const lunchClosed = isAfterTime("13:00");
  const dinnerClosed = isAfterTime("20:00");

  const orderingClosed = mealSlot === "lunch" ? lunchClosed : dinnerClosed;

  /* =========================
     WEEKLY SUMMARY
  ========================= */
  const weekDates = getCurrentWeekDates();
  const orderedDays = new Set(
    ledger
      .filter((l) => l.source === "ORDER")
      .map((l) => l.createdAt?.toDate?.().toISOString().split("T")[0])
  );

return (
  <div className="pb-28 space-y-6">
    {/* HEADER */}
    <PageHeader name={profile?.name} />

    {/* KITCHEN STATUS */}
    <div
      className={`rounded-2xl px-4 py-3 text-sm font-medium flex items-center gap-2 ${kitchenStyle}`}
    >
      {kitchenStatusText}
    </div>

    {/* TODAY + WALLET */}
    <div className="grid gap-4 md:grid-cols-3">
      {/* TODAY ORDER */}
      <div className="bg-white rounded-2xl p-5 shadow-sm md:col-span-2">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {todayOrder?.status === "CONFIRMED"
                ? "OUT FOR DELIVERY"
                : "NOT PLACED"}
            </span>

            <h3 className="text-lg font-semibold mt-3">
              Today’s {mealSlot === "lunch" ? "Lunch" : "Dinner"}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {todayOrder
                ? `Status: ${todayOrder.status}`
                : orderingClosed
                ? "Ordering closed for today"
                : "You haven’t placed an order yet"}
            </p>
          </div>

          <div className="text-2xl">
            {todayOrder?.status === "CONFIRMED" ? (
              <FiCheckCircle className="text-green-600" />
            ) : (
              <FiClock className="text-orange-500" />
            )}
          </div>
        </div>
      </div>

      {/* WALLET */}
      <div className="bg-gradient-to-br from-black to-neutral-900 rounded-2xl p-5 text-white shadow-md">
        <p className="text-xs opacity-80">Virtual Wallet</p>
        <h2 className="text-2xl font-bold mt-2">₹ {balance?.balance ?? 0}</h2>

        <p className="text-xs mt-1 text-green-400">
          Safe for {Math.floor((balance?.balance ?? 0) / 90)} meals
        </p>

        <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-xl transition">
          + Add Money
        </button>
      </div>
    </div>

    {/* PLAN AHEAD */}
    <div className="bg-white rounded-2xl p-5 shadow-sm flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">Tomorrow</p>
        <h4 className="font-semibold mt-1">Plan Ahead</h4>
        <p className="text-sm text-gray-500 mt-1">Order before 10 PM</p>
      </div>

      <button
        onClick={() => navigate("/order")}
        className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2"
      >
        Place Order <FiArrowRight />
      </button>
    </div>

    {/* WEEKLY ORDERS */}
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">This Week</h4>
        <button
          onClick={() => navigate("/menu")}
          className="text-sm text-yellow-600 font-medium"
        >
          View Menu
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center text-xs">
        {weekDates.map((d) => {
          const ordered = orderedDays.has(d);
          const isToday = d === new Date().toISOString().split("T")[0];

          return (
            <div
              key={d}
              className={`rounded-xl py-2 font-medium ${
                ordered
                  ? "bg-green-100 text-green-700"
                  : isToday
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {new Date(d).toLocaleDateString("en-IN", {
                weekday: "short",
              })}
            </div>
          );
        })}
      </div>
    </div>

    {/* PRIMARY ACTION */}
    <button
      disabled={orderingClosed && !todayOrder}
      onClick={() => navigate(todayOrder ? "/history" : "/order")}
      className={`w-full py-4 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 transition ${
        orderingClosed && !todayOrder
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-black text-white hover:bg-neutral-900"
      }`}
    >
      {todayOrder ? "View Today’s Order" : "Place Order"}
      <FiArrowRight />
    </button>
  </div>
);

}
