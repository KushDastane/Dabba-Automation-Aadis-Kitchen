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
    <div className="pb-28 space-y-4">
      <PageHeader name={profile?.name} />

      {/* KITCHEN STATUS */}
      <div className={`rounded-xl p-3 text-sm ${kitchenStyle}`}>
        {kitchenStatusText}
      </div>

      {/* TODAY ORDER STATUS */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Today’s {mealSlot === "lunch" ? "Lunch" : "Dinner"}
            </p>
            <h3 className="text-lg font-semibold mt-1">
              {todayOrder?.status ?? "Not Placed"}
            </h3>

            {!todayOrder && orderingClosed && (
              <p className="text-xs text-red-500 mt-1">
                Ordering closed for today
              </p>
            )}
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

      {/* BALANCE */}
      <div className="bg-yellow-100 rounded-xl p-4">
        <p className="text-sm text-gray-600">Current Balance</p>
        <h2 className="text-2xl font-bold mt-1">₹ {balance?.balance ?? 0}</h2>

        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>Credit: ₹{balance?.credit ?? 0}</span>
          <span>Debit: ₹{balance?.debit ?? 0}</span>
        </div>
      </div>

      {/* WEEKLY ORDERS */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium">This Week</p>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {weekDates.map((d) => (
            <div
              key={d}
              className={`rounded-lg py-2 ${
                orderedDays.has(d)
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {new Date(d).toLocaleDateString("en-IN", {
                weekday: "short",
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ACTION BUTTON */}
      <button
        disabled={orderingClosed && !todayOrder}
        onClick={() => navigate(todayOrder ? "/history" : "/order")}
        className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 ${
          orderingClosed && !todayOrder
            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
            : "bg-black text-white"
        }`}
      >
        {todayOrder ? "View Today’s Order" : "Place Order"}
        <FiArrowRight />
      </button>
    </div>
  );
}
