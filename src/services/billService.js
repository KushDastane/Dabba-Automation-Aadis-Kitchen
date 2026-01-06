import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { isInMonth } from "../utils/dateUtils";

export const getMonthlyBillData = async (studentId, monthKey) => {
  // ORDERS (DEBIT)
  const ordersQ = query(
    collection(db, "orders"),
    where("studentId", "==", studentId),
    where("status", "==", "CONFIRMED")
  );

  const ordersSnap = await getDocs(ordersQ);
  const orders = ordersSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((o) => isInMonth(o.confirmedAt, monthKey));

  // PAYMENTS (CREDIT)
  const paymentsQ = query(
    collection(db, "payments"),
    where("studentId", "==", studentId),
    where("status", "==", "ACCEPTED")
  );

  const paymentsSnap = await getDocs(paymentsQ);
  const payments = paymentsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => isInMonth(p.reviewedAt, monthKey));

  const totalDebit = orders.reduce((s, o) => s + o.calculatedAmount, 0);
  const totalCredit = payments.reduce((s, p) => s + p.amount, 0);

  return {
    orders,
    payments,
    totalDebit,
    totalCredit,
    net: totalCredit - totalDebit,
  };
};
