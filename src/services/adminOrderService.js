import { db } from "../firebase/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { getTodayMenu } from "./menuService";
import { addLedgerEntry } from "./ledgerService";
import { notify } from "./notificationService";

export const confirmOrder = async (orderId, orderData) => {
  if (orderData.status !== "PENDING") {
    throw new Error("Only pending orders can be confirmed");
  }

  const menu = await getTodayMenu();
  if (!menu) {
    throw new Error("Today's menu not found");
  }

  const mealMenu = menu[orderData.mealType];
  let total = 0;

  Object.entries(orderData.items).forEach(([item, qty]) => {
    const priceKey = `${item}Price`;
    const price = mealMenu[priceKey] || 0;
    total += price * qty;
  });

  const orderRef = doc(db, "orders", orderId);

  await updateDoc(orderRef, {
    calculatedAmount: total,
    status: "CONFIRMED",
    confirmedAt: serverTimestamp(),
  });

  await addLedgerEntry({
    studentId: orderData.studentId,
    type: "DEBIT",
    source: "ORDER",
    sourceId: orderId,
    amount: total,
  });

  await notify({
    userId: orderData.studentId,
    role: "student",
    type: "ORDER_CONFIRMED",
    title: "Order Confirmed",
    message: "Your order has been confirmed. Please collect your dabba.",
  });
};
