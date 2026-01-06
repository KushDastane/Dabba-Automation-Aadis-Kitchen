import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { addLedgerEntry } from "./ledgerService";
import { notify } from "./notificationService";
import { ADMIN_UID } from "../constants/admin";

// student submits payment
export const submitPayment = async ({ studentId, amount, slipUrl }) => {
  await addDoc(collection(db, "payments"), {
    studentId,
    amount,
    slipUrl,
    status: "PENDING",
    createdAt: serverTimestamp(),
    reviewedBy: null,
    reviewedAt: null,
  });

  await notify({
    userId: ADMIN_UID,
    role: "admin",
    type: "PAYMENT_SUBMITTED",
    title: "Payment Submitted",
    message: "A payment is waiting for verification.",
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
    message: "Your payment has been verified successfully.",
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
  });
};
