import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { addLedgerEntry } from "./ledgerService";
import { notify } from "./notificationService";
import { ADMIN_UID } from "../constants/admin";
import { query, where, orderBy, getDocs } from "firebase/firestore";

// student submits payment
export const submitPayment = async ({ studentId, amount, slipUrl }) => {
  const paymentRef = await addDoc(collection(db, "payments"), {
    studentId,
    amount,
    slipUrl,
    status: "PENDING",
    createdAt: serverTimestamp(),
    reviewedBy: null,
    reviewedAt: null,
  });

  let studentName = "Student";
  try {
    const userSnap = await getDoc(doc(db, "users", studentId));
    if (userSnap.exists()) {
      studentName = userSnap.data().name || studentName;
    }
  } catch (err) {
    console.error("Failed to fetch student name", err);
  }

  await notify({
    userId: ADMIN_UID,
    role: "admin",
    type: "PAYMENT_SUBMITTED",
    title: "Payment Submitted",
    message: `${studentName} submitted a payment of ₹${amount}.`,
    data: {
      studentId,
      studentName,
      paymentId: paymentRef.id,
      amount,
    },
  });
};

// admin accepts payment
export const acceptPayment = async (paymentId, paymentData) => {
  await updateDoc(doc(db, "payments", paymentId), {
    status: "ACCEPTED",
    reviewedBy: paymentData.reviewedBy,
    reviewedAt: serverTimestamp(),
  });

  await addLedgerEntry({
    studentId: paymentData.studentId,
    type: "CREDIT",
    source: "PAYMENT",
    sourceId: paymentId,
    amount: paymentData.amount,
  });

  await notify({
    userId: paymentData.studentId,
    role: "student",
    type: "PAYMENT_ACCEPTED",
    title: "Payment Accepted",
    message: `Your payment of ₹${paymentData.amount} was accepted.`,
    data: {
      paymentId,
      amount: paymentData.amount,
    },
  });
};

// admin rejects payment
export const rejectPayment = async (paymentId, paymentData) => {
  await updateDoc(doc(db, "payments", paymentId), {
    status: "REJECTED",
    reviewedAt: serverTimestamp(),
  });

  await notify({
    userId: paymentData.studentId,
    role: "student",
    type: "PAYMENT_REJECTED",
    title: "Payment Rejected",
    message: "Payment verification failed. Please contact admin.",
    data: {
      paymentId,
    },
  });
};
export const getStudentPayments = async (studentId) => {
  const q = query(
    collection(db, "payments"),
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};
