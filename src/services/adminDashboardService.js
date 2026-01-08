// src/services/adminDashboardService.js
import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { getTodayKey } from "./menuService";
import { getDailyStats } from "./dailyStatsService";

/**
 * Real-time dashboard stats
 */
export const listenToAdminStats = (callback) => {
  const today = getTodayKey();

  // Listen to daily stats for cumulative totalOrders
  const unsubDailyStats = onSnapshot(doc(db, "dailyStats", today), (snap) => {
    const totalOrders = snap.exists() ? snap.data().totalOrders : 0;
    callback((prev) => ({
      ...prev,
      totalOrders,
    }));
  });

  const unsubOrders = onSnapshot(
    query(collection(db, "orders"), where("date", "==", today)),
    (snap) => {
      let pending = 0;
      const students = new Set();

      snap.docs.forEach((d) => {
        students.add(d.data().studentId);
        if (d.data().status === "PENDING") pending++;
      });

      callback((prev) => ({
        ...prev,
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
    unsubDailyStats();
    unsubOrders();
    unsubPayments();
  };
};
