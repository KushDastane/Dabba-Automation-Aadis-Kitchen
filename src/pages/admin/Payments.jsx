import { useEffect, useMemo, useState } from "react";
import { db } from "../../firebase/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { acceptPayment, rejectPayment } from "../../services/paymentService";
import { FiImage } from "react-icons/fi";

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [previewSlip, setPreviewSlip] = useState(null);
  const [filter, setFilter] = useState("ALL"); // ALL | TODAY | WEEK

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    const q = query(
      collection(db, "payments"),
      where("status", "==", "PENDING")
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

  /* ---------------- DATE FILTER ---------------- */

  const filteredPayments = useMemo(() => {
    const now = new Date();

    return payments.filter((p) => {
      if (!p.createdAt) return false;
      const d = p.createdAt.toDate();

      if (filter === "TODAY") {
        return d.toDateString() === now.toDateString();
      }

      if (filter === "WEEK") {
        const diff = (now - d) / (1000 * 60 * 60 * 24);
        return diff <= 7;
      }

      return true;
    });
  }, [payments, filter]);

  if (filteredPayments.length === 0) {
    return (
      <p className="text-center mt-20 text-gray-400">No pending payments</p>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="pb-24 bg-[#faf9f6] min-h-screen px-4">
      {/* HEADER */}
      <h2 className="text-xl font-semibold mb-4">Payments</h2>

      {/* FILTERS */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: "ALL", label: "All" },
          { key: "TODAY", label: "Today" },
          { key: "WEEK", label: "This Week" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
              filter === f.key ? "bg-white shadow text-black" : "text-gray-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {filteredPayments.map((p) => {
          const date = p.createdAt?.toDate();

          return (
            <div key={p.id} className="bg-white rounded-2xl p-4 shadow-sm">
              {/* TOP */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {/* AVATAR */}
                  <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-semibold">
                    {p.studentName.charAt(0)}
                  </div>

                  <div>
                    <p className="font-medium">{p.studentName}</p>
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
                  <p className="text-lg font-semibold text-green-700">
                    ₹{p.amount}
                  </p>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    UPI
                  </span>
                </div>
              </div>

              {/* SLIP ROW */}
              {p.slipUrl && (
                <div
                  onClick={() => setPreviewSlip(p.slipUrl)}
                  className="flex items-center gap-3 border rounded-xl p-3 mb-4 cursor-pointer hover:bg-gray-50 transition"
                >
                  {/* ICON / THUMBNAIL */}
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                    <FiImage className="text-xl" />
                  </div>

                  {/* INFO */}
                  <div className="flex-1">
                    <p className="text-sm font-medium">Payment Slip</p>
                    <p className="text-xs text-gray-400">
                      Uploaded by {p.studentName}
                    </p>
                  </div>

                  {/* ACTION */}
                  <span className="text-sm font-medium text-green-700">
                    View
                  </span>
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    rejectPayment(p.id, { studentId: p.studentId })
                  }
                  className="flex-1 border border-red-300 text-red-600 py-2 rounded-xl font-medium"
                >
                  ✕ Reject
                </button>

                <button
                  onClick={() =>
                    acceptPayment(p.id, {
                      studentId: p.studentId,
                      amount: p.amount,
                      reviewedBy: "admin",
                    })
                  }
                  className="flex-1 bg-green-700 text-white py-2 rounded-xl font-medium"
                >
                  ✓ Accept Payment
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
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
