import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { FaCheck } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { acceptPayment, rejectPayment } from "../../services/paymentService";
import { FiImage } from "react-icons/fi";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [previewSlip, setPreviewSlip] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* ---------------- FETCH LAST 7 DAYS ---------------- */

  useEffect(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const q = query(
      collection(db, "payments"),
      where("createdAt", ">=", Timestamp.fromDate(sevenDaysAgo))
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data();
          let name = "Student";

          try {
            const userSnap = await getDoc(doc(db, "users", data.studentId));
            if (userSnap.exists()) {
              name = userSnap.data().name || name;
            }
          } catch {}

          return {
            id: d.id,
            ...data,
            studentName: name,
          };
        })
      );

      setPayments(list);
    });

    return () => unsub();
  }, []);

  /* ---------------- FILTER + SORT ---------------- */

  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        if (statusFilter !== "ALL" && p.status !== statusFilter) return false;
        return true;
      })
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.seconds - a.createdAt.seconds;
      });
  }, [payments, statusFilter]);

  /* ---------------- HELPERS ---------------- */

  const getDayGroup = (date) => {
    const today = new Date();
    const d = new Date(date);

    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    if (d >= startOfToday) return "Today";
    if (d >= startOfYesterday) return "Yesterday";
    return "Older";
  };

  const getPaymentModeBadge = (mode) =>
    mode === "CASH"
      ? "bg-blue-100 text-blue-700"
      : "bg-emerald-100 text-emerald-700";

  /* ---------------- UI ---------------- */

  return (
    <div className="pb-24 pt-6 bg-[#faf9f6] min-h-screen p-8">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Payments</h2>
        <p className="mt-1 text-sm text-gray-600">
          Showing transactions from the last 7 days
        </p>
      </div>

      {/* STATUS FILTER */}
      <div className="mb-6 inline-flex flex-wrap gap-1">
        {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-full text-xs md:text-sm font-medium transition
              ${
                statusFilter === s
                  ? "bg-yellow-400 text-black"
                  : "bg-white/70 text-gray-700 ring-1 ring-black/5 hover:bg-gray-50"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* LIST / EMPTY STATE */}
      {filteredPayments.length === 0 ? (
        <div className="mt-24 text-center">
          <p className="text-sm text-gray-400">No payments found</p>
          <p className="text-xs text-gray-300 mt-1">Try changing the filter</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((p, index) => {
            const date = p.createdAt?.toDate();
            const group = date ? getDayGroup(date) : "Older";

            const prev = filteredPayments[index - 1];
            const prevGroup = prev?.createdAt
              ? getDayGroup(prev.createdAt.toDate())
              : null;

            const showHeading = group !== prevGroup;

            return (
              <div key={p.id}>
                {/* GROUP HEADING */}
                {showHeading && (
                  <div className="mb-2 mt-6">
                    <h4 className="text-xs md:text-sm font-semibold text-gray-700 uppercase tracking-wide">
                      {group}
                    </h4>
                  </div>
                )}

                {/* PAYMENT CARD */}
                <div
                  className={`rounded-3xl bg-white/70 backdrop-blur-md p-5 shadow-sm
                    ${
                      p.status === "REJECTED"
                        ? "ring-1 ring-red-300"
                        : "ring-1 ring-black/5"
                    }`}
                >
                  {/* TOP */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center font-semibold">
                        {p.studentName.charAt(0)}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          {p.studentName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {date?.toLocaleDateString()} ·{" "}
                          {date?.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          p.status === "REJECTED"
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        ₹{p.amount}
                      </p>

                      <span
                        className={`mt-1 inline-block text-[11px] px-2 mr-2 py-0.5 rounded-full font-medium
                          ${getPaymentModeBadge(p.paymentMode)}`}
                      >
                        {p.paymentMode || "UPI"}
                      </span>

                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium
                          ${
                            p.status === "REJECTED"
                              ? "bg-red-100 text-red-700"
                              : p.status === "ACCEPTED"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {p.status}
                      </span>
                    </div>
                  </div>

                  {/* SLIP */}
                  {p.paymentMode === "UPI" && p.slipUrl && (
                    <div
                      onClick={() => setPreviewSlip(p.slipUrl)}
                      className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3 mb-4 cursor-pointer hover:bg-gray-100 transition"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center
                          ${
                            p.status === "REJECTED"
                              ? "bg-red-50 text-red-600"
                              : "bg-emerald-50 text-emerald-600"
                          }`}
                      >
                        <FiImage className="text-xl" />
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-medium">Payment Slip</p>
                        <p className="text-xs text-gray-400">
                          Uploaded by {p.studentName}
                        </p>
                      </div>

                      <span className="text-sm font-medium text-emerald-700">
                        View
                      </span>
                    </div>
                  )}

                  {/* ACTIONS */}
                  {p.status === "PENDING" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          rejectPayment(p.id, { studentId: p.studentId })
                        }
                        className="flex-1 h-11 rounded-2xl bg-red-100 text-red-700 hover:bg-red-200 transition flex items-center justify-center"
                      >
                        <RxCross2 className="text-xl" />
                      </button>

                      <button
                        onClick={() =>
                          acceptPayment(p.id, {
                            studentId: p.studentId,
                            amount: p.amount,
                            reviewedBy: "admin",
                          })
                        }
                        className="flex-1 h-11 rounded-2xl bg-emerald-500 text-white hover:bg-emerald-600 transition flex items-center justify-center"
                      >
                        <FaCheck className="text-xl" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SLIP MODAL */}
      {previewSlip && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setPreviewSlip(null)}
        >
          <img
            src={previewSlip}
            alt="Slip"
            className="max-h-[90vh] max-w-[90vw] rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
