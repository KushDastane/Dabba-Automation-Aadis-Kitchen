// src/services/adminDashboardService.js
import { db } from "../firebase/firebase";
import { collection, query, where, onSnapshot, doc } from "firebase/firestore";
import { getTodayKey } from "./menuService";
import { getDailyStats } from "./dailyStatsService";

/**
 * Real-time dashboard stats
 */
export const listenToAdminStats = (callback, slot) => {
  const today = getTodayKey();

  const unsubOrders = onSnapshot(
    query(
      collection(db, "orders"),
      where("date", "==", today),
      where("mealType", "==", slot?.toUpperCase())
    ),
    (snap) => {
      let pending = 0;
      let totalOrders = 0;
      const students = new Set();

      snap.docs.forEach((d) => {
        const data = d.data();
        students.add(data.studentId);
        if (data.status === "PENDING") pending++;
        if (data.status === "CONFIRMED") totalOrders++;
      });

      callback((prev) => ({
        ...prev,
        pendingOrders: pending,
        totalOrders,
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
