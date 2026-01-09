import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCheckCircle,
  FiClock,
  FiArrowRight,
  FiCalendar,
  FiCreditCard,
} from "react-icons/fi";
import { LiaRupeeSignSolid } from "react-icons/lia";

import { useAuthUser } from "../../hooks/useAuthUser";
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
  const tiffinIcon = "/icon/tiffin.png";
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [todayOrder, setTodayOrder] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [kitchen, setKitchen] = useState(null);

  const mealSlot = getCurrentMealSlot();

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  let kitchenStatusText = "Kitchen Open";
  let kitchenStyle = "bg-green-100 text-green-800";

  if (kitchen?.holiday?.active) {
    kitchenStatusText = `Kitchen Holiday (${kitchen.holiday.from} → ${kitchen.holiday.to})`;
    kitchenStyle = "bg-yellow-100 text-yellow-800";
  } else if (isAfterTime("21:00") || isBeforeTime("07:00")) {
    kitchenStatusText = "Kitchen Closed · Opens at 7:00 AM";
    kitchenStyle = "bg-gray-200 text-gray-700";
  }

  const lunchClosed = isAfterTime("13:00");
  const dinnerClosed = isAfterTime("20:00");
  const orderingClosed = mealSlot === "lunch" ? lunchClosed : dinnerClosed;

  const weekDates = getCurrentWeekDates();
  const orderedDays = new Set(
    ledger
      .filter((l) => l.source === "ORDER")
      .map((l) => l.createdAt?.toDate?.().toISOString().split("T")[0])
  );

  return (
    <div className="bg-[#fffaf2] min-h-screen pb-28">
      {/* Header */}

      <div className="relative overflow-hidden bg-gradient-to-br from-yellow-100 via-[#fff3c4] to-[#fffaf2] rounded-b-4xl">
        {/* soft decorative blur */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-yellow-200/40 rounded-full blur-3xl" />

        <div className="relative w-full px-4 lg:px-12 xl:px-20 py-8">
          {/* Date */}
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "short",
            })}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Greeting */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 leading-tight">
                {getGreeting()},{" "}
                <span className="capitalize">{profile?.name}</span>
              </h2>

              <p className="text-gray-700 mt-2 text-sm">
                {mealSlot === "lunch"
                  ? "Plan your Lunch!"
                  : "Plan your Dinner!"}
              </p>
            </div>

            {/* Kitchen Status Pill */}
            <div
              className={`self-start sm:self-center rounded-full px-4 py-2 text-sm font-medium shadow-sm ${kitchenStyle}`}
            >
              {kitchenStatusText}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 lg:px-12 xl:px-20 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Meal - Large Card */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <img
                    src={tiffinIcon}
                    alt="Tiffin"
                    className="w-9 h-9 object-contain"
                  />
                </div>

                <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium">
                  TODAY&apos;S {mealSlot.toUpperCase()}
                </span>
              </div>

              <div className="text-3xl">
                {todayOrder?.status === "CONFIRMED" ? (
                  <FiCheckCircle className="text-green-600" />
                ) : (
                  <FiClock className="text-orange-500" />
                )}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {!todayOrder
                ? "No Order Placed"
                : todayOrder.status === "CONFIRMED"
                ? "Meal Confirmed"
                : "Order Placed"}
            </h3>

            <p className="text-gray-600 mb-6">
              {!todayOrder
                ? orderingClosed
                  ? "Ordering is closed for today."
                  : "Place your order before cutoff time."
                : todayOrder.status === "CONFIRMED"
                ? "Your tiffin is being prepared with care."
                : "Your order is placed and awaiting confirmation."}
            </p>

            <div className="mt-6 flex justify-end">
              {!orderingClosed && (
                <button
                  onClick={() => navigate(todayOrder ? "/history" : "/order")}
                  className="cursor-pointer w-full sm:w-auto bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
                >
                  {todayOrder ? "View Order" : "Place Order"}
                  <FiArrowRight />
                </button>
              )}
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-semibold text-gray-900 text-lg">
                This Week's Meals
              </h4>
              <button
                onClick={() => navigate("/history")}
                className="text-sm text-yellow-600 font-medium hover:text-yellow-700 cursor-pointer
                "
              >
                Full Menu
              </button>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {weekDates.map((d) => {
                const ordered = orderedDays.has(d);
                const isToday = d === new Date().toISOString().split("T")[0];

                return (
                  <div key={d} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-xs font-medium transition ${
                        ordered
                          ? "bg-green-100 text-green-700"
                          : isToday
                          ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {new Date(d)
                        .toLocaleDateString("en-IN", {
                          weekday: "short",
                        })
                        .slice(0, 1)}
                    </div>
                    {ordered && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4">
          {/* Wallet Card */}
          <div className="bg-gradient-to-br from-[#1c1c1c] to-[#2b2b2b] rounded-3xl p-8 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <FiCreditCard className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-400">Your Wallet Balance</p>
            </div>

            <h2 className="text-4xl font-bold mb-2">
              ₹{balance?.balance ?? 0}
            </h2>

            <p className="text-sm text-green-400 mb-8">
              Enough for approx. {Math.floor((balance?.balance ?? 0) / 90)}{" "}
              meals
            </p>

            <button
              type="button"
              onClick={() => navigate("/add-payment")}
              className="w-full cursor-pointer flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-semibold py-3 rounded-xl transition"
            >
              <LiaRupeeSignSolid className="text-lg" />
              <span>Add Money</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
