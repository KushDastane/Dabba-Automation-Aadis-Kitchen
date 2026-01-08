import { db } from "../firebase/firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
  deleteField,
} from "firebase/firestore";

/* ---------------- DATE HELPERS ---------------- */

export const getTodayKey = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

export const getTomorrowKey = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

export const isAfterResetTime = () => {
  const now = new Date();
  return now.getHours() >= 21; // 9 PM IST
};

/* ---------------- SAVE MENU ---------------- */
/**
 * Called ONLY when admin explicitly sets menu
 * This is the ONLY place menu becomes valid
 */
export const saveTodayMenu = async (menu) => {
  const dateKey = getEffectiveMenuDateKey(); // ✅ FIX
  const ref = doc(db, "menus", dateKey);

  await setDoc(
    ref,
    {
      ...menu,
      menuStatus: "SET",
      date: dateKey,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};


/* ---------------- GET MENU ---------------- */

export const getTodayMenu = async () => {
  const dateKey = getTodayKey();
  const ref = doc(db, "menus", dateKey);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const getMenuForDate = async (dateKey) => {
  const ref = doc(db, "menus", dateKey);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

/* ---------------- CURRENT MEAL ---------------- */

export const getCurrentMealSlot = () => {
  const hour = new Date().getHours();
  return hour < 14 ? "lunch" : "dinner";
};

/* ---------------- FREE DAILY RESET ---------------- */
/**
 * Reset menu ONCE per day
 * Triggered when ADMIN opens app after 9 PM
 *
 * This explicitly INVALIDATES menu
 */
export const resetMenuIfNeeded = async () => {
  if (!isAfterResetTime()) return;

  const tomorrowKey = getTomorrowKey();
  const ref = doc(db, "menus", tomorrowKey);
  const snap = await getDoc(ref);

  // Already reset → do nothing
  if (snap.exists() && snap.data()?.lastResetFor === tomorrowKey) {
    return;
  }

  if (snap.exists()) {
    // ✅ Explicitly invalidate menu
    await updateDoc(ref, {
      lunch: deleteField(),
      dinner: deleteField(),
      menuStatus: "NOT_SET", // 🔥 THIS FIXES EVERYTHING
      lastResetFor: tomorrowKey,
      resetAt: serverTimestamp(),
    });
  } else {
    await setDoc(ref, {
      date: tomorrowKey,
      menuStatus: "NOT_SET", // 🔥 EXPLICIT STATE
      lastResetFor: tomorrowKey,
      resetAt: serverTimestamp(),
    });
  }

  console.log("✅ Menu auto-reset & invalidated for tomorrow");
};

/* ---------------- EFFECTIVE HELPERS ---------------- */

export const getEffectiveMenuDateKey = () => {
  const hour = new Date().getHours();

  if (hour >= 21) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }

  return getTodayKey();
};

export const getEffectiveMealSlot = () => {
  const hour = new Date().getHours();

  if (hour < 14) return "lunch";
  if (hour < 21) return "dinner";

  return null;
};
