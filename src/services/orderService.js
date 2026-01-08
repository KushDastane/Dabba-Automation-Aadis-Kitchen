import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
  getDocs,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { getTodayKey } from "./menuService";
import { notify } from "./notificationService";
import { addLedgerEntry } from "./ledgerService";
import { ADMIN_UID } from "../constants/admin";
import { Timestamp } from "firebase/firestore";
/* ===========================
   STUDENT: PLACE ORDER
=========================== */
export const placeStudentOrder = async ({ studentId, mealType, items }) => {
  const dateKey = getTodayKey();

  // 1️⃣ Create order
  const orderRef = await addDoc(collection(db, "orders"), {
    studentId,
    date: dateKey,
    mealType,
    items, // contains unitPrice, quantity, extras
    calculatedAmount: null,
    status: "PENDING",
    createdAt: serverTimestamp(),
    createdBy: "student",
  });

  // 2️⃣ Fetch student name (non-blocking)
  let studentName = "Student";
  try {
    const userSnap = await getDoc(doc(db, "users", studentId));
    if (userSnap.exists()) {
      studentName = userSnap.data().name || studentName;
    }
  } catch (err) {
    console.error("Failed to fetch student name", err);
  }

  // 3️⃣ Notify admin (must not block order)
  try {
    await notify({
      userId: ADMIN_UID,
      role: "admin",
      type: "ORDER_PLACED",
      title: "New Order Placed",
      message: `${studentName} placed a new order.`,
      data: {
        orderId: orderRef.id,
        studentId,
        studentName,
        mealType,
      },
    });
  } catch (err) {
    console.error("Admin notification failed", err);
  }

  return orderRef.id;
};

/* ===========================
   STUDENT: GET TODAY ORDER
=========================== */
export const getTodayStudentOrder = async (studentId) => {
  const dateKey = getTodayKey();

  const q = query(
    collection(db, "orders"),
    where("studentId", "==", studentId),
    where("date", "==", dateKey)
  );

  const snap = await getDocs(q);

  if (snap.empty) return null;

  return {
    id: snap.docs[0].id,
    ...snap.docs[0].data(),
  };
};

/* ===========================
   ADMIN: CONFIRM ORDER

=========================== */
export const confirmOrder = async (orderId) => {
  const orderRef = doc(db, "orders", orderId);
  const snap = await getDoc(orderRef);

  if (!snap.exists()) {
    throw new Error("Order not found");
  }

  const order = snap.data();

  // Safety: don’t double confirm
  if (order.status === "CONFIRMED") {
    return;
  }

  /* 1️⃣ CALCULATE TOTAL */
  let total = order.items.unitPrice * order.items.quantity;

  // Extras already counted in PlaceOrder UI,
  // so NO double calculation here

  /* 2️⃣ UPDATE ORDER */
  await updateDoc(orderRef, {
    status: "CONFIRMED",
    calculatedAmount: total,
    confirmedAt: serverTimestamp(),
  });

  /* 3️⃣ CREATE LEDGER DEBIT */
  await addLedgerEntry({
    studentId: order.studentId,
    type: "DEBIT",
    source: "ORDER",
    sourceId: orderId,
    amount: total,
  });

  /* 4️⃣ NOTIFY STUDENT */
  await notify({
    userId: order.studentId,
    role: "student",
    type: "ORDER_CONFIRMED",
    title: "Order Confirmed",
    message: `Your order has been confirmed. ₹${total} added to your khata.`,
    data: {
      orderId,
      amount: total,
    },
  });
};

export const getStudentOrders = async (studentId) => {
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

  const q = query(
    collection(db, "orders"),
    where("studentId", "==", studentId),
    where("createdAt", ">=", Timestamp.fromDate(twoMonthsAgo)),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
