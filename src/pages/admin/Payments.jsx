import { useEffect, useState } from "react";
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

export default function Payments() {
  const [payments, setPayments] = useState([]);

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

  if (payments.length === 0) {
    return (
      <p className="text-center mt-10 text-gray-500">No pending payments</p>
    );
  }

  return (
    <div className="pb-24">
      <h2 className="text-xl font-semibold mb-4">Payments</h2>

      <div className="space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm">
            <p className="font-medium">{p.studentName}</p>
            <p className="text-sm text-gray-600">₹ {p.amount}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  acceptPayment(p.id, {
                    studentId: p.studentId,
                    amount: p.amount,
                    reviewedBy: "admin",
                  })
                }
                className="flex-1 bg-green-600 text-white py-1 rounded-lg"
              >
                Accept
              </button>

              <button
                onClick={() => rejectPayment(p.id, { studentId: p.studentId })}
                className="flex-1 bg-red-100 text-red-600 py-1 rounded-lg"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
