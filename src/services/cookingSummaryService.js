import { db } from "../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { getEffectiveMenuDateKey, getEffectiveMealSlot } from "./menuService";

export const getCookingSummaryForCurrentMeal = async () => {
  const dateKey = getEffectiveMenuDateKey();
  const mealSlot = getEffectiveMealSlot();

  if (!mealSlot) return null;

  const q = query(
    collection(db, "orders"),
    where("date", "==", dateKey),
    where("mealType", "==", mealSlot.toUpperCase()),
    where("status", "==", "CONFIRMED")
  );

  const snap = await getDocs(q);

  const summary = {
    halfDabba: 0,
    fullDabba: 0,

    roti: 0,
    sabzi: 0,
    dal: 0,
    rice: 0,

    extraRoti: 0,

    otherItems: {}, // { "Idli": 4 }
  };

  snap.docs.forEach((doc) => {
    const order = doc.data();
    const items = order.items;

    // 🔹 Legacy expanded format
    if (items?.roti !== undefined) {
      summary.roti += items.roti || 0;
      summary.sabzi += items.sabzi || 0;
      summary.dal += items.dal || 0;
      summary.rice += items.rice || 0;
      return;
    }

    // 🔹 Menu based format
    if (!items?.item) return;

    const qty = items.quantity || 1;

    if (items.item === "Half Dabba") {
      summary.halfDabba += qty;
      summary.roti += 4 * qty;
      summary.sabzi += 1 * qty;
    }

    if (items.item === "Full Dabba") {
      summary.fullDabba += qty;
      summary.roti += 4 * qty;
      summary.sabzi += 1 * qty;
      summary.dal += 1 * qty;
      summary.rice += 1 * qty;
    }

    // Extras
    if (items.extras?.roti) {
      summary.extraRoti += items.extras.roti;
      summary.roti += items.extras.roti;
    }

    // OTHER items
    if (items.itemType === "OTHER") {
      summary.otherItems[items.item] =
        (summary.otherItems[items.item] || 0) + qty;
    }
  });

  return summary;
};
