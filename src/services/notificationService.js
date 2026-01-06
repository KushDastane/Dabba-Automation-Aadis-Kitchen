import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * notify({
 *   userId,
 *   role,
 *   type,
 *   title,
 *   message,   // fallback text
 *   data       // optional structured context
 * })
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
    data, // ✅ NEW
    read: false,
    createdAt: serverTimestamp(),
  });
};
