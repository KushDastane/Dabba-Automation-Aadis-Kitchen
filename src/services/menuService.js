import { db } from "../firebase/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export const getTodayKey = () => {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
};

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
