import { db } from "../firebase/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const saveTodayMenu = async (menu) => {
  const dateKey = getTodayKey();
  const ref = doc(db, "menus", dateKey);

  await setDoc(ref, {
    ...menu,
    date: dateKey,
    updatedAt: serverTimestamp(),
  });
};

export const getTodayMenu = async () => {
  const dateKey = getTodayKey();
  const ref = doc(db, "menus", dateKey);
  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : null;
};

export const getTodayKey = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};

export const getCurrentMealSlot = () => {
  const hour = new Date().getHours();
  return hour < 14 ? "lunch" : "dinner";
};
