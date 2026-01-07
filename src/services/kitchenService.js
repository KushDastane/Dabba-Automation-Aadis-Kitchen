import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/* =========================
   GET CONFIG (STUDENT/ADMIN)
========================= */
export const getKitchenConfig = async () => {
  const ref = doc(db, "kitchen", "config");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return {
      openTime: "07:00",
      closeTime: "21:00",
      holiday: {
        active: false,
        from: null,
        to: null,
        reason: "",
      },
    };
  }

  return snap.data();
};

/* =========================
   ADMIN: UPDATE CONFIG
========================= */
export const updateKitchenConfig = async (data) => {
  const ref = doc(db, "kitchen", "config");

  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
};
