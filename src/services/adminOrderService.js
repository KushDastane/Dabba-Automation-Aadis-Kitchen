import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";

/**
 * Listen to today's orders (real-time)
 * Always returns latest 4 orders for the given slot
 */
export const listenToTodayOrders = (dateKey, slot, callback) => {
  if (!dateKey || !slot) {
    callback([]);
    return () => {};
  }

  // 🔥 NORMALIZE SLOT (THIS WAS THE BUG)
  const normalizedSlot = slot.toUpperCase(); // LUNCH | DINNER

  const q = query(
    collection(db, "orders"),
    where("date", "==", dateKey),
    where("mealType", "==", normalizedSlot),
    orderBy("createdAt", "desc"),
    limit(4)
  );

  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(orders);
  });
};
