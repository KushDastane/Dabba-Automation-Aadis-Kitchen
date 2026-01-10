import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";

import { getStudentOrders } from "../../services/orderService";
import { getStudentPayments } from "../../services/paymentService";
import { getStudentBalance } from "../../services/balanceService";

import { DayPicker } from "react-day-picker";

import {
  FiArrowLeft,
  FiCalendar,
  FiX,
  FiClipboard,
  FiAlertCircle,
} from "react-icons/fi";

export default function StudentProfile() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [balance, setBalance] = useState(null);

  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [showCalendar, setShowCalendar] = useState(false);

  /* ---------------- FETCH STUDENT ---------------- */

  useEffect(() => {
    const fetchStudent = async () => {
      const snap = await getDoc(doc(db, "users", studentId));
      if (snap.exists()) {
        setStudent({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    };
    fetchStudent();
  }, [studentId]);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    if (activeTab === "ORDERS" && orders.length === 0) {
      getStudentOrders(studentId).then(setOrders);
    }
    if (
      (activeTab === "PAYMENTS" || activeTab === "OVERVIEW") &&
      payments.length === 0
    ) {
      getStudentPayments(studentId).then(setPayments);
    }
    if (balance === null) {
      getStudentBalance(studentId).then(setBalance);
    }
  }, [activeTab, studentId, balance]);

  /* ---------------- DATE FILTER ---------------- */

  const filteredOrders = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return orders;
    return orders.filter((item) => {
      const d = item.createdAt?.toDate?.();
      return d && d >= dateRange.from && d <= dateRange.to;
    });
  }, [orders, dateRange]);

  const filteredPayments = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return payments;
    return payments.filter((item) => {
      const d = item.createdAt?.toDate?.();
      return d && d >= dateRange.from && d <= dateRange.to;
    });
  }, [payments, dateRange]);

  /* ---------------- OVERVIEW STATS ---------------- */

  const totalOrders = orders.length;
  const pendingDues = balance ? Math.max(0, -balance.balance) : 0;

  /* ---------------- STATES ---------------- */

  if (loading) {
    return <p className="text-center mt-20 text-gray-400">Loading…</p>;
  }

  if (!student) {
    return <p className="text-center mt-20 text-red-500">Student not found</p>;
  }

  /* ---------------- UI ---------------- */

  return (
    <div className=" sm:px-6 py-6 min-h-screen  overflow-x-hidden">
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => navigate("/students")}
          className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
        >
          <FiArrowLeft />
          Students
        </button>

        <span className="text-gray-300">/</span>

        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          Student Profile
        </h1>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
        <p className="text-lg font-semibold">{student.name}</p>
        <p className="text-sm text-gray-500 break-all">{student.phone}</p>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-4 bg-[#fff3d6] p-1.5 rounded-xl w-full sm:w-fit">
        {["OVERVIEW", "ORDERS", "PAYMENTS"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === t
                ? "bg-white shadow text-[#8a5b00]"
                : "text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* DATE FILTER */}
      {(activeTab === "ORDERS" || activeTab === "PAYMENTS") && (
        <>
          <button
            onClick={() => setShowCalendar(true)}
            className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm text-sm font-medium mb-6"
          >
            <FiCalendar />
            <span className="truncate">
              {dateRange.from && dateRange.to
                ? `${dateRange.from.toLocaleDateString()} → ${dateRange.to.toLocaleDateString()}`
                : "Filter by date"}
            </span>
          </button>

          {/* FIXED CALENDAR OVERLAY */}
          {showCalendar && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setShowCalendar(false)}
              />

              {/* Calendar */}
              <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-[320px] p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm font-medium">Select date range</p>
                    <button onClick={() => setShowCalendar(false)}>
                      <FiX />
                    </button>
                  </div>

                  <DayPicker
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    className="w-full"
                  />

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setShowCalendar(false)}
                      className="flex-1 bg-[#8a5b00] text-white py-2 rounded-lg text-sm"
                    >
                      Apply
                    </button>

                    <button
                      onClick={() => {
                        setDateRange({ from: null, to: null });
                        setShowCalendar(false);
                      }}
                      className="flex-1 border py-2 rounded-lg text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Stat label="Total Orders" value={totalOrders} icon={FiClipboard} />

          <Stat
            label="Dues"
            value={pendingDues > 0 ? `₹${pendingDues}` : "No dues 🎉"}
            icon={FiAlertCircle}
            highlight={pendingDues > 0}
          />
        </div>
      )}

      {/* ORDERS */}
      {activeTab === "ORDERS" &&
        filteredOrders.map((o) => (
          <Card
            key={o.id}
            title={o.mealType}
            subtitle={o.createdAt?.toDate()?.toLocaleString()}
            amount={`₹${o.calculatedAmount}`}
            status={o.status}
          />
        ))}

      {/* PAYMENTS */}
      {activeTab === "PAYMENTS" &&
        filteredPayments.map((p) => (
          <Card
            key={p.id}
            title={`₹${p.amount}`}
            subtitle={p.createdAt?.toDate()?.toLocaleString()}
            status={p.status}
            paymentMode={p.paymentMode}
          />
        ))}
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p
        className={`text-lg font-semibold ${
          highlight ? "text-yellow-700" : "text-gray-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
function Card({ title, subtitle, amount, status, paymentMode }) {
  const statusColor = {
    ACCEPTED: "bg-green-100 text-green-700",
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  const modeColor = {
    CASH: "bg-blue-100 text-blue-700",
    UPI: "bg-emerald-100 text-emerald-700",
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm mb-3 w-full">
      {/* TOP ROW */}
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <p className="font-medium truncate">{title}</p>
          <p className="text-xs text-gray-400 truncate">{subtitle}</p>
        </div>

        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[status]}`}
        >
          {status}
        </span>
      </div>

      {/* BOTTOM ROW */}
      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {amount && <p className="font-semibold text-gray-900">{amount}</p>}

        {paymentMode && (
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${modeColor[paymentMode]}`}
          >
            {paymentMode}
          </span>
        )}
      </div>
    </div>
  );
}
