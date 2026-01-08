import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { getTodayKey } from "./menuService";

/**
 * Get daily stats document reference
 */
const getDailyStatsRef = () => {
  const today = getTodayKey();
  return doc(db, "dailyStats", today);
};

/**
 * Get daily stats for today
 */
export const getDailyStats = async () => {
  const ref = getDailyStatsRef();
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    // Initialize with 0 if not exists
    const today = getTodayKey();
    await setDoc(ref, {
      totalOrders: 0,
      studentsToday: 0,
      date: today,
      createdAt: new Date(),
    });
    return { totalOrders: 0, studentsToday: 0 };
  }

  return snap.data();
};

/**
 * Increment total orders for today
 */
export const incrementTotalOrders = async () => {
  const ref = getDailyStatsRef();

  // Check if document exists, if not create it
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      totalOrders: 1,
      studentsToday: 0,
      date: getTodayKey(),
      createdAt: new Date(),
    });
  } else {
    await updateDoc(ref, {
      totalOrders: increment(1),
    });
  }
};

/**
 * Increment students today count (only if new student)
 */
export const incrementStudentsToday = async () => {
  const ref = getDailyStatsRef();

  // Check if document exists, if not create it
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      totalOrders: 0,
      studentsToday: 1,
      date: getTodayKey(),
      createdAt: new Date(),
    });
  } else {
    await updateDoc(ref, {
      studentsToday: increment(1),
    });
  }
};

/**
 * Reset daily stats (for manual reset or future cron)
 */
export const resetDailyStats = async (dateKey = null) => {
  const key = dateKey || getTodayKey();
  const ref = doc(db, "dailyStats", key);

  await setDoc(ref, {
    totalOrders: 0,
    studentsToday: 0,
    date: key,
    createdAt: new Date(),
  });
};
