import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Generic notification creator
 * Supports extra metadata via `data`
 */
export const notify = async ({
  userId,
  role,
  type,
  title,
  message,
  data = {},
}) => {
  await addDoc(collection(db, "notifications"), {
    userId,
    role,
    type,
    title,
    message,
    data, // ✅ structured metadata for future UI/actions
    read: false,
    createdAt: serverTimestamp(),
  });
};
