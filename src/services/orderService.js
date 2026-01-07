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
} from "firebase/firestore";
import { getTodayKey } from "./menuService";
import { notify } from "./notificationService";
import { ADMIN_UID } from "../constants/admin";

/**
 * STUDENT: Place order
 */
export const placeStudentOrder = async ({ studentId, mealType, items }) => {
  const dateKey = getTodayKey();

  // ✅ ORDER CREATION (matches Firestore rules perfectly)
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

  // 🔹 Fetch student name (non-critical)
  let studentName = "Student";
  try {
    const userSnap = await getDoc(doc(db, "users", studentId));
    if (userSnap.exists()) {
      studentName = userSnap.data().name || studentName;
    }
  } catch (err) {
    console.error("Failed to fetch student name", err);
  }

  // 🔹 ADMIN notification (must NEVER block order placement)
  try {
    await notify({
      userId: ADMIN_UID, // ⚠ must match rules exactly
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
    console.error("Notification failed (order still placed)", err);
  }

  return orderRef.id;
};

/**
 * STUDENT: Get today’s order
 */
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
