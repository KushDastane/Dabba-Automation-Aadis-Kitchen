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

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };


return (
  <div className="pb-28 space-y-6 bg-[#fffaf2] min-h-screen px-1">
    {/* HERO GREETING – FULL BLEED */}
    <div className="-mx-4 mt-0 md:mt-3 bg-gradient-to-br from-yellow-100 via-[#fff3c4] to-[#fffaf2] rounded-b-3xl">
      <div className="px-5 py-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {getGreeting()}, {profile?.name} 👋
        </h2>
        <p className="text-sm text-gray-700 mt-1">
          {mealSlot === "lunch"
            ? "Plan your lunch!"
            : "Plan your dinner!"}
        </p>
      </div>
    </div>

    {/* KITCHEN STATUS */}
    <div
      className={`mx-3 rounded-2xl px-4 py-3 text-sm font-medium ${kitchenStyle}`}
    >
      {kitchenStatusText}
    </div>

    {/* TODAY'S MEAL CARD */}
    <div className="mx-3 bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
            TODAY’S {mealSlot.toUpperCase()}
          </span>

          <h3 className="text-lg font-semibold mt-3">
            {todayOrder ? "Meal Confirmed 🍱" : "No Order Placed"}
          </h3>

          <p className="text-sm text-gray-600 mt-1">
            {todayOrder
              ? "Your tiffin is being prepared with care."
              : orderingClosed
              ? "Ordering is closed for today."
              : "Place your order before cutoff time."}
          </p>
        </div>

        <div className="text-2xl mt-1">
          {todayOrder?.status === "CONFIRMED" ? (
            <FiCheckCircle className="text-green-600" />
          ) : (
            <FiClock className="text-orange-500" />
          )}
        </div>
      </div>
    </div>

    {/* WALLET — SOFTER, APP-LIKE */}
    <div className="mx-3 bg-gradient-to-br from-[#1c1c1c] to-[#2b2b2b] rounded-3xl p-5 text-white shadow-md">
      <p className="text-xs opacity-80">Your Wallet Balance</p>
      <h2 className="text-2xl font-bold mt-2">₹ {balance?.balance ?? 0}</h2>

      <p className="text-xs mt-1 text-green-400">
        Enough for approx. {Math.floor((balance?.balance ?? 0) / 90)} meals
      </p>

      <button className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-xl">
        Add Money
      </button>
    </div>

    {/* PLAN AHEAD */}
    <div className="mx-3 bg-white rounded-3xl p-5 shadow-sm flex justify-between items-center">
      <div>
        <p className="text-xs text-gray-500">Plan for Tomorrow</p>
        <h4 className="font-semibold mt-1">Choose Your Meal</h4>
        <p className="text-sm text-gray-600 mt-1">
          Order before 10 PM to avoid missing out.
        </p>
      </div>

      <button
        onClick={() => navigate("/order")}
        className="bg-black text-white px-4 py-2 rounded-xl flex items-center gap-2"
      >
        Order <FiArrowRight />
      </button>
    </div>

    {/* WEEKLY SUMMARY */}
    <div className="mx-3 bg-white rounded-3xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold">This Week’s Meals</h4>
        <button
          onClick={() => navigate("/menu")}
          className="text-sm text-yellow-600 font-medium"
        >
          Full Menu
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

    {/* PRIMARY CTA */}
    <button
      disabled={orderingClosed && !todayOrder}
      onClick={() => navigate(todayOrder ? "/history" : "/order")}
      className={`mx-3 w-[calc(100%-1.5rem)] py-4 rounded-2xl text-lg font-semibold flex items-center justify-center gap-2 transition ${
        orderingClosed && !todayOrder
          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
          : "bg-yellow-400 text-black hover:bg-yellow-500"
      }`}
    >
      {todayOrder ? "View Today’s Tiffin" : "Place Today’s Order"}
      <FiArrowRight />
    </button>
  </div>
);

}
