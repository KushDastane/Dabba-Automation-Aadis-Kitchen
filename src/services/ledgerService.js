import { db } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addLedgerEntry = async ({
  studentId,
  type,
  source,
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
