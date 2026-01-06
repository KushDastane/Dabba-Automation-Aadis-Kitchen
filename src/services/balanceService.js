import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export const getStudentBalance = async (studentId) => {
  const q = query(
    collection(db, "ledger_entries"),
    where("studentId", "==", studentId)
  );

  const snap = await getDocs(q);

  let credit = 0;
  let debit = 0;

  snap.docs.forEach((doc) => {
    const entry = doc.data();
    if (entry.type === "CREDIT") credit += entry.amount;
    if (entry.type === "DEBIT") debit += entry.amount;
  });

  return {
    credit,
    debit,
    balance: credit - debit,
  };
};
