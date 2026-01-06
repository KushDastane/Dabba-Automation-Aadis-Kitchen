import { useEffect, useState } from "react";
import { useAuthUser } from "../hooks/useAuthUser";
import { useNotifications } from "../hooks/useNotifications";

import StudentOnly from "../app/common/StudentOnly";
import AdminOnly from "../app/common/AdminOnly";

import { placeStudentOrder } from "../services/orderService";
import { submitPayment, acceptPayment } from "../services/paymentService";

import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

export default function DevDashboard() {
  /* ================= HOOKS (NO RETURNS ABOVE THIS) ================= */
  const { authUser, role, loading } = useAuthUser();
  const notifications = useNotifications(authUser?.uid);

  const [myOrders, setMyOrders] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  /* ================= EFFECTS (ALWAYS DECLARED) ================= */

  useEffect(() => {
    if (!authUser || role !== "student") return;

    const q = query(
      collection(db, "orders"),
      where("studentId", "==", authUser.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setMyOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [authUser, role]);

 useEffect(() => {
   if (!authUser || role !== "admin") return;

   const ordersQ = query(collection(db, "orders"));
   const paymentsQ = query(collection(db, "payments"));

   const unsubOrders = onSnapshot(ordersQ, (snap) => {
     setPendingOrders(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
   });

   const unsubPayments = onSnapshot(paymentsQ, (snap) => {
     setPendingPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
   });

   return () => {
     unsubOrders();
     unsubPayments();
   };
 }, [authUser, role]);


  /* ================= ACTIONS ================= */

  const placeOrder = async () => {
    await placeStudentOrder({
      studentId: authUser.uid,
      mealType: "lunch",
      items: { roti: 2, sabzi: 1, dal: 1, rice: 0 },
    });
    alert("Order placed");
  };

  const submitPay = async () => {
    await submitPayment({
      studentId: authUser.uid,
      amount: 300,
      slipUrl: "https://dummy-slip-url.com",
    });
    alert("Payment submitted");
  };

  const confirmLatestOrder = async () => {
    if (!pendingOrders.length) return alert("No pending orders");

    const order = pendingOrders[0];
    const { confirmOrder } = await import("../services/adminOrderService");
    await confirmOrder(order.id, order);

    alert("Order confirmed");
  };

  const acceptLatestPayment = async () => {
    if (!pendingPayments.length) return alert("No pending payments");

    const payment = pendingPayments[0];
    await acceptPayment(payment.id, {
      studentId: payment.studentId,
      amount: payment.amount,
      reviewedBy: authUser.uid,
    });

    alert("Payment accepted");
  };

  /* ================= RENDER (ONLY UI CONDITIONS HERE) ================= */

  if (loading) return <div className="p-4">Loading…</div>;
  if (!authUser) return <div className="p-4">Please log in</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold">DEV DASHBOARD</h1>
      <div>
        Logged in as: <b>{role}</b>
      </div>

      <StudentOnly>
        <button onClick={placeOrder} className="btn">
          Place Order
        </button>
        <button onClick={submitPay} className="btn">
          Submit Payment
        </button>
      </StudentOnly>

      <AdminOnly>
        <button onClick={confirmLatestOrder} className="btn">
          Confirm Order
        </button>
        <button onClick={acceptLatestPayment} className="btn">
          Accept Payment
        </button>
      </AdminOnly>

      <div>
        <h2 className="font-semibold">Notifications</h2>
        {notifications.map((n) => (
          <div key={n.id} className="border p-2 mt-1">
            <div>{n.title}</div>
            <div className="text-sm">{n.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
