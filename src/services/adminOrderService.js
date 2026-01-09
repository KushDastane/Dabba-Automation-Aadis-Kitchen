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
 * If slot is provided, returns latest 4 orders for that slot
 * If slot is null, returns all orders for the date (no limit)
 */
export const listenToTodayOrders = (dateKey, slot, callback) => {
  if (!dateKey) {
    callback([]);
    return () => {};
  }

  let q;

  if (slot) {
    // 🔥 NORMALIZE SLOT
    const normalizedSlot = slot.toUpperCase(); // LUNCH | DINNER

    q = query(
      collection(db, "orders"),
      where("date", "==", dateKey),
      where("mealType", "==", normalizedSlot),
      orderBy("createdAt", "desc"),
      limit(4)
    );
  } else {
    // No slot filter, get all orders for the date
    q = query(
      collection(db, "orders"),
      where("date", "==", dateKey),
      orderBy("createdAt", "desc")
    );
  }

  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    callback(orders);
  });
};
