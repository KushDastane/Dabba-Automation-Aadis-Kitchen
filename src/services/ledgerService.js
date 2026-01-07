import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

/**
 * ADMIN / SYSTEM: Add ledger entry
 */
export const addLedgerEntry = async ({
  studentId,
  type, // "CREDIT" | "DEBIT"
  source, // "ORDER" | "PAYMENT"
  sourceId,
  amount,
}) => {
  await addDoc(collection(db, "ledger_entries"), {
    studentId,
    type,
    source,
    sourceId,
    amount,
    createdAt: serverTimestamp(),
  });
};

/**
 * STUDENT: Get ledger entries for current user
 */
export const getStudentLedger = async (studentId) => {
  const q = query(
    collection(db, "ledger_entries"),
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
