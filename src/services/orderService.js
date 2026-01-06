import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getTodayKey } from "./menuService";
import { notify } from "./notificationService";
import { ADMIN_UID } from "../constants/admin";

export const placeStudentOrder = async ({ studentId, mealType, items }) => {
  const dateKey = getTodayKey();

  await addDoc(collection(db, "orders"), {
    studentId,
    date: dateKey,
    mealType,
    items,
    calculatedAmount: null,
    status: "PENDING",
    createdAt: serverTimestamp(),
    createdBy: "student",
  });

  await notify({
    userId: ADMIN_UID,
    role: "admin",
    type: "ORDER_PLACED",
    title: "New Order Placed",
    message: "A student has placed a new order.",
  });
};
