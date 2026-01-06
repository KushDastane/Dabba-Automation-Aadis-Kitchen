import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const notify = async ({ userId, role, type, title, message }) => {
  await addDoc(collection(db, "notifications"), {
    userId,
    role,
    type,
    title,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });
};
