import { db } from "../firebase/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { ADMIN_UID } from "../constants/admin";

export const createUserIfNotExists = async (user) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  // ✅ If already exists, do nothing
  if (snap.exists()) return;

  // ✅ Decide role ONLY here
  const role = user.uid === ADMIN_UID ? "admin" : "student";

  // ✅ ALWAYS create document for every UID
  await setDoc(userRef, {
    uid: user.uid,
    phone: user.phoneNumber || "",
    role,
    name: "",
    isActive: true,
    createdAt: serverTimestamp(),
  });
};
