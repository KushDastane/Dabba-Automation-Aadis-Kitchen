import { db } from "../firebase/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

/**
 * Listen to today's orders (real-time)
 */
export const listenToTodayOrders = (dateKey, callback) => {
  const q = query(
    collection(db, "orders"),
    where("date", "==", dateKey),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const orders = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(orders);
  });
};
