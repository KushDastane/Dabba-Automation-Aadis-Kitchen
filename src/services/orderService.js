import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { getTodayKey } from "./menuService";
import { notify } from "./notificationService";
import { ADMIN_UID } from "../constants/admin";

export const placeStudentOrder = async ({ studentId, mealType, items }) => {
  const dateKey = getTodayKey();

  const orderRef = await addDoc(collection(db, "orders"), {
    studentId,
    date: dateKey,
    mealType,
    items,
    calculatedAmount: null,
    status: "PENDING",
    createdAt: serverTimestamp(),
    createdBy: "student",
  });

  // 🔹 Fetch student name (one read, worth it)
  let studentName = "Student";
  try {
    const userSnap = await getDoc(doc(db, "users", studentId));
    if (userSnap.exists()) {
      studentName = userSnap.data().name || studentName;
    }
  } catch (err) {
    console.error("Failed to fetch student name", err);
  }

  await notify({
    userId: ADMIN_UID,
    role: "admin",
    type: "ORDER_PLACED",
    title: "New Order Placed",
    message: `${studentName} placed a new order.`,
    data: {
      studentId,
      studentName,
      orderId: orderRef.id,
      mealType,
    },
  });
};
