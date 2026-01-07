// src/services/adminDashboardService.js
import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { getTodayKey } from "./menuService";

/**
 * Real-time dashboard stats
 */
export const listenToAdminStats = (callback) => {
  const today = getTodayKey();

  const unsubOrders = onSnapshot(
    query(collection(db, "orders"), where("date", "==", today)),
    (snap) => {
      let total = 0;
      let pending = 0;
      const students = new Set();

      snap.docs.forEach((d) => {
        total++;
        students.add(d.data().studentId);
        if (d.data().status === "PENDING") pending++;
      });

      callback((prev) => ({
        ...prev,
        totalOrders: total,
        pendingOrders: pending,
        studentsToday: students.size,
      }));
    }
  );

  const unsubPayments = onSnapshot(
    query(collection(db, "payments"), where("status", "==", "PENDING")),
    (snap) => {
      callback((prev) => ({
        ...prev,
        pendingPayments: snap.size,
      }));
    }
  );

  return () => {
    unsubOrders();
    unsubPayments();
  };
};
